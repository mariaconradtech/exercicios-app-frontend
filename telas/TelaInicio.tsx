import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { buscarEngajamento, buscarInicioParticipante } from '../services/treinoService';
import type { ProximoNivelDTO } from '../types/engajamento';
import type { InicioParticipanteDTO } from '../types/inicio';
import type { FaseTreino } from '../types/treino';

const NOMES_MES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const LABEL_FASE: Record<FaseTreino, string> = {
  INICIANTE: 'INICIANTE',
  INTERMEDIARIO: 'INTERMEDIÁRIO',
  AVANCADO: 'AVANÇADO',
};

function formatarDuracao(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos <= 0) {
    return '~';
  }
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) {
    return `~${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const restoMin = minutos % 60;
  return restoMin === 0 ? `~${horas}h` : `~${horas}h${restoMin}min`;
}

function tituloTreino(nome: string, nivel: number | undefined, faseLabel: string | undefined): string {
  const partes: string[] = [nome.trim() || 'Treino'];
  if (typeof nivel === 'number') {
    partes.push(`NÍVEL ${nivel}`);
  }
  if (faseLabel) {
    partes.push(faseLabel);
  }
  return partes.join(' - ').toUpperCase();
}

function gerarCelulas(mes: number, ano: number): Array<number | null> {
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const totalDias = new Date(ano, mes, 0).getDate();
  const celulas: Array<number | null> = Array.from({ length: primeiroDiaSemana }, () => null);
  for (let dia = 1; dia <= totalDias; dia += 1) {
    celulas.push(dia);
  }
  return celulas;
}

export interface ProximoTreinoResumo {
  nome: string;
  fase?: FaseTreino;
  nivel?: number;
  quantidadeExercicios: number;
  duracaoTotalSegundos: number;
}

interface TelaInicioProps {
  participanteId: number;
  nome: string;
  avatarGenero: 'FEMININO' | 'MASCULINO' | null;
  proximoTreino: ProximoTreinoResumo | null;
  proximoTreinoCarregando: boolean;
  onIniciarTreino: () => void;
  onAbrirPerfil: () => void;
}

export default function TelaInicio({
  participanteId,
  nome,
  avatarGenero,
  proximoTreino,
  proximoTreinoCarregando,
  onIniciarTreino,
  onAbrirPerfil,
}: TelaInicioProps) {
  const hoje = React.useMemo(() => new Date(), []);
  const [mesExibido, setMesExibido] = React.useState({ mes: hoje.getMonth() + 1, ano: hoje.getFullYear() });
  const [dados, setDados] = React.useState<InicioParticipanteDTO | null>(null);
  const [progresso, setProgresso] = React.useState<ProximoNivelDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mesCarregando, setMesCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const carregarTudo = React.useCallback(
    async (mes: number, ano: number) => {
      try {
        setErro(null);
        const [inicio, engajamento] = await Promise.all([
          buscarInicioParticipante(participanteId, mes, ano),
          buscarEngajamento(participanteId),
        ]);
        setDados(inicio);
        setProgresso(engajamento.proximoNivel);
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Erro ao carregar o início');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [participanteId],
  );

  const carregarMes = React.useCallback(
    async (mes: number, ano: number, mesParaVoltarEmCasoDeErro: { mes: number; ano: number }) => {
      try {
        setMesCarregando(true);
        const inicio = await buscarInicioParticipante(participanteId, mes, ano);
        setDados(inicio);
      } catch {
        // Falha ao trocar de mês: volta pro mês anterior em vez de deixar o
        // cabeçalho do calendário e os dados exibidos fora de sincronia.
        setMesExibido(mesParaVoltarEmCasoDeErro);
      } finally {
        setMesCarregando(false);
      }
    },
    [participanteId],
  );

  React.useEffect(() => {
    // Roda só na montagem (ou troca de participante); navegação de mês usa carregarMes.
    carregarTudo(mesExibido.mes, mesExibido.ano);
  }, [participanteId]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarTudo(mesExibido.mes, mesExibido.ano);
  };

  const irParaMesAnterior = () => {
    const mesAtual = mesExibido;
    const novoMes =
      mesAtual.mes === 1 ? { mes: 12, ano: mesAtual.ano - 1 } : { mes: mesAtual.mes - 1, ano: mesAtual.ano };
    setMesExibido(novoMes);
    carregarMes(novoMes.mes, novoMes.ano, mesAtual);
  };

  const irParaProximoMes = () => {
    const mesAtual = mesExibido;
    const novoMes =
      mesAtual.mes === 12 ? { mes: 1, ano: mesAtual.ano + 1 } : { mes: mesAtual.mes + 1, ano: mesAtual.ano };
    setMesExibido(novoMes);
    carregarMes(novoMes.mes, novoMes.ano, mesAtual);
  };

  const celulas = React.useMemo(() => gerarCelulas(mesExibido.mes, mesExibido.ano), [mesExibido]);
  const diasComTreinoSet = React.useMemo(() => new Set(dados?.diasComTreino ?? []), [dados]);
  const ehMesAtual = mesExibido.mes === hoje.getMonth() + 1 && mesExibido.ano === hoje.getFullYear();

  const primeiroNome = nome.trim().split(' ')[0] || 'Participante';
  const emojiAvatar = avatarGenero === 'MASCULINO' ? '🏋️' : avatarGenero === 'FEMININO' ? '🧘‍♀️' : '🤖';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3856df" />
        <Text style={styles.loadingText}>Carregando início...</Text>
      </View>
    );
  }

  if (erro || !dados) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Não foi possível abrir o início</Text>
        <Text style={styles.errorDescription}>
          {erro ?? 'Verifique sua conexão e tente novamente.'}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => carregarTudo(mesExibido.mes, mesExibido.ano)}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const progressoPercentual = progresso ? Math.min(100, Math.max(0, progresso.progressoPercentual)) : 0;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.saudacao}>Olá, {primeiroNome}</Text>
        <Pressable
          style={styles.avatarBotao}
          onPress={onAbrirPerfil}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
        >
          <Text style={styles.avatarBotaoEmoji}>{emojiAvatar}</Text>
        </Pressable>
      </View>

      <View style={styles.calendarioCard}>
        <View style={styles.calendarioHeader}>
          <Pressable
            onPress={irParaMesAnterior}
            disabled={mesCarregando}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
          >
            <Text style={styles.calendarioSeta}>‹</Text>
          </Pressable>
          <Text style={styles.calendarioTitulo}>
            {NOMES_MES[mesExibido.mes - 1]} de {mesExibido.ano}
          </Text>
          <Pressable
            onPress={irParaProximoMes}
            disabled={mesCarregando}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
          >
            <Text style={styles.calendarioSeta}>›</Text>
          </Pressable>
        </View>

        <View style={styles.diasSemanaRow}>
          {DIAS_SEMANA.map((letra, index) => (
            <Text key={`${letra}-${index}`} style={styles.diaSemanaTexto}>
              {letra}
            </Text>
          ))}
        </View>

        {mesCarregando ? (
          <View style={styles.mesCarregandoContainer}>
            <ActivityIndicator size="small" color="#3856df" />
          </View>
        ) : (
          <View style={styles.diasGrid}>
            {celulas.map((dia, index) => {
              if (dia === null) {
                return <View key={`vazio-${index}`} style={styles.diaCelula} />;
              }

              const ehHoje = ehMesAtual && dia === hoje.getDate();
              const temTreino = diasComTreinoSet.has(dia);

              return (
                <View key={dia} style={styles.diaCelula}>
                  <View
                    style={[styles.diaBadge, temTreino && styles.diaBadgeComTreino, ehHoje && styles.diaBadgeHoje]}
                  >
                    <Text style={[styles.diaTexto, ehHoje && styles.diaTextoHoje]}>{dia}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {dados.treinoRealizado && (
        <View style={styles.treinoCard}>
          <View style={styles.treinoCardRow}>
            <View style={styles.treinoIconeBadge}>
              <MaterialCommunityIcons name="dumbbell" size={20} color="#3b5cff" />
            </View>
            <View style={styles.treinoInfo}>
              <Text style={styles.treinoTitulo}>Treino realizado</Text>
              <Text style={styles.treinoSubtitulo}>
                {tituloTreino(
                  dados.treinoRealizado.nome,
                  dados.treinoRealizado.nivel,
                  dados.treinoRealizado.fase,
                )}
              </Text>
              <Text style={styles.treinoDetalhe}>
                {dados.treinoRealizado.quantidadeExercicios}{' '}
                {dados.treinoRealizado.quantidadeExercicios === 1 ? 'exercício' : 'exercícios'} · Duração:{' '}
                {dados.treinoRealizado.duracaoMinutos} min
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.treinoCard}>
        <View style={styles.treinoCardRow}>
          <View style={styles.treinoIconeBadge}>
            <MaterialCommunityIcons name="dumbbell" size={20} color="#3b5cff" />
          </View>
          <View style={styles.treinoInfo}>
            <Text style={styles.treinoTitulo}>Próximo Treino</Text>
            {proximoTreinoCarregando ? (
              <Text style={styles.treinoSubtitulo}>Carregando...</Text>
            ) : proximoTreino ? (
              <>
                <Text style={styles.treinoSubtitulo}>
                  {tituloTreino(
                    proximoTreino.nome,
                    proximoTreino.nivel,
                    proximoTreino.fase ? LABEL_FASE[proximoTreino.fase] : undefined,
                  )}
                </Text>
                <Text style={styles.treinoDetalhe}>
                  {proximoTreino.quantidadeExercicios}{' '}
                  {proximoTreino.quantidadeExercicios === 1 ? 'exercício' : 'exercícios'} ·{' '}
                  {formatarDuracao(proximoTreino.duracaoTotalSegundos)}
                </Text>
              </>
            ) : (
              <Text style={styles.treinoSubtitulo}>Nenhum treino disponível no momento.</Text>
            )}
          </View>
        </View>

        {!proximoTreinoCarregando && proximoTreino && (
          <Pressable
            style={styles.iniciarBotao}
            onPress={onIniciarTreino}
            accessibilityRole="button"
            accessibilityLabel="Iniciar treino"
          >
            <Text style={styles.iniciarBotaoTexto}>Iniciar Treino</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.progressoCard}>
        <View style={styles.progressoIconeBadge}>
          <Feather name="trending-up" size={20} color="#11a84f" />
        </View>
        <View style={styles.progressoInfo}>
          <Text style={styles.progressoTitulo}>Seu Progresso</Text>
          <Text style={styles.progressoNivel}>
            Nível {progresso?.nivelAtual ?? '—'}
          </Text>
          <View style={styles.progressoBarraFundo}>
            <View style={[styles.progressoBarraPreenchida, { width: `${progressoPercentual}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>
            {progresso?.proximoNivel
              ? `${progressoPercentual}% para o próximo nível`
              : 'Nível máximo atingido'}
          </Text>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 24,
    gap: 12,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  saudacao: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#20283b',
  },
  avatarBotao: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3b5cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBotaoEmoji: {
    fontSize: 18,
  },
  calendarioCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  calendarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#20283b',
  },
  calendarioSeta: {
    fontSize: 20,
    color: '#5e677d',
    paddingHorizontal: 8,
  },
  diasSemanaRow: {
    flexDirection: 'row',
  },
  diaSemanaTexto: {
    flexBasis: '14.2857%',
    textAlign: 'center',
    fontSize: 12,
    color: '#9099ac',
    marginBottom: 4,
  },
  diasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mesCarregandoContainer: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  diaCelula: {
    flexBasis: '14.2857%',
    alignItems: 'center',
    paddingVertical: 3,
  },
  diaBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaBadgeComTreino: {
    backgroundColor: '#d5f2df',
  },
  diaBadgeHoje: {
    backgroundColor: '#3b5cff',
  },
  diaTexto: {
    fontSize: 13,
    color: '#3c4658',
  },
  diaTextoHoje: {
    color: '#ffffff',
    fontWeight: '700',
  },
  treinoCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  treinoCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  treinoIconeBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treinoInfo: {
    flex: 1,
  },
  treinoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#20283b',
  },
  treinoSubtitulo: {
    marginTop: 2,
    fontSize: 12,
    color: '#5e677d',
  },
  treinoDetalhe: {
    marginTop: 4,
    fontSize: 13,
    color: '#3c4658',
  },
  iniciarBotao: {
    borderRadius: 24,
    backgroundColor: '#3b5cff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  iniciarBotaoTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  progressoCard: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  progressoIconeBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#e4f8eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressoInfo: {
    flex: 1,
  },
  progressoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#20283b',
  },
  progressoNivel: {
    marginTop: 2,
    fontSize: 13,
    color: '#5e677d',
  },
  progressoBarraFundo: {
    marginTop: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e6eaf4',
    overflow: 'hidden',
  },
  progressoBarraPreenchida: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#11a84f',
  },
  progressoTexto: {
    marginTop: 6,
    fontSize: 12,
    color: '#7a8298',
  },
});
