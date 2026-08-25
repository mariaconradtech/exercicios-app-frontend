import React from 'react';
import { StyleSheet, View } from 'react-native';

import StatBox from './StatBox';

type StatsRowProps = {
  serieAtual: number;
  totalSeries: number;
  duracaoSegundos: number;
  descansoSegundos: number;
};

export default function StatsRow({ serieAtual, totalSeries, duracaoSegundos, descansoSegundos }: StatsRowProps) {
  return (
    <View style={styles.container}>
      <StatBox label="Série" valor={`${serieAtual}/${totalSeries}`} />
      <StatBox label="Duração" valor={`${duracaoSegundos}s`} />
      <StatBox label="Descanso" valor={`${descansoSegundos}s`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
});
