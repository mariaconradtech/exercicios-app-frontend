import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import AcoesTreino from './treinoExecucao/AcoesTreino';
import { cores } from './treinoExecucao/cores';
import ExercicioHeader from './treinoExecucao/ExercicioHeader';
import ExercicioMidia from './treinoExecucao/ExercicioMidia';
import ModalFinalizarTreino from './treinoExecucao/ModalFinalizarTreino';
import StatsRow from './treinoExecucao/StatsRow';
import TelaDescanso from './treinoExecucao/TelaDescanso';
import TimerExecucao from './treinoExecucao/TimerExecucao';
import { useTreinoExecucao } from '../hooks/useTreinoExecucao';
import type { RegistroExecucao, TreinoDetalhadoDTO } from '../types/treino';

type TelaTreinoExecucaoProps = {
  treino: TreinoDetalhadoDTO;
  participanteId: number;
  onFinish?: (registro: RegistroExecucao, sessaoId: number | null) => void;
  onBackPress?: () => void;
};

export default function TelaTreinoExecucao({
  treino,
  participanteId,
  onFinish,
  onBackPress,
}: TelaTreinoExecucaoProps) {
  useKeepAwake();

  const {
    status,
    faseVisivel,
    exercicioIndex,
    serieAtual,
    exercicioAtual,
    proximoExercicio,
    remaining,
    registro,
    sessaoId,
    isConfirmModalOpen,
    pausar,
    retomar,
    pedirFinalizar,
    confirmarFinalizar,
    continuarTreino,
  } = useTreinoExecucao(treino, participanteId);

  const jaNotificouRef = React.useRef(false);
  React.useEffect(() => {
    if ((status === 'CONCLUIDA' || status === 'INTERROMPIDA') && !jaNotificouRef.current) {
      jaNotificouRef.current = true;
      onFinish?.(registro, sessaoId);
    }
  }, [status, registro, onFinish, sessaoId]);

  const pausado = status === 'PAUSADO';

  // Quando o treino termina (concluído ou interrompido), esta tela não navega
  // para lugar nenhum sozinha — quem a monta decide o que vem a seguir a
  // partir de `onFinish`. Por isso não renderiza nada neste ponto.
  if (status === 'CONCLUIDA' || status === 'INTERROMPIDA') {
    return null;
  }

  if (faseVisivel === 'DESCANSO') {
    const ultimaSerieDoExercicio = serieAtual >= exercicioAtual.series;
    const proximaSerieExibida = ultimaSerieDoExercicio ? 1 : serieAtual + 1;
    const proximoItemExibido = ultimaSerieDoExercicio ? proximoExercicio : exercicioAtual;
    const nomeProximoExibido = proximoItemExibido?.exercicio.nome ?? exercicioAtual.exercicio.nome;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <TelaDescanso
          segundosRestantes={remaining}
          duracaoTotalSegundos={exercicioAtual.descansoSegundos}
          proximaSerie={proximaSerieExibida}
          nomeProximoExercicio={nomeProximoExibido}
          pausado={pausado}
          onTogglePause={pausado ? retomar : pausar}
          onFinalizar={pedirFinalizar}
        />
        <ModalFinalizarTreino
          visivel={isConfirmModalOpen}
          onContinuar={continuarTreino}
          onEncerrar={confirmarFinalizar}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.scrollContent}>
        <ExercicioHeader
          indice={exercicioIndex + 1}
          total={treino.itens.length}
          nome={exercicioAtual.exercicio.nome}
          onBackPress={pedirFinalizar}
        />
        <ExercicioMidia videoUrl={exercicioAtual.exercicio.videoUrl} />
        <View style={styles.timerWrap}>
          <TimerExecucao
            segundosRestantes={remaining}
            duracaoTotalSegundos={exercicioAtual.duracaoEstimadaSegundos}
          />
        </View>
        <StatsRow
          serieAtual={serieAtual}
          totalSeries={exercicioAtual.series}
          duracaoSegundos={exercicioAtual.duracaoEstimadaSegundos}
          descansoSegundos={exercicioAtual.descansoSegundos}
        />
        <AcoesTreino pausado={pausado} onTogglePause={pausado ? retomar : pausar} onFinalizar={pedirFinalizar} />
      </View>

      <ModalFinalizarTreino visivel={isConfirmModalOpen} onContinuar={continuarTreino} onEncerrar={confirmarFinalizar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  scrollContent: {
    flex: 1,
    paddingBottom: 8,
  },
  timerWrap: {
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 50,
  },
});
