import React from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { FaseTreino } from '../types/treino';

type TelaInstrucaoProps = {
  emoji: string;
  primaryLabel: string;
  primaryVariant?: 'outline' | 'solid';
  materiais: string[];
  nomeTreino: string;
  fase?: FaseTreino;
  nivel?: number;
  quantidadeExercicios: number;
  duracaoTotalSegundos: number;
  onBackPress?: () => void;
  onPrimaryPress?: () => void;
};

const TOTAL_CARDS = 2;

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

export default function TelaInstrucao({
  emoji,
  primaryLabel,
  primaryVariant = 'solid',
  materiais,
  nomeTreino,
  fase,
  nivel,
  quantidadeExercicios,
  duracaoTotalSegundos,
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

  const handleBack = React.useCallback(() => {
    if (cardAtivo > 0) {
      irParaCardAnterior();
      return;
    }
    onBackPress?.();
  }, [cardAtivo, irParaCardAnterior, onBackPress]);

  const handlePrimary = React.useCallback(() => {
    if (cardAtivo < TOTAL_CARDS - 1) {
      irParaProximoCard();
      return;
    }
    onPrimaryPress?.();
  }, [cardAtivo, irParaProximoCard, onPrimaryPress]);

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
    [handleBack, handlePrimary],
  );

  const noUltimoCard = cardAtivo === TOTAL_CARDS - 1;
  const labelBotao = noUltimoCard ? primaryLabel : 'Próximo';
  const varianteBotao = noUltimoCard ? primaryVariant : 'outline';
  const iconeBotao = noUltimoCard ? (varianteBotao === 'solid' ? '▶' : '⏭') : '→';

  const materiaisUnicos = React.useMemo(
    () => Array.from(new Set(materiais.map((m) => m.trim()).filter(Boolean))),
    [materiais],
  );

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
    <View {...panResponder.panHandlers} style={styles.phoneFrame}>
      <View style={styles.phoneHeader}>
        <View style={styles.statusRow}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.statusPill} />
        </View>
        <Text style={styles.screenTitle} numberOfLines={2}>
          {tituloHeader}
        </Text>
        <Text style={styles.screenSubtitle}>{subtituloHeader}</Text>
      </View>

      <View style={styles.phoneBody}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
        </View>

        <View style={styles.messageCard}>
          {cardAtivo === 0 ? (
            <View style={styles.card1Content}>
              <Text style={styles.messageText}>
                Hora do treino! Confira os materiais que você vai precisar no próximo card.
              </Text>
              <Text style={[styles.messageText, styles.messageTextSpacing]}>
                Assim que estiver com tudo em mãos, clique em{' '}
                <Text style={styles.messageTextBold}>Iniciar</Text> para começar.
              </Text>
            </View>
          ) : (
            <View style={styles.materiaisWrap}>
              <Text style={styles.materiaisTitulo}>Materiais necessários</Text>
              {materiaisUnicos.length === 0 ? (
                <Text style={styles.messageText}>Nenhum material específico para este treino.</Text>
              ) : (
                <ScrollView
                  style={styles.materiaisScroll}
                  contentContainerStyle={styles.materiaisScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {materiaisUnicos.map((material, index) => (
                    <View key={`${material}-${index}`} style={styles.materialItem}>
                      <Text style={styles.materialBullet}>•</Text>
                      <Text style={styles.materialTexto}>{material}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        <View style={styles.footerArea}>
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_CARDS }).map((_, index) => (
              <View key={index} style={[styles.dot, index === cardAtivo && styles.dotActive]} />
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
  phoneBody: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatarWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: '#dfe7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 52,
    lineHeight: 60,
  },
  messageCard: {
    width: '100%',
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 18,
  },
  card1Content: {
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    color: '#4a5260',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  messageTextSpacing: {
    marginTop: 10,
  },
  messageTextBold: {
    fontWeight: '800',
    color: '#1d2433',
  },
  materiaisWrap: {
    flex: 1,
  },
  materiaisTitulo: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: '#1d2433',
    marginBottom: 10,
    textAlign: 'center',
  },
  materiaisScroll: {
    flex: 1,
  },
  materiaisScrollContent: {
    paddingBottom: 4,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  materialBullet: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4467f2',
    marginRight: 8,
    fontWeight: '800',
  },
  materialTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#4a5260',
    fontWeight: '500',
  },
  footerArea: {
    width: '100%',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
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
    paddingVertical: 14,
    minWidth: 200,
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
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  primaryButtonTextOutline: {
    color: '#3e4654',
  },
  primaryButtonTextSolid: {
    color: '#ffffff',
  },
});
