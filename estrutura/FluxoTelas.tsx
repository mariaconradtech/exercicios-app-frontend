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

import TelaFeedback from '../telas/TelaFeedback';
import TelaInstrucao from '../telas/TelaInstrucao';

type TrainingStep = 'intro' | 'setup' | 'feedback';

export default function FluxoTelas() {
  const [screenIndex, setScreenIndex] = React.useState<TrainingStep>('feedback');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < 900;

  const handleBackPress = () => {
    if (screenIndex === 'setup') {
      setScreenIndex('intro');
      return;
    }

    if (screenIndex === 'feedback') {
      setScreenIndex('setup');
    }
  };

  const handlePrimaryPress = () => {
    if (screenIndex === 'intro') {
      setScreenIndex('setup');
      return;
    }

    if (screenIndex === 'setup') {
      setScreenIndex('feedback');
    }
  };

  const handleFeedbackSubmit = async (rating: number) => {
    const apiBaseUrl = Platform.select({
      android: 'http://10.0.2.2:3000',
      ios: 'http://localhost:3000',
      default: 'http://localhost:3000',
    });

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiBaseUrl}/avaliacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          treino: {
            nome: 'TREINO 1 - NÍVEL 1 - INICIANTE',
            descricao: 'Treino enviado pela tela de feedback do aplicativo.',
            fase: 'INICIANTE',
            nivel: 1,
            quantidadeSemanas: 1,
          },
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Não foi possível salvar a avaliação.');
      }

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
          ) : (
            <TelaInstrucao
              emoji={screenIndex === 'intro' ? '🤖' : '🪑'}
              message={screenIndex === 'intro' ? 'Olá! Vamos começar o treino de hoje.' : 'Pegue uma cadeira'}
              primaryLabel={screenIndex === 'intro' ? 'Próximo' : 'Avaliar'}
              primaryVariant={screenIndex === 'intro' ? 'outline' : 'solid'}
              activeDot={screenIndex === 'intro' ? 0 : 1}
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
