import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  buscarEngajamento,
  buscarInicioParticipante,
  responderPerguntaRefazer,
} from '../services/treinoService';
import type { NivelEngajamentoDTO } from '../types/engajamento';
import type { InicioParticipanteDTO } from '../types/inicio';
import { escolherMensagemRotativa } from '../utils/mensagens';
import AvatarImagem from './AvatarImagem';
import type { FaseTreino } from '../types/treino';

/**
 * Mensagens do item 1 do documento "Mensagens para o app TecnoAging" — Tela
 * inicial (entrada). O texto é mantido exatamente como no documento original.
 */
const MENSAGENS_ENTRADA_NAO_TREINOU = [
  'Que bom te ver aqui! Fazer exercícios regularmente é ter compromisso com a sua saúde. Vamos começar o treino de hoje?',
  'Bem-vindo de volta! Ao fazer seus exercícios hoje, você terá mais força e disposição para fazer o que gosta. Vamos começar?',
  'Você sabia que fazer exercícios te deixa mais disposto e independente por mais tempo? Então vamos começar?',
  'Praticar exercícios regularmente melhora o equilíbrio e previne quedas. Vamos começar o treino de hoje?',
];

const MENSAGENS_ENTRADA_JA_TREINOU = [
  'Você já realizou os exercícios do dia! Parabéns pela sua dedicação!',
  'Você completou a sessão de exercícios do dia. Excelente trabalho! Continue assim!',
  'Parabéns pelo treino de hoje! Você está ficando mais forte a cada dia!',
  'A cada treino, você fica melhor! Parabéns pela dedicação!',
];

const MENSAGENS_ENTRADA_SEMANA_COMPLETA = [
  'Você realizou as sessões de exercícios da semana! Parabéns pela sua dedicação e cuidado com a saúde! Seu próximo treino estará disponível na segunda-feira! Te espero aqui! Até mais',
  'Você está muito comprometido/comprometida com a sua saúde, já realizou todos os treinos da semana! Continue assim! Te vejo na segunda-feira para nosso próximo treino!',
  'Todas as sessões de treino da semana foram concluídas com sucesso! Você está cada dia melhor! Nos encontramos na segunda-feira, para nosso próximo treino!',
  'Parabéns pelos treinos dessa semana! Acompanhe sua evolução na aba de progresso e ranking! Te vejo no nosso próximo treino, até lá!',
];

/**
 * Regra: só 1 treino "que conta" por dia (ver filtroSessoesQueContam no
 * backend). Exibida no lugar do botão "Iniciar Treino" quando `treinouHoje`
 * for true, para não deixar o idoso tentar começar outro treino no mesmo dia
 * sem entender o motivo do bloqueio.
 */
export const MENSAGEM_TREINO_CONCLUIDO_HOJE =
  'Você já completou o treino de hoje! Parabéns pela sua dedicação e cuidado com a saúde. Descanse bem, te espero amanhã para o próximo treino!';

// Tempo que o aviso de boas-vindas fica visível antes de desaparecer sozinho.
// Não é um modal: o idoso nunca fica travado nele, só lê e segue usando o app.
const BANNER_BOAS_VINDAS_DURACAO_MS = 6000;
const BANNER_BOAS_VINDAS_ANIMACAO_MS = 280;
const BANNER_BOAS_VINDAS_DESLOCAMENTO = -140;

function escolherMensagemEntrada(treinouHoje: boolean, semanaCompleta: boolean): string {
  if (semanaCompleta) {
    return escolherMensagemRotativa('entrada-semana-completa', MENSAGENS_ENTRADA_SEMANA_COMPLETA);
  }
  if (treinouHoje) {
    return escolherMensagemRotativa('entrada-ja-treinou', MENSAGENS_ENTRADA_JA_TREINOU);
  }
  return escolherMensagemRotativa('entrada-nao-treinou', MENSAGENS_ENTRADA_NAO_TREINOU);
}

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
  visivel?: boolean;
  /**
   * Avisa o componente pai sempre que soubermos se o participante já treinou
   * hoje. Usado pra aba "Treino" do menu inferior também respeitar a regra de
   * 1 treino por dia, sem precisar duplicar a chamada a /inicio lá.
   */
  onTreinouHojeChange?: (treinouHoje: boolean) => void;
}

export default function TelaInicio({
  participanteId,
  nome,
  avatarGenero,
  proximoTreino,
  proximoTreinoCarregando,
  onIniciarTreino,
  onAbrirPerfil,
  visivel = true,
  onTreinouHojeChange,
}: TelaInicioProps) {
  const hoje = React.useMemo(() => new Date(), []);
  const [mesExibido, setMesExibido] = React.useState({ mes: hoje.getMonth() + 1, ano: hoje.getFullYear() });
  const [dados, setDados] = React.useState<InicioParticipanteDTO | null>(null);
  const [progresso, setProgresso] = React.useState<(NivelEngajamentoDTO & { faseLabel: string }) | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mesCarregando, setMesCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [perguntaRefazerVisivel, setPerguntaRefazerVisivel] = React.useState(false);
  const [respondendoPerguntaRefazer, setRespondendoPerguntaRefazer] = React.useState(false);
  // Dia do calendário tocado pelo participante. O card "Treino realizado" só
  // aparece quando há um dia selecionado com treino — não mais de forma
  // automática. Tocar no mesmo dia de novo esconde o card.
  const [diaSelecionado, setDiaSelecionado] = React.useState<number | null>(null);

  const carregarTudo = React.useCallback(
    async (mes: number, ano: number) => {
      try {
        setErro(null);
        const [inicio, engajamento] = await Promise.all([
          buscarInicioParticipante(participanteId, mes, ano),
          buscarEngajamento(participanteId),
        ]);
        setDados(inicio);
        setProgresso({ ...engajamento.nivel, faseLabel: engajamento.faseLabel });
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
        setMesExibido(mesParaVoltarEmCasoDeErro);
      } finally {
        setMesCarregando(false);
      }
    },
    [participanteId],
  );

  React.useEffect(() => {
    carregarTudo(mesExibido.mes, mesExibido.ano);
  }, [participanteId]);

  const primeiraExecucao = React.useRef(true);
  React.useEffect(() => {
    if (primeiraExecucao.current) {
      primeiraExecucao.current = false;
      return;
    }
    if (visivel) {
      carregarTudo(mesExibido.mes, mesExibido.ano);
    }
  }, [visivel]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarTudo(mesExibido.mes, mesExibido.ano);
  };

  const irParaMesAnterior = () => {
    const mesAtual = mesExibido;
    const novoMes =
      mesAtual.mes === 1 ? { mes: 12, ano: mesAtual.ano - 1 } : { mes: mesAtual.mes - 1, ano: mesAtual.ano };
    setMesExibido(novoMes);
    setDiaSelecionado(null);
    carregarMes(novoMes.mes, novoMes.ano, mesAtual);
  };

  const irParaProximoMes = () => {
    const mesAtual = mesExibido;
    const novoMes =
      mesAtual.mes === 12 ? { mes: 1, ano: mesAtual.ano + 1 } : { mes: mesAtual.mes + 1, ano: mesAtual.ano };
    setMesExibido(novoMes);
    setDiaSelecionado(null);
    carregarMes(novoMes.mes, novoMes.ano, mesAtual);
  };

  const alternarDiaSelecionado = (dia: number) => {
    setDiaSelecionado((atual) => (atual === dia ? null : dia));
  };

  const celulas = React.useMemo(() => gerarCelulas(mesExibido.mes, mesExibido.ano), [mesExibido]);
  const diasComTreinoSet = React.useMemo(() => new Set(dados?.diasComTreino ?? []), [dados]);
  const ehMesAtual = mesExibido.mes === hoje.getMonth() + 1 && mesExibido.ano === hoje.getFullYear();
  const treinoDoDiaSelecionado =
    diaSelecionado !== null ? dados?.treinosPorDia[diaSelecionado] ?? null : null;
  const jaTreinouHoje = dados?.treinouHoje ?? false;

  React.useEffect(() => {
    if (dados) {
      onTreinouHojeChange?.(dados.treinouHoje);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados?.treinouHoje]);

  const primeiroNome = nome.trim().split(' ')[0] || 'Participante';

  // Mensagem da tela de entrada (item 1 do doc de mensagens): varia aleatoriamente
  // entre os textos do grupo certo, mas só é sorteada de novo quando o estado
  // real (treinou hoje / semana completa) muda — não em todo re-render.
  const mensagemEntrada = React.useMemo(
    () => escolherMensagemEntrada(dados?.treinouHoje ?? false, dados?.semanaCompleta ?? false),
    [dados?.treinouHoje, dados?.semanaCompleta],
  );

  // Banner de boas-vindas: um toast não-bloqueante que desliza do topo e some
  // sozinho (ou ao toque). Substitui o antigo cartão fixo, que empurrava o
  // conteúdo e ficava preso na tela — ruim para acessibilidade de idosos.
  const [bannerMontado, setBannerMontado] = React.useState(false);
  const bannerTranslateY = React.useRef(new Animated.Value(BANNER_BOAS_VINDAS_DESLOCAMENTO)).current;
  const bannerOpacidade = React.useRef(new Animated.Value(0)).current;
  const bannerTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Garante que o banner apareça só na primeira entrada no app (login), não
  // toda vez que o participante sai e volta para a aba Início. A TelaInicio
  // fica montada durante toda a sessão (as abas só se escondem, não
  // desmontam), então esta ref dura até o próximo login/recarregamento do app.
  const bannerJaExibidoRef = React.useRef(false);

  const esconderBanner = React.useCallback(() => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(bannerTranslateY, {
        toValue: BANNER_BOAS_VINDAS_DESLOCAMENTO,
        duration: BANNER_BOAS_VINDAS_ANIMACAO_MS,
        useNativeDriver: true,
      }),
      Animated.timing(bannerOpacidade, {
        toValue: 0,
        duration: BANNER_BOAS_VINDAS_ANIMACAO_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setBannerMontado(false);
      }
    });
  }, [bannerOpacidade, bannerTranslateY]);

  const mostrarBanner = React.useCallback(() => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setBannerMontado(true);
    bannerTranslateY.setValue(BANNER_BOAS_VINDAS_DESLOCAMENTO);
    bannerOpacidade.setValue(0);
    Animated.parallel([
      Animated.timing(bannerTranslateY, {
        toValue: 0,
        duration: BANNER_BOAS_VINDAS_ANIMACAO_MS,
        useNativeDriver: true,
      }),
      Animated.timing(bannerOpacidade, {
        toValue: 1,
        duration: BANNER_BOAS_VINDAS_ANIMACAO_MS,
        useNativeDriver: true,
      }),
    ]).start();
    bannerTimeoutRef.current = setTimeout(esconderBanner, BANNER_BOAS_VINDAS_DURACAO_MS);
  }, [bannerOpacidade, bannerTranslateY, esconderBanner]);

  // Mostra o banner uma única vez, assim que os dados da tela de entrada
  // carregam pela primeira vez (abertura do app/login) — não a cada vez que
  // o participante volta para a aba Início.
  React.useEffect(() => {
    if (!loading && dados && !bannerJaExibidoRef.current) {
      bannerJaExibidoRef.current = true;
      mostrarBanner();
    }
    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, loading]);

  const perguntaRefazer = dados?.perguntaRefazer ?? null;

  React.useEffect(() => {
    setPerguntaRefazerVisivel(perguntaRefazer !== null);
  }, [perguntaRefazer?.sessaoId]);

  const responderRefazer = React.useCallback(
    async (quizRefazer: boolean) => {
      if (!perguntaRefazer || respondendoPerguntaRefazer) {
        return;
      }
      setRespondendoPerguntaRefazer(true);
      try {
        await responderPerguntaRefazer(perguntaRefazer.sessaoId);
      } catch {
        // Falha ao registrar a resposta não deve travar a navegação do participante.
      } finally {
        setRespondendoPerguntaRefazer(false);
        setPerguntaRefazerVisivel(false);
      }
      if (quizRefazer) {
        onIniciarTreino();
      }
    },
    [perguntaRefazer, respondendoPerguntaRefazer, onIniciarTreino],
  );

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
    <View style={styles.raiz}>
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
          <AvatarImagem genero={avatarGenero} largura={40} altura={56} raio={10} />
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
              const estaSelecionado = temTreino && dia === diaSelecionado;

              return (
                <View key={dia} style={styles.diaCelula}>
                  <Pressable
                    onPress={temTreino ? () => alternarDiaSelecionado(dia) : undefined}
                    disabled={!temTreino}
                    hitSlop={2}
                    accessibilityRole={temTreino ? 'button' : undefined}
                    accessibilityLabel={temTreino ? `Dia ${dia}, com treino realizado` : `Dia ${dia}`}
                    accessibilityState={temTreino ? { selected: estaSelecionado } : undefined}
                    style={[
                      styles.diaBadge,
                      temTreino && styles.diaBadgeComTreino,
                      ehHoje && styles.diaBadgeHoje,
                      estaSelecionado && styles.diaBadgeSelecionado,
                    ]}
                  >
                    <Text style={[styles.diaTexto, ehHoje && styles.diaTextoHoje]}>{dia}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {treinoDoDiaSelecionado && (
        <View style={styles.treinoCard}>
          <View style={styles.treinoCardRow}>
            <View style={styles.treinoIconeBadge}>
              <MaterialCommunityIcons name="dumbbell" size={20} color="#3b5cff" />
            </View>
            <View style={styles.treinoInfo}>
              <Text style={styles.treinoTitulo}>Treino realizado</Text>
              <Text style={styles.treinoSubtitulo}>
                {tituloTreino(
                  treinoDoDiaSelecionado.nome,
                  treinoDoDiaSelecionado.nivel,
                  treinoDoDiaSelecionado.fase,
                )}
              </Text>
              <Text style={styles.treinoDetalhe}>
                {treinoDoDiaSelecionado.quantidadeExercicios}{' '}
                {treinoDoDiaSelecionado.quantidadeExercicios === 1 ? 'exercício' : 'exercícios'} · Duração:{' '}
                {treinoDoDiaSelecionado.duracaoMinutos} min
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

        {!proximoTreinoCarregando && proximoTreino && jaTreinouHoje && (
          <Text style={styles.treinoConcluidoMensagem}>{MENSAGEM_TREINO_CONCLUIDO_HOJE}</Text>
        )}

        {!proximoTreinoCarregando && proximoTreino && !jaTreinouHoje && (
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
            {progresso ? `${progresso.faseLabel} · Nível ${progresso.nivelAtual}` : 'Nível —'}
          </Text>
          <View style={styles.progressoBarraFundo}>
            <View style={[styles.progressoBarraPreenchida, { width: `${progressoPercentual}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>
            {progresso?.programaConcluido
              ? 'Você concluiu todos os níveis'
              : `${progressoPercentual}% para o próximo nível`}
          </Text>
        </View>
      </View>

      <Modal
        visible={perguntaRefazerVisivel && perguntaRefazer !== null}
        transparent
        animationType="fade"
        onRequestClose={() => responderRefazer(false)}
      >
        <View style={styles.perguntaOverlay}>
          <View style={styles.perguntaCartao}>
            <Text style={styles.perguntaTitulo}>Bom te ver de novo!</Text>
            <Text style={styles.perguntaTexto}>{perguntaRefazer?.mensagem}</Text>
            <View style={styles.perguntaBotoes}>
              <Pressable
                style={styles.perguntaBotaoNao}
                onPress={() => responderRefazer(false)}
                disabled={respondendoPerguntaRefazer}
                accessibilityRole="button"
                accessibilityLabel="Não, agora não"
              >
                <Text style={styles.perguntaBotaoNaoTexto}>Agora não</Text>
              </Pressable>
              <Pressable
                style={styles.perguntaBotaoSim}
                onPress={() => responderRefazer(true)}
                disabled={respondendoPerguntaRefazer}
                accessibilityRole="button"
                accessibilityLabel="Sim, refazer treino"
              >
                <Text style={styles.perguntaBotaoSimTexto}>Sim, refazer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>

      {bannerMontado && (
        <Animated.View
          style={[
            styles.bannerWrapper,
            {
              opacity: bannerOpacidade,
              transform: [{ translateY: bannerTranslateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.bannerCartao}
            onPress={esconderBanner}
            accessibilityRole="button"
            accessibilityLabel="Aviso"
            accessibilityHint="Toque para fechar este aviso"
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.bannerTexto}>{mensagemEntrada}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b5cff',
  },
  bannerWrapper: {
    position: 'absolute',
    top: 64,
    left: 14,
    right: 14,
    zIndex: 50,
    elevation: 8,
  },
  bannerCartao: {
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c5d2ff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#1c2333',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  bannerTexto: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: '#24307a',
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
  diaBadgeSelecionado: {
    borderWidth: 2,
    borderColor: '#3b5cff',
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
  treinoConcluidoMensagem: {
    borderRadius: 14,
    backgroundColor: '#eafaf0',
    borderWidth: 1,
    borderColor: '#bdeccf',
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#1f7a46',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    textAlign: 'center',
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
  perguntaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 33, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  perguntaCartao: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  perguntaTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20283b',
    marginBottom: 8,
  },
  perguntaTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5e677d',
    marginBottom: 20,
  },
  perguntaBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  perguntaBotaoNao: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perguntaBotaoNaoTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20283b',
  },
  perguntaBotaoSim: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#3b5cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perguntaBotaoSimTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
