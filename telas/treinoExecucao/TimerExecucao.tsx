import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';

type TimerExecucaoProps = {
  segundosRestantes: number;
  duracaoTotalSegundos: number;
};

export default function TimerExecucao({
  segundosRestantes,
  duracaoTotalSegundos,
}: TimerExecucaoProps) {
  const total = Math.max(duracaoTotalSegundos, 0);
  const restantes = Math.max(Math.min(segundosRestantes, total), 0);
  const progresso = total > 0 ? 1 - restantes / total : 0;
  const percentual = Math.round(progresso * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.legenda}>Progresso do exercício</Text>
      <View style={styles.trilho}>
        <View
          style={[styles.preenchimento, { width: `${percentual}%` }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: percentual }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  legenda: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginBottom: 10,
    textAlign: 'center',
  },
  trilho: {
    width: '100%',
    height: 14,
    borderRadius: 999,
    backgroundColor: cores.azulClaro,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: cores.azul,
  },
});
