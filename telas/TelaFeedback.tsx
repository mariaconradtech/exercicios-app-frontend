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
  0: require('../assets/bonecos/Esforco_Barra_01_Facil.png'),
  3: require('../assets/bonecos/Esforco_Barra_02_Medio.png'),
  7: require('../assets/bonecos/Esforco_Barra_03_Dificil.png'),
  10: require('../assets/bonecos/Esforco_Barra_04_MuitoDificil.png'),
};

const notas = Array.from({ length: 11 }, (_, i) => 10 - i);
const TOTAL_LINHAS = notas.length;

const PROPORCAO_AVATAR = 4 / 3;
const LARGURA_COLUNA_AVATAR = '40%';
const LARGURA_TRILHA = 40;
const TAMANHO_SELETOR = 30;

function centroDaNota(nota: number, alturaLinha: number): number {
  return (10 - nota + 0.5) * alturaLinha;
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
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);
  const [escala, setEscala] = React.useState({ largura: 0, altura: 0 });
  const escalaRef = React.useRef<View>(null);
  const topoEscalaRef = React.useRef(0);
  const isRatingActive = selectedRating !== null;

  const alturaLinha = escala.altura / TOTAL_LINHAS;
  const larguraColunaAvatar = escala.largura * 0.4;
  const alturaAvatar = Math.min(100, escala.altura / 4 - 14, (larguraColunaAvatar - 8) / PROPORCAO_AVATAR);
  const larguraAvatar = alturaAvatar * PROPORCAO_AVATAR;

  const handleEscalaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setEscala({ largura: width, altura: height });
  };

  const notaPelaPosicao = React.useCallback(
    (pageY: number) => {
      if (alturaLinha <= 0) {
        return null;
      }
      const y = pageY - topoEscalaRef.current;
      const linha = Math.min(TOTAL_LINHAS - 1, Math.max(0, Math.floor(y / alturaLinha)));
      return 10 - linha;
    },
    [alturaLinha],
  );

  const selecionarPelaPosicao = React.useCallback(
    (pageY: number) => {
      const nota = notaPelaPosicao(pageY);
      if (nota !== null) {
        setSelectedRating(nota);
      }
    },
    [notaPelaPosicao],
  );

  const sliderPanResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const pageY = event.nativeEvent.pageY;
          escalaRef.current?.measureInWindow((_x, y) => {
            topoEscalaRef.current = y;
            selecionarPelaPosicao(pageY);
          });
        },
        onPanResponderMove: (event) => {
          selecionarPelaPosicao(event.nativeEvent.pageY);
        },
      }),
    [selecionarPelaPosicao],
  );

  const ajustarNota = (delta: number) => {
    setSelectedRating((atual) => Math.min(10, Math.max(0, (atual ?? 0) + delta)));
  };

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.content}>
        <Text style={styles.title}>Como foi o treino?</Text>
        <Text style={styles.subtitle}>
          Avalie o quão intenso esse treino foi para você.
        </Text>

        <View
          ref={escalaRef}
          style={styles.escalaWrap}
          onLayout={handleEscalaLayout}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Esforço do treino, de 0 (muito fácil) a 10 (muito difícil)"
          accessibilityValue={{
            min: 0,
            max: 10,
            now: selectedRating ?? undefined,
            text: selectedRating === null ? 'Nenhuma nota escolhida' : String(selectedRating),
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) => ajustarNota(event.nativeEvent.actionName === 'increment' ? 1 : -1)}
          {...sliderPanResponder.panHandlers}
        >

          <View style={styles.colunaAvatar} pointerEvents="none">
            {alturaAvatar > 0 &&
              [10, 7, 3, 0].map((nota) => (
                <Image
                  key={nota}
                  source={avatarPorNota[nota]}
                  resizeMode="contain"
                  style={{ width: larguraAvatar, height: alturaAvatar }}
                />
              ))}
          </View>

          {/* Trilha: linha, uma marca por nota e o seletor, todos no mesmo eixo */}
          <View style={styles.colunaTrilha} pointerEvents="none">
            {alturaLinha > 0 && (
              <>
                <View
                  style={[
                    styles.linhaVertical,
                    { top: centroDaNota(10, alturaLinha), bottom: alturaLinha / 2 },
                  ]}
                />
                {notas.map((nota) => (
                  <View
                    key={nota}
                    style={[styles.marca, { top: centroDaNota(nota, alturaLinha) - styles.marca.height / 2 }]}
                  />
                ))}
                {selectedRating !== null && (
                  <View
                    style={[
                      styles.seletor,
                      { top: centroDaNota(selectedRating, alturaLinha) - TAMANHO_SELETOR / 2 },
                    ]}
                  />
                )}
              </>
            )}
          </View>

          <View style={styles.notas} pointerEvents="none">
            {notas.map((nota) => {
              const isSelected = nota === selectedRating;
              return (
                <View key={nota} style={styles.notaLinha}>
                  <Text style={[styles.notaNumero, isSelected && styles.notaAtiva]}>{nota}</Text>
                  {legendaPorNota[nota] ? (
                    <Text style={[styles.notaLegenda, isSelected && styles.notaAtiva]} numberOfLines={1}>
                      {legendaPorNota[nota]}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          style={[
            styles.submitButton,
            (!onSubmit || isSubmitting || !isRatingActive) && styles.submitButtonDisabled,
            isRatingActive && !isSubmitting && styles.submitButtonEnabled,
          ]}
          onPress={() => {
            if (!onSubmit || isSubmitting || selectedRating === null) {
              return;
            }
            void onSubmit(selectedRating);
          }}
          disabled={!onSubmit || isSubmitting || !isRatingActive}
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
    minHeight: 330,
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 20,
  },
  colunaAvatar: {
    width: LARGURA_COLUNA_AVATAR,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colunaTrilha: {
    width: LARGURA_TRILHA,
    alignItems: 'center',
  },
  linhaVertical: {
    position: 'absolute',
    width: 8,
    borderRadius: 4,
    backgroundColor: '#e2e4e9',
  },
  marca: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#b9bdd0',
  },
  seletor: {
    position: 'absolute',
    width: TAMANHO_SELETOR,
    height: TAMANHO_SELETOR,
    borderRadius: TAMANHO_SELETOR / 2,
    backgroundColor: '#3261e8',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#3261e8',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  notas: {
    flex: 1,
    paddingLeft: 8,
  },
  notaLinha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notaNumero: {
    width: 24,
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    color: '#20222b',
  },
  notaLegenda: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#4b5263',
  },
  notaAtiva: {
    fontWeight: '800',
    color: '#2e5be6',
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
  submitButtonEnabled: {
    backgroundColor: '#2e5be6',
    shadowColor: '#2e5be6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
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
