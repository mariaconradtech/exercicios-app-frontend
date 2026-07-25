import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';
import { formatTempo } from '../../utils/formatTempo';

type TimerExecucaoProps = {
  segundosRestantes: number;
};

export default function TimerExecucao({ segundosRestantes }: TimerExecucaoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.legenda}>Tempo restante</Text>
      <Text style={styles.valor}>{formatTempo(segundosRestantes)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legenda: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginBottom: 6,
  },
  valor: {
    fontSize: 64,
    fontWeight: '800',
    color: cores.azul,
  },
});
