import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
  0: 'Extremamente Fácil',
  2: 'Fácil',
  4: 'Um Pouco Fácil',
  6: 'Um Pouco Difícil',
  8: 'Difícil',
  10: 'Extremamente Difícil',
};

const avatarPorNota: Record<number, ReturnType<typeof require>> = {
  0: require('../assets/bonecos/boneco-1.png'),
  3: require('../assets/bonecos/boneco-2.png'),
  7: require('../assets/bonecos/boneco-3.png'),
  10: require('../assets/bonecos/boneco-4.png'),
};

const tamanhoAvatarPorNota: Record<number, { width: number; height: number }> = {
  0: { width: 40, height: 40 },
  3: { width: 44, height: 48 },
  7: { width: 58, height: 63 },
  10: { width: 70, height: 76 },
};

const notas = Array.from({ length: 11 }, (_, i) => i);
const POSICAO_ESCALA = {
  inicioX: 8,
  fimX: 98,
  inicioY: 18,
  fimY: 68,
};

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

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
  };

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.content}>
        <Pressable onPress={onBackPress} style={styles.backButton} hitSlop={10}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Como foi o treino?</Text>
        <Text style={styles.subtitle}>Avalie o quão intenso esse treino foi para você</Text>

        <View style={styles.escalaWrap}>
          <View style={styles.linhaDiagonal} />

           {notas.map((nota) => {
              const isSelected = nota === selectedRating;
              const avatarSource = avatarPorNota[nota];
              const tamanhoAvatar = tamanhoAvatarPorNota[nota];
              const proporcao = nota / 10;
              const esquerda = POSICAO_ESCALA.inicioX +
                (POSICAO_ESCALA.fimX - POSICAO_ESCALA.inicioX) * proporcao;
              const base = POSICAO_ESCALA.inicioY +
                (POSICAO_ESCALA.fimY - POSICAO_ESCALA.inicioY) * proporcao;

              return (
                <View
                  key={nota}
                  style={[styles.degrau, { left: `${esquerda}%`, bottom: `${base}%` }]}
                >
                  <View style={styles.avatarSlot}>
                    {avatarSource ? (
                      <Image source={avatarSource} style={tamanhoAvatar} resizeMode="contain" />
                    ) : null}
                  </View>

                  <Pressable
                    onPress={() => handleSelectRating(nota)}
                    hitSlop={8}
                    style={styles.notaPressable}
                  >
                    <Text style={[styles.notaTexto, isSelected && styles.notaTextoAtiva]}>
                      {nota}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
        </View>

        <Text style={styles.legendaSelecionada}>
          {legendaPorNota[selectedRating] ?? `Nota ${selectedRating}`}
        </Text>

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
    minHeight: 720,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#121826',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingRight: 12,
    paddingVertical: 2,
    marginBottom: 4,
  },
  backArrow: {
    color: '#20222b',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#20222b',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#6d7482',
    marginBottom: 18,
  },
  escalaWrap: {
    flex: 1,
    minHeight: 360,
    position: 'relative',
    marginTop: 8,
    marginBottom: 20,
    paddingBottom: 28,
  },
  linhaDiagonal: {
    position: 'absolute',
    bottom: '43%',
    left: '-5%',
    width: '116%',
    height: 6,
    borderRadius: 99,
    backgroundColor: '#1d2433',
    transform: [{ rotate: '-37deg' }],
    zIndex: 0,
  },
  degrau: {
    position: 'absolute',
    width: 70,
    height: 110,
    alignItems: 'center',
    transform: [{ translateX: -35 }, { translateY: 55 }],
    zIndex: 1,
  },
  avatarSlot: {
    position: 'absolute',
    top: -18,
    width: 70,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notaPressable: {
    position: 'absolute',
    top: 66,
    paddingVertical: 6,
    paddingHorizontal: 5,
    zIndex: 1,
  },
  notaTexto: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#20222b',
  },
  notaTextoAtiva: {
    color: '#4467f2',
    fontSize: 26,
    lineHeight: 30,
  },
  legendaSelecionada: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: '#4467f2',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#e5484d',
    textAlign: 'center',
    marginBottom: 10,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4467f2',
    marginTop: 12,
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
