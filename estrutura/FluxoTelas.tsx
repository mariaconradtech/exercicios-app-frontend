import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { buscarTreinoAtivo, enviarFeedback, resolverApiBaseUrl } from '../services/treinoService';
import TelaFeedback from '../telas/TelaFeedback';
import TelaInstrucao from '../telas/TelaInstrucao';
import TelaTreinoExecucao from '../telas/TelaTreinoExecucao';
import { treinoMock } from '../services/treinoMock';
import type { TreinoDetalhadoDTO } from '../types/treino';

type TrainingStep = 'intro' | 'execucao' | 'feedback';

export default function FluxoTelas() {
  const [screenIndex, setScreenIndex] = React.useState<TrainingStep>('intro');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [treino, setTreino] = React.useState<TreinoDetalhadoDTO | null>(null);
  const [treinoLoading, setTreinoLoading] = React.useState(true);
  const [treinoError, setTreinoError] = React.useState<string | null>(null);
  const [sessaoId, setSessaoId] = React.useState<number | null>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 900;

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

  const handleBackPress = () => {
    if (screenIndex === 'feedback') {
      setScreenIndex('execucao');
      return;
    }

    if (screenIndex === 'execucao') {
      setScreenIndex('intro');
    }
  };

  const handlePrimaryPress = () => {
    if (screenIndex === 'intro') {
      setScreenIndex('execucao');
    }
  };

  const handleFeedbackSubmit = async (rating: number) => {
    if (sessaoId === null) {
      Alert.alert('Erro ao salvar', 'Sessão não encontrada para salvar a avaliação.');
      return;
    }

    try {
      setIsSubmitting(true);
      await enviarFeedback(sessaoId, rating);
      setScreenIndex('intro');
    } catch (error) {
      Alert.alert(
        'Erro ao salvar',
        error instanceof Error ? error.message : 'Não foi possível salvar sua avaliação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Instruções</Text>
          <Text style={styles.heroTitle}>Sequência de treino</Text>
          <Text style={styles.heroDescription}>
            Uma interface limpa para orientar a pessoa durante o início do treino, com progresso,
            áudio e chamada para a próxima ação.
          </Text>
        </View>

        <View style={[styles.screensRow, isCompact && styles.screensColumn]}>
        {screenIndex === 'feedback' ? (
          <TelaFeedback
            onBackPress={handleBackPress}
            onSubmit={handleFeedbackSubmit}
            isSubmitting={isSubmitting}
          />
        ) : screenIndex === 'execucao' ? (
          <TelaTreinoExecucao
            treino={treinoParaRender}
            onBackPress={handleBackPress}
            onFinish={(registro, sessaoId) => {
              setSessaoId(sessaoId);
              setScreenIndex('feedback');
            }}
          />
        ) : (
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
            onBackPress={handleBackPress}
            onPrimaryPress={handlePrimaryPress}
          />
        )}
        </View>
      </ScrollView>
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
  },
  hero: {
    width: '100%',
    maxWidth: 980,
    marginBottom: 22,
  },
  heroLabel: {
    fontSize: 16,
    color: '#8a90a0',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#152033',
    marginBottom: 8,
  },
  heroDescription: {
    maxWidth: 620,
    fontSize: 15,
    lineHeight: 22,
    color: '#556070',
  },
  screensRow: {
    width: '100%',
    maxWidth: 980,
    flexDirection: 'row',
    gap: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  screensColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
