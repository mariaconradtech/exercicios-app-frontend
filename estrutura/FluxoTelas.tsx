import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { treinoMock } from '../services/treinoMock';
import {
  buscarTreinoAtivo,
  enviarFeedback,
  login,
  redefinirSenha,
  salvarAvatar,
  type GeneroAvatar,
  type ParticipanteLogado,
} from '../services/treinoService';
import TelaEscolhaAvatar from '../telas/TelaEscolhaAvatar';
import TelaFeedback from '../telas/TelaFeedback';
import TelaEngajamento from '../telas/TelaEngajamento';
import TelaInstrucao from '../telas/TelaInstrucao';
import TelaLogin from '../telas/TelaLogin';
import TelaRedefinirSenha from '../telas/TelaRedefinirSenha';
import TelaTreinoExecucao from '../telas/TelaTreinoExecucao';
import type { RegistroExecucao, TreinoDetalhadoDTO } from '../types/treino';

type Etapa = 'login' | 'redefinirSenha' | 'escolhaAvatar' | 'app';
type TrainingStep = 'intro' | 'execucao' | 'feedback';
type Aba = 'inicio' | 'historico' | 'treino' | 'ranking' | 'perfil';

const itensAba: Array<{ key: Aba; icon: string; label: string }> = [
  { key: 'inicio', icon: '⌂', label: 'Início' },
  { key: 'historico', icon: '□', label: 'Histórico' },
  { key: 'treino', icon: '▣', label: 'Treino' },
  { key: 'ranking', icon: '🏆', label: 'Ranking' },
  { key: 'perfil', icon: '◌', label: 'Perfil' },
];

export default function FluxoTelas() {
  const [etapa, setEtapa] = React.useState<Etapa>('login');
  const [abaAtiva, setAbaAtiva] = React.useState<Aba>('treino');
  const [screenIndex, setScreenIndex] = React.useState<TrainingStep>('intro');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = React.useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [redefinirSenhaError, setRedefinirSenhaError] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);
  const [participante, setParticipante] = React.useState<ParticipanteLogado | null>(null);
  const [avatarGenero, setAvatarGenero] = React.useState<GeneroAvatar | null>(null);
  const [nomeAvatar, setNomeAvatar] = React.useState<string>('');
  const [treino, setTreino] = React.useState<TreinoDetalhadoDTO | null>(null);
  const [treinoLoading, setTreinoLoading] = React.useState(true);
  const [treinoError, setTreinoError] = React.useState<string | null>(null);
  const [sessaoId, setSessaoId] = React.useState<number | null>(null);

  React.useEffect(() => {
    buscarTreinoAtivo(1)
      .then(setTreino)
      .catch((error) => {
        setTreinoError(error instanceof Error ? error.message : 'Erro ao carregar o treino');
      })
      .finally(() => setTreinoLoading(false));
  }, []);

  const treinoParaRender = treino ?? treinoMock;
  const materiaisTreino = React.useMemo(() => {
    const conjunto = new Set<string>();
    for (const item of treinoParaRender.itens) {
      const instrucao = item.exercicio?.instrucao ?? [];
      const linhas = Array.isArray(instrucao) ? instrucao : [String(instrucao)];
      for (const linha of linhas) {
        const texto = linha.trim();
        if (texto) {
          conjunto.add(texto);
        }
      }
    }
    return Array.from(conjunto);
  }, [treinoParaRender]);

  const duracaoTotalTreinoSegundos = React.useMemo(() => {
    return treinoParaRender.itens.reduce((total, item) => {
      const execucao = item.duracaoEstimadaSegundos * item.series;
      const descanso = item.descansoSegundos * Math.max(0, item.series - 1);
      return total + execucao + descanso;
    }, 0);
  }, [treinoParaRender]);

  const handleBackPress = () => {
    if (screenIndex === 'feedback') {
      setScreenIndex('execucao');
      return;
    }

    if (screenIndex === 'execucao') {
      setScreenIndex('intro');
    }
  };

  const handleTreinoFinish = (_registro: RegistroExecucao, sessaoIdFinalizada: number | null) => {
    setSessaoId(sessaoIdFinalizada);
    setScreenIndex('feedback');
  };

  const handleFeedbackSubmit = async (rating: number) => {
    if (sessaoId === null) {
      setFeedbackError('Sessão não encontrada para salvar a avaliação.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      await enviarFeedback(sessaoId, rating);
      setFeedbackError(null);
      setScreenIndex('intro');
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : 'Não foi possível salvar sua avaliação.',
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const renderTreino = () => (
    <View style={styles.trainingArea}>
      <View style={styles.screensRow}>
        {screenIndex === 'feedback' ? (
          <TelaFeedback
            onBackPress={handleBackPress}
            onSubmit={handleFeedbackSubmit}
            isSubmitting={isSubmittingFeedback}
            errorMessage={feedbackError}
            nomeTreino={treinoParaRender.nome}
            fase={treinoParaRender.fase}
            nivel={treinoParaRender.nivel}
            quantidadeExercicios={treinoParaRender.itens.length}
            duracaoTotalSegundos={duracaoTotalTreinoSegundos}
          />
        ) : screenIndex === 'execucao' ? (
          <View style={styles.phoneBoundary}>
            {participante ? (
              <TelaTreinoExecucao
                treino={treinoParaRender}
                participanteId={participante.participanteId}
                onFinish={handleTreinoFinish}
                onBackPress={handleBackPress}
              />
            ) : (
              <View style={styles.phoneBoundaryPlaceholder}>
                <Text style={styles.placeholderText}>Faça login para iniciar o treino.</Text>
              </View>
            )}
          </View>
        ) : (
          <TelaInstrucao
            emoji={avatarGenero === 'MASCULINO' ? '🏋️' : avatarGenero === 'FEMININO' ? '🧘‍♀️' : '🤖'}
            materiais={materiaisTreino}
            nomeTreino={treinoParaRender.nome}
            fase={treinoParaRender.fase}
            nivel={treinoParaRender.nivel}
            quantidadeExercicios={treinoParaRender.itens.length}
            duracaoTotalSegundos={duracaoTotalTreinoSegundos}
            primaryLabel={treinoLoading ? 'Carregando...' : 'Iniciar treino'}
            primaryVariant="solid"
            onBackPress={handleBackPress}
            onPrimaryPress={() => setScreenIndex('execucao')}
          />
        )}
      </View>
    </View>
  );

  const renderPlaceholder = (titulo: string, descricao: string) => (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{titulo}</Text>
      <Text style={styles.placeholderText}>{descricao}</Text>
    </View>
  );

  if (etapa === 'login') {
    return (
      <SafeAreaView style={styles.appShell}>
        <StatusBar style="dark" />
        <View style={styles.modalScreen}>
          <TelaLogin
            isSubmitting={isLoggingIn}
            errorMessage={loginError}
            onForgotPasswordPress={() => setEtapa('redefinirSenha')}
            onSubmit={async (cpf, senha) => {
              try {
                setIsLoggingIn(true);
                const participanteLogado = await login(cpf, senha);
                setLoginError(null);
                setParticipante(participanteLogado);
                setEtapa('escolhaAvatar');
              } catch (error) {
                setLoginError(error instanceof Error ? error.message : 'Não foi possível entrar.');
              } finally {
                setIsLoggingIn(false);
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (etapa === 'redefinirSenha') {
    return (
      <SafeAreaView style={styles.appShell}>
        <StatusBar style="dark" />
        <View style={styles.modalScreen}>
          <TelaRedefinirSenha
            isSubmitting={isResettingPassword}
            errorMessage={redefinirSenhaError}
            onBackPress={() => setEtapa('login')}
            onSubmit={async (cpf, novaSenha) => {
              try {
                setIsResettingPassword(true);
                await redefinirSenha(cpf, novaSenha);
                setRedefinirSenhaError(null);
                setEtapa('login');
              } catch (error) {
                setRedefinirSenhaError(
                  error instanceof Error ? error.message : 'Não foi possível redefinir a senha.',
                );
              } finally {
                setIsResettingPassword(false);
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (etapa === 'escolhaAvatar') {
    return (
      <SafeAreaView style={styles.appShell}>
        <StatusBar style="dark" />
        <View style={styles.modalScreen}>
          <TelaEscolhaAvatar
            isSubmitting={isSavingAvatar}
            errorMessage={avatarError}
            initialGenero={avatarGenero}
            initialNomeAvatar={nomeAvatar}
            onBackPress={() => setEtapa('login')}
            onContinue={async (genero, nome) => {
              setAvatarGenero(genero);
              setNomeAvatar(nome);
              if (participante) {
                try {
                  setIsSavingAvatar(true);
                  await salvarAvatar(participante.participanteId, genero, nome);
                  setAvatarError(null);
                  setEtapa('app');
                } catch (error) {
                  setAvatarError(
                    error instanceof Error
                      ? error.message
                      : 'Não foi possível salvar o avatar.',
                  );
                } finally {
                  setIsSavingAvatar(false);
                }
              } else {
                setAvatarError(null);
                setEtapa('app');
              }
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const escondeBottomBar = abaAtiva === 'treino' && screenIndex !== 'intro';

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />

      <View style={styles.phoneShellWrap}>
        <View style={styles.phoneShell}>
          <View style={styles.phoneContent}>
            {abaAtiva === 'ranking' && (
              <View style={styles.rankingArea}>
                {participante ? (
                  <TelaEngajamento participanteId={participante.participanteId} />
                ) : (
                  renderPlaceholder(
                    'Ranking',
                    'Faça login para visualizar seu ranking e engajamento.',
                  )
                )}
              </View>
            )}
            {abaAtiva === 'treino' && renderTreino()}
            {abaAtiva === 'inicio' &&
              renderPlaceholder(
                'Início',
                'Resumo geral em construção. Use a aba Ranking para visualizar o engajamento.',
              )}
            {abaAtiva === 'historico' &&
              renderPlaceholder('Histórico', 'Histórico de sessões em construção.')}
            {abaAtiva === 'perfil' &&
              renderPlaceholder('Perfil', 'Informações de perfil em construção.')}
          </View>

          {!escondeBottomBar && (
            <View style={styles.tabBar}>
              {itensAba.map((item) => {
                const ativo = item.key === abaAtiva;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.tabButton}
                    onPress={() => setAbaAtiva(item.key)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tabIcon, ativo && styles.tabIconActive]}>
                      {item.icon}
                    </Text>
                    <Text style={[styles.tabLabel, ativo && styles.tabLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  phoneShellWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  phoneShell: {
    width: '100%',
    maxWidth: 390,
    height: 720,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#121826',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
    flexDirection: 'column',
  },
  phoneContent: {
    flex: 1,
    overflow: 'hidden',
  },
  rankingArea: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  modalScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  trainingArea: {
    flex: 1,
  },
  screensRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  phoneBoundary: {
    flex: 1,
    overflow: 'hidden',
  },
  phoneBoundaryPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  placeholderTitle: {
    fontSize: 28,
    lineHeight: 33,
    color: '#20293a',
    fontWeight: '800',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    lineHeight: 23,
    color: '#5a647b',
    textAlign: 'center',
  },
  tabBar: {
    borderTopWidth: 1,
    borderColor: '#e7ebf4',
    backgroundColor: '#ffffff',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    minWidth: 62,
  },
  tabIcon: {
    fontSize: 20,
    color: '#7d869c',
    marginBottom: 2,
  },
  tabIconActive: {
    color: '#3b5cff',
  },
  tabLabel: {
    fontSize: 12,
    color: '#707a90',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#3b5cff',
    fontWeight: '700',
  },
});
