import React from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

type TelaInstrucaoProps = {
  emoji: string;
  message: string | string[];
  primaryLabel: string;
  primaryVariant?: 'outline' | 'solid';
  activeDot: number;
  onBackPress?: () => void;
  onPrimaryPress?: () => void;
};

const h = React.createElement;

export default function TelaInstrucao({
  emoji,
  message,
  primaryLabel,
  primaryVariant = 'outline',
  activeDot,
  onBackPress,
  onPrimaryPress,
}: TelaInstrucaoProps) {
  const messageLines = React.useMemo(() => {
    if (Array.isArray(message)) {
      return message;
    }
    return message.split('\n').map((line) => line.trim()).filter(Boolean);
  }, [message]);
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 50 && onBackPress) {
            onBackPress();
            return;
          }
          if (gestureState.dx < -50 && onPrimaryPress) {
            onPrimaryPress();
          }
        },
      }),
    [onBackPress, onPrimaryPress],
  );

  const dots = [0, 1].map((dot) =>
    h(View, {
      key: dot,
      style: [styles.dot, dot === activeDot && styles.dotActive],
    }),
  );

  return h(
    View,
    { ...panResponder.panHandlers, style: styles.phoneFrame },
    h(
      View,
      { style: styles.phoneHeader },
      h(
        View,
        { style: styles.statusRow },
        h(
          Pressable,
          {
            onPress: onBackPress,
            style: styles.backButton,
            hitSlop: 10,
          },
          h(Text, { style: styles.backArrow }, '←'),
        ),
        h(View, { style: styles.statusPill }),
      ),
      h(Text, { style: styles.screenTitle }, 'TREINO 1 - NÍVEL 1 - INICIANTE'),
      h(Text, { style: styles.screenSubtitle }, '6 exercícios - ~45 min'),
    ),
    h(
      View,
      { style: styles.phoneBody },
      h(
        View,
        { style: styles.avatarWrap },
        h(
          View,
          { style: styles.avatarCircle },
          h(Text, { style: styles.avatarEmoji }, emoji),
        ),
      ),
      h(
        View,
        { style: styles.messageCard },
        ...messageLines.map((line, index) =>
          h(Text, { key: index, style: styles.messageText }, line),
        ),
      ),
      h(View, { style: styles.dotsRow }, ...dots),
      h(
        Pressable,
        {
          style: [
            styles.primaryButton,
            primaryVariant === 'solid'
              ? styles.primaryButtonSolid
              : styles.primaryButtonOutline,
          ],
          onPress: onPrimaryPress,
        },
        h(
          Text,
          {
            style: [
              styles.primaryButtonText,
              primaryVariant === 'solid'
                ? styles.primaryButtonTextSolid
                : styles.primaryButtonTextOutline,
            ],
          },
          `${primaryVariant === 'solid' ? '▶' : '⏭'}  ${primaryLabel}`,
        ),
      ),
    ),
  );
}

const styles = StyleSheet.create({
  phoneFrame: {
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
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  screenSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  phoneBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  avatarWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#dfe7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  messageCard: {
    width: '100%',
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  messageText: {
    color: '#4a5260',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#d4d7df',
  },
  dotActive: {
    backgroundColor: '#4467f2',
    width: 10,
    height: 10,
  },
  primaryButton: {
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 16,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonOutline: {
    borderWidth: 1,
    borderColor: '#dce0e8',
    backgroundColor: '#ffffff',
  },
  primaryButtonSolid: {
    backgroundColor: '#1fc45b',
  },
  primaryButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  primaryButtonTextOutline: {
    color: '#3e4654',
  },
  primaryButtonTextSolid: {
    color: '#ffffff',
  },
});
