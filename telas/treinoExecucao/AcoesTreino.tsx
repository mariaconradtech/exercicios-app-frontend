import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { cores } from './cores';

type AcoesTreinoProps = {
  pausado: boolean;
  onTogglePause: () => void;
  onFinalizar: () => void;
};

export default function AcoesTreino({ pausado, onTogglePause, onFinalizar }: AcoesTreinoProps) {
  return (
    <>
      <Pressable style={styles.botaoPausar} onPress={onTogglePause}>
        <Text style={styles.textoPausar}>{pausado ? '▶  Retomar Treino' : '⏸  Pausar Treino'}</Text>
      </Pressable>

      <Pressable style={styles.botaoFinalizar} onPress={onFinalizar}>
        <Text style={styles.textoFinalizar}>✕  Finalizar Treino</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  botaoPausar: {
    marginHorizontal: 20,
    marginTop: 20,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPausar: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.texto,
  },
  botaoFinalizar: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    height: 46,
    borderRadius: 12,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFinalizar: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
