import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { buscarEngajamento } from '../services/treinoService';
import type { EngajamentoDTO } from '../types/engajamento';

interface TelaEngajamentoProps {
  participanteId: number;
}

const medalhasCabecalho = ['🥉', '⭐', '🥉', '🏆'];

function calcularPontos(
  valores: Array<{ data: string; valor: number }> | undefined,
  largura: number,
  altura: number,
): string {
  if (!valores || valores.length === 0) {
    return '';
  }

  const maxY = 10;
  const minY = 0;
  const spacing = valores.length > 1 ? largura / (valores.length - 1) : largura;

  return valores
    .map((item, index) => {
      const x = index * spacing;
      const normalizado = (item.valor - minY) / (maxY - minY);
      const y = altura - normalizado * altura;
      return `${x},${y}`;
    })
    .join(' ');
}

export default function TelaEngajamento({ participanteId }: TelaEngajamentoProps) {
  const [dados, setDados] = React.useState<EngajamentoDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [mostrarCelebracao, setMostrarCelebracao] = React.useState(false);
  const celebracaoAnim = React.useRef(new Animated.Value(0)).current;
  const jaCelebrouRef = React.useRef(false);

  const carregar = React.useCallback(async () => {
    try {
      setErro(null);
      const resposta = await buscarEngajamento(participanteId);
      setDados(resposta);

      if (resposta.mudouCategoria && !jaCelebrouRef.current) {
        jaCelebrouRef.current = true;
        setMostrarCelebracao(true);
        celebracaoAnim.setValue(0);

        Animated.sequence([
          Animated.timing(celebracaoAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.back(1.6)),
            useNativeDriver: true,
          }),
          Animated.delay(1200),
          Animated.timing(celebracaoAnim, {
            toValue: 0,
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setMostrarCelebracao(false);
        });
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar engajamento');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [celebracaoAnim, participanteId]);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  const onRefresh = () => {
    setRefreshing(true);
    carregar();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3856df" />
        <Text style={styles.loadingText}>Carregando engajamento...</Text>
      </View>
    );
  }

  if (erro || !dados) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Não foi possível abrir o ranking</Text>
        <Text style={styles.errorDescription}>
          {erro ?? 'Verifique sua conexão e tente novamente.'}
        </Text>
        <Pressable style={styles.retryButton} onPress={carregar}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const chartWidth = 280;
  const chartHeight = 110;
  const pontos = calcularPontos(dados.percepcaoEsforco ?? [], chartWidth, chartHeight);
  const progresso = Math.min(100, Math.max(0, dados.proximoNivel.progressoPercentual));

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Ranking & Progresso</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🏋️</Text>
          <Text style={styles.heroText}>{dados.mensagemCelebracao}</Text>
        </View>

        <View style={styles.rankingSection}>
          <View style={styles.headerIcons}>
            {medalhasCabecalho.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.headerIconText}>
                {item}
              </Text>
            ))}
          </View>

          {dados.ranking.map((linha, index) => (
            <View key={linha.participanteId} style={[styles.rankingRow, index % 2 === 0 && styles.altRow]}>
              <Text style={styles.nomeCol} numberOfLines={1}>
                {linha.nomeAvatar || linha.nome}
              </Text>
              <Text style={styles.valorCol}>{linha.bronze}</Text>
              <Text style={styles.valorCol}>{linha.estrelas}</Text>
              <Text style={styles.valorCol}>{linha.medalhas}</Text>
              <Text style={styles.valorCol}>{linha.trofeus}</Text>
            </View>
          ))}
        </View>

        <View style={styles.nivelCard}>
          <View style={styles.nivelLeft}>
            <Text style={styles.iconBadge}>↗</Text>
            <View>
              <Text style={styles.nivelLabel}>Nível Atual</Text>
              <Text style={styles.nivelAtual}>{dados.proximoNivel.nivelAtual}</Text>
              <Text style={styles.nivelHint}>
                Faltam {dados.proximoNivel.treinosFaltantes} treino(s) para
                {dados.proximoNivel.proximoNivel ? ` ${dados.proximoNivel.proximoNivel}` : ' manter o topo'}
              </Text>
            </View>
          </View>

          <View style={styles.progressCol}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressValue}>{progresso}%</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Sua percepção de esforço nas últimas sessões</Text>

          <View style={styles.chartInner}>
            <Svg width={chartWidth} height={chartHeight}>
              {[0, 3, 6, 9].map((nivel) => {
                const y = chartHeight - (nivel / 10) * chartHeight;
                return (
                  <Line
                    key={`h-${nivel}`}
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#d3d7e5"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                );
              })}

              {dados.percepcaoEsforco.map((_, index) => {
                const x =
                  dados.percepcaoEsforco.length > 1
                    ? (index * chartWidth) / (dados.percepcaoEsforco.length - 1)
                    : chartWidth / 2;
                return (
                  <Line
                    key={`v-${index}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={chartHeight}
                    stroke="#eaecf5"
                    strokeDasharray="3 6"
                    strokeWidth={1}
                  />
                );
              })}

              <Polyline fill="none" points={pontos} stroke="#7b67ff" strokeWidth={2.4} />

              {dados.percepcaoEsforco.map((item, index) => {
                const x =
                  dados.percepcaoEsforco.length > 1
                    ? (index * chartWidth) / (dados.percepcaoEsforco.length - 1)
                    : chartWidth / 2;
                const y = chartHeight - (item.valor / 10) * chartHeight;
                return <Circle key={`c-${item.data}-${index}`} cx={x} cy={y} r={4} fill="#ffffff" stroke="#7b67ff" strokeWidth={2} />;
              })}
            </Svg>

            <View style={styles.xLabelsRow}>
              {dados.percepcaoEsforco.map((item, index) => (
                <Text key={`${item.data}-${index}`} style={styles.xLabel}>
                  {item.data}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {mostrarCelebracao && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.celebracaoOverlay,
            {
              opacity: celebracaoAnim,
              transform: [
                {
                  scale: celebracaoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.celebracaoEmoji}>🎉</Text>
          <Text style={styles.celebracaoTexto}>Você subiu de categoria!</Text>
          <Text style={styles.celebracaoSubtexto}>Novo pódio: {dados.categoriaAtual}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    color: '#556078',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#20283b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    textAlign: 'center',
    color: '#6b7388',
    fontSize: 15,
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#4467f2',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    color: '#242b38',
    marginBottom: 2,
  },
  heroCard: {
    borderWidth: 1,
    borderColor: '#bac8ff',
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroEmoji: {
    fontSize: 26,
  },
  heroText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#2a3342',
    fontWeight: '700',
  },
  rankingSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#e8ecf6',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
    marginLeft: 100,
  },
  headerIconText: {
    fontSize: 18,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  altRow: {
    backgroundColor: '#dff3ff',
  },
  nomeCol: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#212e80',
    fontStyle: 'italic',
    fontWeight: '700',
    paddingRight: 4,
  },
  valorCol: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    color: '#212e80',
    fontStyle: 'italic',
    fontWeight: '700',
  },
  nivelCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nivelLeft: {
    flexDirection: 'row',
    gap: 10,
    flexShrink: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e4f8eb',
    textAlign: 'center',
    lineHeight: 38,
    fontSize: 20,
    color: '#0cab4d',
  },
  nivelLabel: {
    color: '#767f95',
    fontSize: 12,
    marginBottom: 2,
  },
  nivelAtual: {
    color: '#20283b',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  nivelHint: {
    color: '#5e677d',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
    maxWidth: 180,
  },
  progressCol: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: '#7a8298',
  },
  progressValue: {
    marginTop: 2,
    color: '#11a84f',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  chartContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  chartTitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#1f2735',
    marginBottom: 6,
    fontWeight: '600',
  },
  chartInner: {
    alignItems: 'center',
  },
  xLabelsRow: {
    marginTop: 6,
    width: 280,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    fontSize: 11,
    color: '#5f6880',
  },
  celebracaoOverlay: {
    position: 'absolute',
    top: '35%',
    left: 24,
    right: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9e2ff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
  celebracaoEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  celebracaoTexto: {
    fontSize: 20,
    lineHeight: 24,
    color: '#1d2636',
    fontWeight: '800',
    textAlign: 'center',
  },
  celebracaoSubtexto: {
    marginTop: 6,
    fontSize: 14,
    color: '#47526a',
    textAlign: 'center',
  },
});