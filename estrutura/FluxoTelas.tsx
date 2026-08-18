import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { buscarTreinoAtivo, enviarFeedback } from '../services/treinoService';
import TelaFeedback from '../telas/TelaFeedback';
import TelaEngajamento from '../telas/TelaEngajamento';
import TelaInstrucao from '../telas/TelaInstrucao';
import TelaTreinoExecucao from '../telas/TelaTreinoExecucao';
import { treinoMock } from '../services/treinoMock';
import type { TreinoDetalhadoDTO } from '../types/treino';

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
  const [abaAtiva, setAbaAtiva] = React.useState<Aba>('ranking');
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

  const renderTreino = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Treino guiado</Text>
        <Text style={styles.heroTitle}>Execução orientada</Text>
        <Text style={styles.heroDescription}>
          Acompanhe cada etapa com instruções, progresso e feedback de esforço ao final da sessão.
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
            onFinish={(registro, novaSessaoId) => {
              setSessaoId(novaSessaoId);
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
  );

  const renderPlaceholder = (titulo: string, descricao: string) => (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{titulo}</Text>
      <Text style={styles.placeholderText}>{descricao}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar style="dark" />

      <View style={styles.mainArea}>
        {abaAtiva === 'ranking' && <TelaEngajamento participanteId={1} />}
        {abaAtiva === 'treino' && renderTreino()}
        {abaAtiva === 'inicio' &&
          renderPlaceholder('Início', 'Resumo geral em construção. Use a aba Ranking para visualizar o engajamento.')}
        {abaAtiva === 'historico' && renderPlaceholder('Histórico', 'Histórico de sessões em construção.')}
        {abaAtiva === 'perfil' && renderPlaceholder('Perfil', 'Informações de perfil em construção.')}
      </View>

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
              <Text style={[styles.tabIcon, ativo && styles.tabIconActive]}>{item.icon}</Text>
              <Text style={[styles.tabLabel, ativo && styles.tabLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainArea: {
    flex: 1,
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
    color: '#5f6880',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#1f2735',
    marginBottom: 8,
  },
  heroDescription: {
    maxWidth: 620,
    fontSize: 15,
    lineHeight: 22,
    color: '#59647d',
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
