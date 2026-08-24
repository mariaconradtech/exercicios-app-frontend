import React from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

type TelaInstrucaoProps = {
  emoji: string;
  primaryLabel: string;
  primaryVariant?: 'outline' | 'solid';
  materiais: string[];
  onBackPress?: () => void;
  onPrimaryPress?: () => void;
};

const MENSAGEM_CARD_1_PARTE_1 =
  'Hora do treino! Confira os materiais que você vai precisar no próximo card. Assim que estiver com tudo em mãos, clique em ';
const MENSAGEM_CARD_1_PARTE_2 = ' para começar.';
const TOTAL_CARDS = 2;

export default function TelaInstrucao({
  emoji,
  primaryLabel,
  primaryVariant = 'solid',
  materiais,
  onBackPress,
  onPrimaryPress,
}: TelaInstrucaoProps) {
  const [cardAtivo, setCardAtivo] = React.useState<number>(0);

  const irParaProximoCard = React.useCallback(() => {
    setCardAtivo((atual) => Math.min(atual + 1, TOTAL_CARDS - 1));
  }, []);

  const irParaCardAnterior = React.useCallback(() => {
    setCardAtivo((atual) => Math.max(atual - 1, 0));
  }, []);

  const handleBack = () => {
    if (cardAtivo > 0) {
      irParaCardAnterior();
      return;
    }
    onBackPress?.();
  };

  const handlePrimary = () => {
    if (cardAtivo < TOTAL_CARDS - 1) {
      irParaProximoCard();
      return;
    }
    onPrimaryPress?.();
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 50) {
            handleBack();
            return;
          }
          if (gestureState.dx < -50) {
            handlePrimary();
          }
        },
      }),
    [cardAtivo, onBackPress, onPrimaryPress],
  );

  const noUltimoCard = cardAtivo === TOTAL_CARDS - 1;
  const labelBotao = noUltimoCard ? primaryLabel : 'Próximo';
  const varianteBotao = noUltimoCard ? primaryVariant : 'outline';
  const iconeBotao = noUltimoCard ? (varianteBotao === 'solid' ? '▶' : '⏭') : '→';
  const materiaisUnicos = React.useMemo(
    () => Array.from(new Set(materiais.map((m) => m.trim()).filter(Boolean))),
    [materiais],
  );

  return (
    <View {...panResponder.panHandlers} style={styles.phoneFrame}>
      <View style={styles.phoneHeader}>
        <View style={styles.statusRow}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.statusPill} />
        </View>
        <Text style={styles.screenTitle}>TREINO 1 - NÍVEL 1 - INICIANTE</Text>
        <Text style={styles.screenSubtitle}>6 exercícios - ~45 min</Text>
      </View>

      <View style={styles.phoneBody}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
        </View>

        <View style={styles.messageCard}>
          {cardAtivo === 0 ? (
            <Text style={styles.messageText}>
              {MENSAGEM_CARD_1_PARTE_1}
              <Text style={styles.messageTextBold}>Iniciar</Text>
              {MENSAGEM_CARD_1_PARTE_2}
            </Text>
          ) : (
            <View style={styles.materiaisWrap}>
              <Text style={styles.materiaisTitulo}>Materiais necessários</Text>
              {materiaisUnicos.length === 0 ? (
                <Text style={styles.messageText}>Nenhum material específico para este treino.</Text>
              ) : (
                materiaisUnicos.map((material, index) => (
                  <View key={`${material}-${index}`} style={styles.materialItem}>
                    <Text style={styles.materialBullet}>•</Text>
                    <Text style={styles.materialTexto}>{material}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_CARDS }).map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === cardAtivo && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            varianteBotao === 'solid' ? styles.primaryButtonSolid : styles.primaryButtonOutline,
          ]}
          onPress={handlePrimary}
        >
          <Text
            style={[
              styles.primaryButtonText,
              varianteBotao === 'solid'
                ? styles.primaryButtonTextSolid
                : styles.primaryButtonTextOutline,
            ]}
          >
            {`${iconeBotao}  ${labelBotao}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phoneFrame: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    maxHeight: 720,
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
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 18,
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
  messageTextBold: {
    fontWeight: '800',
    color: '#1d2433',
  },
  materiaisWrap: {
    width: '100%',
  },
  materiaisTitulo: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#1d2433',
    marginBottom: 12,
    textAlign: 'center',
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  materialBullet: {
    fontSize: 18,
    lineHeight: 22,
    color: '#4467f2',
    marginRight: 8,
    fontWeight: '800',
  },
  materialTexto: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4a5260',
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
