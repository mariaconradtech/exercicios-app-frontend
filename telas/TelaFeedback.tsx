import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type TelaFeedbackProps = {
  onSubmit?: (rating: number) => void | Promise<void>;
  onBackPress?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
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
const DEGRAU_PX = 30;

export default function TelaFeedback({
  onSubmit,
  onBackPress,
  isSubmitting,
  errorMessage,
}: TelaFeedbackProps) {
  const [selectedRating, setSelectedRating] = React.useState(0);

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
  };

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.phoneHeader}>
        <View style={styles.statusRow}>
          <Pressable onPress={onBackPress} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.statusPill} />
        </View>

        <Text style={styles.screenTitle}>TREINO 1 - NÍVEL 1 - INICIANTE</Text>
        <Text style={styles.screenSubtitle}>6 exercícios - ~45 min</Text>
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

                  <Pressable onPress={() => handleSelectRating(nota)} hitSlop={8}>
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
    minHeight: 720,
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
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    paddingRight: 8,
    paddingVertical: 2,
  },
  backArrow: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '700',
  },
  statusPill: {
    width: 24,
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  screenSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#20222b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#6d7482',
    marginBottom: 10,
  },
  escalaWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
    marginTop: 26,
    marginBottom: 16,
  },
  linhaDiagonal: {
    position: 'absolute',
    left: '50%',
    bottom: 170,
    width: 420,
    marginLeft: -210,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#1d2433',
    transform: [{ rotate: '-46deg' }],
  },
  degrausRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 30,
  },
  degrau: {
    alignItems: 'center',
    width: 26,
  },
  avatarSlot: {
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 26,
  },
  notaTexto: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: '#20222b',
  },
  notaTextoAtiva: {
    color: '#4467f2',
    fontSize: 16,
  },
  legendaSelecionada: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#4467f2',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#e5484d',
    textAlign: 'center',
    marginBottom: 4,
  },
  submitButton: {
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8ea5f0',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.96,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
});
