import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { treinoMock } from '../services/treinoMock';
import {
  buscarTreinoAtivo,
  enviarFeedback,
  login,
  redefinirSenha,
  type ParticipanteLogado,
} from '../services/treinoService';
import TelaFeedback from '../telas/TelaFeedback';
import TelaInstrucao from '../telas/TelaInstrucao';
import TelaLogin from '../telas/TelaLogin';
import TelaRedefinirSenha from '../telas/TelaRedefinirSenha';
import TelaTreinoExecucao from '../telas/TelaTreinoExecucao';
import type { RegistroExecucao, TreinoDetalhadoDTO } from '../types/treino';

type Etapa = 'login' | 'redefinirSenha' | 'intro' | 'execucao' | 'feedback';

export default function FluxoTelas() {
  const [etapa, setEtapa] = React.useState<Etapa>('login');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [redefinirSenhaError, setRedefinirSenhaError] = React.useState<string | null>(null);
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null);
  const [participante, setParticipante] = React.useState<ParticipanteLogado | null>(null);
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
  const primeiraInstrucao = treinoParaRender.itens[0]?.exercicio?.instrucao ?? [];
  const mensagemInstrucao = Array.isArray(primeiraInstrucao)
    ? primeiraInstrucao.join('\n')
    : String(primeiraInstrucao);

  const handleFeedbackSubmit = async (rating: number) => {
    if (sessaoId === null) {
      setFeedbackError('Sessão não encontrada para salvar a avaliação.');
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      await enviarFeedback(sessaoId, rating);
      setFeedbackError(null);
      setEtapa('intro');
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : 'Não foi possível salvar sua avaliação.',
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleTreinoFinish = (_registro: RegistroExecucao, sessaoIdFinalizada: number | null) => {
    setSessaoId(sessaoIdFinalizada);
    setEtapa('feedback');
  };

  const renderEtapa = () => {
    switch (etapa) {
      case 'login':
        return (
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
                setEtapa('intro');
              } catch (error) {
                setLoginError(error instanceof Error ? error.message : 'Não foi possível entrar.');
              } finally {
                setIsLoggingIn(false);
              }
            }}
          />
        );
      case 'redefinirSenha':
        return (
          <TelaRedefinirSenha
            isSubmitting={isResettingPassword}
            errorMessage={redefinirSenhaError}
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
        );
      case 'intro':
        return (
          <TelaInstrucao
            emoji="🤖"
            message={
              treinoLoading
                ? 'Carregando instruções do treino...'
                : treinoError
                ? `Erro: ${treinoError}`
                : mensagemInstrucao || 'Olá! Vamos começar o treino de hoje.'
            }
            primaryLabel="Iniciar treino"
            primaryVariant="solid"
            activeDot={0}
            onBackPress={() => setEtapa('login')}
            onPrimaryPress={() => setEtapa('execucao')}
          />
        );
      case 'execucao':
        return (
          <View style={styles.phoneBoundary}>
            {participante ? (
              <TelaTreinoExecucao
                treino={treinoParaRender}
                participanteId={participante.participanteId}
                onFinish={handleTreinoFinish}
                onBackPress={() => setEtapa('intro')}
              />
            ) : (
              <View style={styles.phoneBoundaryPlaceholder}>
                <Text style={styles.placeholderText}>Faça login para iniciar o treino.</Text>
              </View>
            )}
          </View>
        );
      case 'feedback':
        return (
          <TelaFeedback
            onSubmit={handleFeedbackSubmit}
            isSubmitting={isSubmittingFeedback}
            errorMessage={feedbackError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>{renderEtapa()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#eef1f7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneBoundary: {
    width: '100%',
    maxWidth: 390,
    height: 720,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#121826',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
  phoneBoundaryPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6d7482',
    textAlign: 'center',
  },
});
