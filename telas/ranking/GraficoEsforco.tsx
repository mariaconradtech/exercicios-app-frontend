import React from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import type { PercepcaoEsforcoDTO } from '../../types/engajamento';
import { coresRanking, estiloBase } from './estilo';

const ALTURA = 130;
const MARGEM_ESQUERDA = 24;
const MARGEM_VERTICAL = 10;
const ESCALA_MAX = 10; // escala OMNI de 0 a 10
const MARCAS_Y = [0, 5, 10];

export default function GraficoEsforco({ valores }: { valores: PercepcaoEsforcoDTO[] }) {
  const [largura, setLargura] = React.useState(0);

  const onLayout = (evento: LayoutChangeEvent) => setLargura(evento.nativeEvent.layout.width);

  const areaLargura = Math.max(0, largura - MARGEM_ESQUERDA - 8);
  const areaAltura = ALTURA - MARGEM_VERTICAL * 2;
  const x = (index: number) =>
    MARGEM_ESQUERDA + (valores.length > 1 ? (index * areaLargura) / (valores.length - 1) : areaLargura / 2);
  const y = (valor: number) => MARGEM_VERTICAL + areaAltura - (valor / ESCALA_MAX) * areaAltura;
  const pontos = valores.map((item, index) => `${x(index)},${y(item.valor)}`).join(' ');

  const primeira = valores[0]?.data;
  const ultima = valores[valores.length - 1]?.data;

  return (
    <View style={estiloBase.cartao}>
      <Text style={estiloBase.tituloCartao}>Seu esforço nos treinos</Text>

      {valores.length === 0 ? (
        <Text style={[estiloBase.textoApoio, styles.vazio]}>
          Depois de cada treino você conta como se sentiu. Suas respostas aparecem aqui.
        </Text>
      ) : (
        <>
          <View
            onLayout={onLayout}
            style={styles.area}
            accessible
            accessibilityLabel={`Gráfico de esforço das últimas ${valores.length} sessões. Primeira: ${valores[0].valor}. Última: ${valores[valores.length - 1].valor}, numa escala de 0 a 10.`}
          >
            {largura > 0 && (
              <Svg width={largura} height={ALTURA}>
                {MARCAS_Y.map((marca) => (
                  <React.Fragment key={marca}>
                    <Line
                      x1={MARGEM_ESQUERDA}
                      x2={largura - 8}
                      y1={y(marca)}
                      y2={y(marca)}
                      stroke={coresRanking.trilha}
                      strokeDasharray="4 4"
                    />
                    <SvgText x={0} y={y(marca) + 5} fontSize={14} fill={coresRanking.textoSecundario}>
                      {marca}
                    </SvgText>
                  </React.Fragment>
                ))}
                <Polyline points={pontos} fill="none" stroke={coresRanking.roxo} strokeWidth={3} />
                {valores.map((item, index) => (
                  <Circle
                    key={`${item.data}-${index}`}
                    cx={x(index)}
                    cy={y(item.valor)}
                    r={5}
                    fill="#ffffff"
                    stroke={coresRanking.roxo}
                    strokeWidth={2.5}
                  />
                ))}
              </Svg>
            )}
          </View>

          <View style={styles.datas}>
            <Text style={styles.data}>{primeira}</Text>
            {valores.length > 1 && <Text style={styles.data}>{ultima}</Text>}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    marginTop: 8,
    height: ALTURA,
  },
  datas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: MARGEM_ESQUERDA,
  },
  data: {
    fontSize: 14,
    color: coresRanking.textoSecundario,
  },
  legenda: {
    marginTop: 8,
  },
  vazio: {
    marginTop: 6,
  },
});
