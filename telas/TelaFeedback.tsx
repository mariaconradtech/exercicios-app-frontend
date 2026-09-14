import React from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import type { FaseTreino } from '../types/treino';

type TelaFeedbackProps = {
  onSubmit?: (rating: number) => void | Promise<void>;
  onBackPress?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  nomeTreino: string;
  fase?: FaseTreino;
  nivel?: number;
  quantidadeExercicios: number;
  duracaoTotalSegundos: number;
};

const legendaPorNota: Record<number, string> = {
  0: 'Muito Fácil',
  2: 'Fácil',
  6: 'Um pouco difícil',
  8: 'Difícil',
  10: 'Muito difícil',
};

const avatarPorNota: Partial<Record<number, ReturnType<typeof require>>> = {
  0: require('../assets/bonecos/boneco-1.png'),
  3: require('../assets/bonecos/boneco-2.png'),
  7: require('../assets/bonecos/boneco-3.png'),
  10: require('../assets/bonecos/boneco-4.png'),
};

const tamanhoAvatarPorNota: Record<number, { width: number; height: number }> = {
  0: { width: 94, height: 108 },
  3: { width: 112, height: 108 },
  7: { width: 140, height: 112 },
  10: { width: 148, height: 116 },
};

const notas = Array.from({ length: 11 }, (_, i) => 10 - i);

export default function TelaFeedback({
  onSubmit,
  onBackPress,
  isSubmitting,
  errorMessage,
  nomeTreino,
  fase,
  nivel,
  quantidadeExercicios,
  duracaoTotalSegundos,
}: TelaFeedbackProps) {
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [escalaHeight, setEscalaHeight] = React.useState(0);

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleEscalaLayout = (event: LayoutChangeEvent) => {
    setEscalaHeight(event.nativeEvent.layout.height);
  };

  const handleSliderMove = React.useCallback(
    (locationY: number) => {
      if (escalaHeight <= 0) {
        return;
      }

      const clampedY = Math.min(Math.max(locationY, 0), escalaHeight);
      const nextRating = Math.round(((escalaHeight - clampedY) / escalaHeight) * 10);
      setSelectedRating(nextRating);
    },
    [escalaHeight],
  );

  const sliderPanResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          handleSliderMove(event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          handleSliderMove(event.nativeEvent.locationY);
        },
      }),
    [handleSliderMove],
  );

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.content}>
        <Text style={styles.title}>Como foi o treino?</Text>
        <Text style={styles.subtitle}>
          Avalie o quão intenso esse treino foi para você.
        </Text>

        <View
          style={styles.escalaWrap}
          onLayout={handleEscalaLayout}
          {...sliderPanResponder.panHandlers}
        >
          <View style={styles.linhaVertical} />
          {Object.entries(avatarPorNota).map(([nota, source]) => (
            <Image
              key={nota}
              source={source}
              resizeMode="contain"
              style={[
                styles.avatar,
                tamanhoAvatarPorNota[Number(nota)],
                { top: `${((10 - Number(nota)) / 10) * 100 - 4}%` },
              ]}
            />
          ))}
          <View style={styles.notas}>
            {notas.map((nota) => {
              const isSelected = nota === selectedRating;
              return (
                <Pressable
                  key={nota}
                  onPress={() => handleSelectRating(nota)}
                  hitSlop={8}
                  style={styles.notaLinha}
                >
                  <View style={styles.bullet} />
                  <Text style={[styles.notaTexto, isSelected && styles.notaTextoAtiva]}>
                    {nota}
                    {legendaPorNota[nota] ? ` - ${legendaPorNota[nota]}` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.seletor, { bottom: `${(selectedRating / 10) * 100}%` }]} />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          style={[styles.submitButton, (!onSubmit || isSubmitting) && styles.submitButtonDisabled]}
          onPress={() => {
            if (!onSubmit || isSubmitting) {
              return;
            }
            void onSubmit(selectedRating);
          }}
          disabled={!onSubmit || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Salvando...' : 'Enviar Avaliação'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackCard: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 20,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: '#20222b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6d7482',
    marginBottom: 14,
  },
  escalaWrap: {
    flex: 1,
    minHeight: 470,
    position: 'relative',
    marginBottom: 14,
  },
  linhaVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '44%',
    width: 12,
    borderRadius: 99,
    backgroundColor: '#e2e4e9',
    zIndex: 0,
  },
  avatar: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  notas: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '48%',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  notaLinha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 6,
    height: 6,
    marginRight: 12,
    borderRadius: 3,
    backgroundColor: '#c8c6df',
  },
  notaTexto: {
    fontSize: 18,
    lineHeight: 22,
    color: '#20222b',
  },
  notaTextoAtiva: {
    fontWeight: '700',
  },
  seletor: {
    position: 'absolute',
    left: '44%',
    width: 28,
    height: 28,
    marginLeft: -8,
    marginBottom: -14,
    borderRadius: 14,
    backgroundColor: '#3261e8',
    zIndex: 2,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#e5484d',
    textAlign: 'center',
    marginBottom: 8,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#91a9ec',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
});
