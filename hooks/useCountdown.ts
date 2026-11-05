import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  onComplete?: () => void;
}

interface UseCountdownResult {
  remaining: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (nextDurationSeconds: number) => void;
}

// Pequena folga para o tick cair logo depois da virada do segundo, nunca antes.
const MARGEM_TICK_MS = 5;

function msAteProximaVirada(restanteMs: number): number {
  if (restanteMs <= 0) {
    return 0;
  }
  const resto = restanteMs % 1000;
  return (resto === 0 ? 1000 : resto) + MARGEM_TICK_MS;
}

// Timer baseado em timestamp de deadline (não em contador decrescente).
// Guarda o instante em que deve zerar e recalcula o restante a partir de
// Date.now() a cada tick — imune a drift e ao throttling de timers do RN
// quando o app volta do background. Cada tick é agendado para o instante
// exato em que o segundo exibido muda, para o display e os bipes ficarem
// alinhados ao relógio real.
export function useCountdown(durationSeconds: number, opts?: UseCountdownOptions): UseCountdownResult {
  const onCompleteRef = useRef(opts?.onComplete);
  onCompleteRef.current = opts?.onComplete;

  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const endAtRef = useRef<number | null>(null);
  // Guardado em ms para pausar/retomar não arredondar o tempo restante.
  const restanteMsNaPausaRef = useRef(durationSeconds * 1000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const tick = useCallback(
    function tickFn() {
      timeoutRef.current = null;
      if (endAtRef.current === null) {
        return;
      }

      const restanteMs = endAtRef.current - Date.now();
      const next = Math.max(0, Math.ceil(restanteMs / 1000));
      setRemaining(next);

      if (next <= 0) {
        clearTimer();
        setIsRunning(false);
        onCompleteRef.current?.();
        return;
      }

      timeoutRef.current = setTimeout(tickFn, msAteProximaVirada(restanteMs));
    },
    [clearTimer],
  );

  const start = useCallback(() => {
    clearTimer();
    endAtRef.current = Date.now() + restanteMsNaPausaRef.current;
    setIsRunning(true);
    timeoutRef.current = setTimeout(tick, msAteProximaVirada(restanteMsNaPausaRef.current));
  }, [clearTimer, tick]);

  const pause = useCallback(() => {
    if (endAtRef.current !== null) {
      restanteMsNaPausaRef.current = Math.max(0, endAtRef.current - Date.now());
      setRemaining(Math.ceil(restanteMsNaPausaRef.current / 1000));
      endAtRef.current = null;
    }
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(
    (nextDurationSeconds: number) => {
      clearTimer();
      endAtRef.current = null;
      restanteMsNaPausaRef.current = nextDurationSeconds * 1000;
      setRemaining(nextDurationSeconds);
      setIsRunning(false);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return { remaining, isRunning, start, pause, resume: start, reset };
}
