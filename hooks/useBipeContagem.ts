import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const SEGUNDOS_AVISO = 3;

// Toca um bipe a cada segundo nos últimos SEGUNDOS_AVISO segundos do timer.
// Só dispara quando `remaining` muda, então pausar/retomar não repete o bipe.
// Retorna `tocarBipe` para avisos sonoros avulsos.
export function useBipeContagem(remaining: number, ativo: boolean): { tocarBipe: () => void } {
  const somRef = useRef<Promise<Audio.Sound | null> | null>(null);
  const ativoRef = useRef(ativo);
  ativoRef.current = ativo;
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;

  useEffect(() => {
    let cancelado = false;
    const carregamento = (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true });
        const { sound } = await Audio.Sound.createAsync(require('../assets/sons/bipe.wav'));
        if (cancelado) {
          await sound.unloadAsync();
          return null;
        }
        return sound;
      } catch {
        return null;
      }
    })();
    somRef.current = carregamento;

    return () => {
      cancelado = true;
      somRef.current = null;
      carregamento.then((som) => som?.unloadAsync()).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!ativoRef.current || remaining < 1 || remaining > SEGUNDOS_AVISO) {
      return;
    }
    // Se o som ainda estava carregando, descarta bipes de segundos que já passaram
    // (ou de um timer que foi pausado nesse meio-tempo) para não tocarem fora de hora.
    somRef.current
      ?.then((som) => {
        if (ativoRef.current && remainingRef.current === remaining) {
          return som?.replayAsync();
        }
      })
      .catch(() => {});
  }, [remaining]);

  const tocarBipe = useCallback(() => {
    somRef.current?.then((som) => som?.replayAsync()).catch(() => {});
  }, []);

  return { tocarBipe };
}
