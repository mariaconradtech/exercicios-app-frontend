import React from 'react';
import { Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

type TelaFeedbackProps = {
  onSubmit?: (rating: number) => void | Promise<void>;
  onBackPress?: () => void;
  isSubmitting?: boolean;
};

const ratingLabels = [
  '0 - Muito Fácil',
  '1',
  '2 - Fácil',
  '3',
  '4 - Um pouco fácil',
  '5',
  '6 - Um pouco difícil',
  '7',
  '8 - Difícil',
  '9',
  '10 - Muito difícil',
];

export default function TelaFeedback({ onSubmit, onBackPress, isSubmitting }: TelaFeedbackProps) {
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [trackHeight, setTrackHeight] = React.useState(0);
  const [trackTop, setTrackTop] = React.useState(0);

  const thumbSize = 24;
  const trackPaddingTop = 20;
  const trackPaddingBottom = 20;
  const usableTrackHeight = Math.max(0, trackHeight - trackPaddingTop - trackPaddingBottom - thumbSize);

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
  };

  const updateRatingFromTouch = React.useCallback(
    (locationY: number) => {
      if (!usableTrackHeight) {
        return;
      }

      const clampedY = Math.max(
        trackPaddingTop,
        Math.min(trackHeight - trackPaddingBottom - thumbSize, locationY),
      );
      const ratio = (clampedY - trackPaddingTop) / usableTrackHeight;
      const nextRating = Math.round(ratio * 10);
      setSelectedRating(Math.max(0, Math.min(10, nextRating)));
    },
    [thumbSize, trackHeight, trackPaddingBottom, trackPaddingTop, usableTrackHeight],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_, gestureState) => {
          updateRatingFromTouch(gestureState.y0 - trackTop + gestureState.dy);
        },
        onPanResponderMove: (_, gestureState) => {
          updateRatingFromTouch(gestureState.moveY - trackTop);
        },
        onPanResponderRelease: (_, gestureState) => {
          updateRatingFromTouch(gestureState.moveY - trackTop);
        },
        onPanResponderTerminate: (_, gestureState) => {
          updateRatingFromTouch(gestureState.moveY - trackTop);
        },
      }),
    [trackTop, updateRatingFromTouch],
  );

  const barTop = trackPaddingTop + (usableTrackHeight * selectedRating) / 10;

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

        <View style={styles.feedbackArea}>
          <View style={styles.avatarColumn}>
            <Image
              source={require('../assets/bonecos/boneco-1.png')}
              style={styles.avatarIllustration}
              resizeMode="contain"
            />
            <Image
              source={require('../assets/bonecos/boneco-2.png')}
              style={styles.avatarIllustration}
              resizeMode="contain"
            />
            <Image
              source={require('../assets/bonecos/boneco-3.png')}
              style={styles.avatarIllustration}
              resizeMode="contain"
            />
            <Image
              source={require('../assets/bonecos/boneco-4.png')}
              style={[styles.avatarIllustration, styles.avatarIllustrationLower]}
              resizeMode="contain"
            />
          </View>

          <View
            style={styles.sliderTrackWrap}
            onLayout={(event) => {
              setTrackHeight(event.nativeEvent.layout.height);
              setTrackTop(event.nativeEvent.layout.y);
            }}
            {...panResponder.panHandlers}
          >
            <View style={styles.sliderTrack} />
            <View style={[styles.sliderThumb, { top: barTop }]} />
          </View>

          <View style={styles.ratingList}>
            {ratingLabels.map((label, index) => {
              const isSelected = index === selectedRating;
              return (
                <Pressable
                  key={label}
                  onPress={() => handleSelectRating(index)}
                  style={styles.ratingItem}
                >
                  <View style={[styles.ratingDot, isSelected && styles.ratingDotActive]} />
                  <Text style={[styles.ratingText, isSelected && styles.ratingTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

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
  feedbackArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  avatarColumn: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
  },
  avatarIllustration: {
    width: 96,
    height: 104,
    marginVertical: 8,
  },
  avatarIllustrationLower: {
    marginTop: 18,
  },
  sliderTrackWrap: {
    width: 26,
    height: 520,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingTop: 16,
  },
  sliderTrack: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    width: 10,
    borderRadius: 99,
    backgroundColor: '#e5e8ef',
    left: '50%',
    transform: [{ translateX: -5 }],
  },
  sliderThumb: {
    position: 'absolute',
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#4467f2',
    transform: [{ translateX: -12 }],
    shadowColor: '#4467f2',
    shadowOpacity: 0.28,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  ratingList: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 4,
    alignSelf: 'stretch',
  },
  ratingDot: {
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#cad0dc',
    marginRight: 8,
  },
  ratingDotActive: {
    backgroundColor: '#4467f2',
  },
  ratingText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#2b2f38',
  },
  ratingTextActive: {
    fontWeight: '700',
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
