import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { cores } from './cores';

type AnelProgressoProps = {
  valor: number;
  progresso: number; // 0..1 — fração de tempo restante (1 = anel cheio, 0 = vazio)
  tamanho?: number;
};

export default function AnelProgresso({ valor, progresso, tamanho = 260 }: AnelProgressoProps) {
  const espessura = 10;
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const fracaoVisivel = Math.max(0, Math.min(1, progresso));
  const offset = circunferencia * (1 - fracaoVisivel);

  return (
    <View style={[styles.container, { width: tamanho, height: tamanho }]}>
      <Svg width={tamanho} height={tamanho}>
        <Circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke={cores.azul}
          strokeWidth={espessura}
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin={`${tamanho / 2}, ${tamanho / 2}`}
        />
      </Svg>
      <View style={styles.centro} pointerEvents="none">
        <Text style={styles.valor}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valor: {
    fontSize: 64,
    fontWeight: '800',
    color: cores.azul,
  },
});
