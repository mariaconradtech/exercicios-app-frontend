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
  0: { width: 38, height: 42 },
  3: { width: 50, height: 55 },
  7: { width: 62, height: 68 },
  10: { width: 74, height: 82 },
};

const notas = Array.from({ length: 11 }, (_, i) => i);

const LABEL_FASE: Record<FaseTreino, string> = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado',
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

  const legendaTreino = React.useMemo(() => {
    const partes: string[] = [nomeTreino.trim() || 'Treino'];
    if (typeof nivel === 'number') {
      partes.push(`Nível ${nivel}`);
    }
    if (fase) {
      partes.push(LABEL_FASE[fase]);
    }
    return partes.join(' • ');
  }, [nomeTreino, nivel, fase]);

  const subLegenda = `${quantidadeExercicios} ${
    quantidadeExercicios === 1 ? 'exercício' : 'exercícios'
  } • ${formatarDuracao(duracaoTotalSegundos)}`;

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.topBar}>
        {onBackPress ? (
          <Pressable onPress={onBackPress} style={styles.backButton} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.legendaTreino}>{legendaTreino}</Text>
        <Text style={styles.subLegenda}>{subLegenda}</Text>

        <Text style={styles.title}>Como foi o treino?</Text>
        <Text style={styles.subtitle}>Avalie o quão intenso esse treino foi para você</Text>

        <View style={styles.escalaWrap}>
          <View style={styles.bonecosArea}>
            <View style={styles.linhaDiagonal} />
            <View style={styles.bonecosRow}>
              {notas.map((nota) => {
                const avatarSource = avatarPorNota[nota];
                const tamanhoAvatar = tamanhoAvatarPorNota[nota];
                return (
                  <View key={`avatar-${nota}`} style={styles.avatarColuna}>
                    {avatarSource ? (
                      <View style={[styles.avatarSlot, { marginBottom: nota * 22 }]}>
                        <Image source={avatarSource} style={tamanhoAvatar} resizeMode="contain" />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.numerosRow}>
            {notas.map((nota) => {
              const isSelected = nota === selectedRating;
              return (
                <Pressable
                  key={`num-${nota}`}
                  onPress={() => handleSelectRating(nota)}
                  hitSlop={8}
                  style={styles.notaPressable}
                >
                  <Text style={[styles.notaTexto, isSelected && styles.notaTextoAtiva]}>
                    {nota}
                  </Text>
                </Pressable>
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
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 12,
  },
  backArrow: {
    color: '#20222b',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 20,
  },
  legendaTreino: {
    fontSize: 13,
    color: '#6d7482',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subLegenda: {
    fontSize: 12,
    color: '#8b93a3',
    marginTop: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#20222b',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#6d7482',
    marginBottom: 12,
  },
  escalaWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  bonecosArea: {
    height: 260,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  linhaDiagonal: {
    position: 'absolute',
    left: '50%',
    bottom: 8,
    width: 320,
    marginLeft: -160,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#1d2433',
    transform: [{ rotate: '-38deg' }],
    zIndex: 0,
  },
  bonecosRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  avatarColuna: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  numerosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: 14,
  },
  notaPressable: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  notaTexto: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#20222b',
  },
  notaTextoAtiva: {
    color: '#4467f2',
    fontSize: 24,
    lineHeight: 28,
  },
  legendaSelecionada: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#4467f2',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#e5484d',
    textAlign: 'center',
    marginBottom: 8,
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4467f2',
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
