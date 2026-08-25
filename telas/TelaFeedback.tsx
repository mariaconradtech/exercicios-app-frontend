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
  0: { width: 32, height: 35 },
  3: { width: 44, height: 48 },
  7: { width: 58, height: 63 },
  10: { width: 70, height: 76 },
};

const notas = Array.from({ length: 11 }, (_, i) => i);
const DEGRAU_PX = 26;

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

  const tituloHeader = React.useMemo(() => {
    const partes: string[] = [nomeTreino.trim() || 'Treino'];
    if (typeof nivel === 'number') {
      partes.push(`NÍVEL ${nivel}`);
    }
    if (fase) {
      partes.push(LABEL_FASE[fase]);
    }
    return partes.join(' - ').toUpperCase();
  }, [nomeTreino, nivel, fase]);

  const subtituloHeader = `${quantidadeExercicios} ${
    quantidadeExercicios === 1 ? 'exercício' : 'exercícios'
  } - ${formatarDuracao(duracaoTotalSegundos)}`;

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.phoneHeader}>
        <View style={styles.statusRow}>
          <Pressable onPress={onBackPress} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.statusPill} />
        </View>

        <Text style={styles.screenTitle} numberOfLines={2}>
          {tituloHeader}
        </Text>
        <Text style={styles.screenSubtitle}>{subtituloHeader}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Como foi o treino?</Text>
        <Text style={styles.subtitle}>Avalie o quão intenso esse treino foi para você</Text>

        <View style={styles.escalaWrap}>
          <View style={styles.linhaDiagonal} />

          <View style={styles.degrausRow}>
            {notas.map((nota) => {
              const isSelected = nota === selectedRating;
              const avatarSource = avatarPorNota[nota];
              const tamanhoAvatar = tamanhoAvatarPorNota[nota];

              return (
                <View key={nota} style={[styles.degrau, { marginBottom: nota * DEGRAU_PX }]}>
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
                    <Text style={[styles.notaTexto, isSelected && styles.notaTextoAtiva]}>{nota}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
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
  },
  phoneHeader: {
    backgroundColor: '#4467f2',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  backArrow: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
  },
  statusPill: {
    width: 40,
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  screenSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#20222b',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#6d7482',
    marginBottom: 18,
  },
  escalaWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 40,
  },
  linhaDiagonal: {
    position: 'absolute',
    left: '50%',
    bottom: 130,
    width: 360,
    marginLeft: -180,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#1d2433',
    transform: [{ rotate: '-40deg' }],
    zIndex: 0,
  },
  degrausRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  degrau: {
    alignItems: 'center',
    width: 28,
    zIndex: 1,
  },
  avatarSlot: {
    height: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  notaPressable: {
    marginTop: 26,
    paddingVertical: 4,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  notaTexto: {
    fontSize: 20,
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
    fontSize: 18,
    lineHeight: 24,
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
