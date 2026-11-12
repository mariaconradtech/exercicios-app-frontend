import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import AcoesTreino from './treinoExecucao/AcoesTreino';
import { cores } from './treinoExecucao/cores';
import ExercicioHeader from './treinoExecucao/ExercicioHeader';
import ExercicioMidia from './treinoExecucao/ExercicioMidia';
import ModalFinalizarTreino from './treinoExecucao/ModalFinalizarTreino';
import StatsRow from './treinoExecucao/StatsRow';
import TelaDescanso from './treinoExecucao/TelaDescanso';
import TimerExecucao from './treinoExecucao/TimerExecucao';
import { DESCANSO_INICIAL_SEGUNDOS, useTreinoExecucao } from '../hooks/useTreinoExecucao';
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
    percentualConcluido,
    descansoInicial,
    erroIniciar,
    pausar,
    retomar,
    pedirFinalizar,
    confirmarFinalizar,
    continuarTreino,
  } = useTreinoExecucao(treino, participanteId);

  const jaNotificouRef = React.useRef(false);
  const handleMensagemFinalizacaoConcluida = React.useCallback(() => {
    if (!jaNotificouRef.current) {
      jaNotificouRef.current = true;
      onFinish?.(registro, sessaoId);
    }
  }, [registro, onFinish, sessaoId]);

  const pausado = status === 'PAUSADO';

  // Sem sessão criada no backend (ex.: 409 porque já completou o treino de
  // hoje) não dá pra prosseguir — mostra o motivo e manda de volta, em vez de
  // deixar o participante "treinar" uma sessão que nunca seria salva.
  if (erroIniciar) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.erroContainer}>
          <Text style={styles.erroTitulo}>Não foi possível iniciar o treino</Text>
          <Text style={styles.erroMensagem}>{erroIniciar}</Text>
          <Pressable style={styles.erroBotao} onPress={onBackPress}>
            <Text style={styles.erroBotaoTexto}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Ao terminar, mostra a mensagem positiva antes de entregar o fluxo para a tela de feedback.
  if (status === 'CONCLUIDA' || status === 'INTERROMPIDA') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ModalFinalizarTreino
          visivel
          tipo={status === 'CONCLUIDA' ? 'concluido' : 'interrompido'}
          onContinuar={handleMensagemFinalizacaoConcluida}
        />
      </SafeAreaView>
    );
  }

  if (faseVisivel === 'DESCANSO') {
    const ultimaSerieDoExercicio = !descansoInicial && serieAtual >= exercicioAtual.series;
    const proximaSerieExibida = descansoInicial || ultimaSerieDoExercicio ? 1 : serieAtual + 1;
    const proximoItemExibido = ultimaSerieDoExercicio ? proximoExercicio : exercicioAtual;
    const nomeProximoExibido = proximoItemExibido?.exercicio.nome ?? exercicioAtual.exercicio.nome;
    const duracaoDescansoExibida = descansoInicial
      ? DESCANSO_INICIAL_SEGUNDOS
      : ultimaSerieDoExercicio
        ? exercicioAtual.descansoTransicaoSegundos
        : exercicioAtual.descansoSegundos;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <TelaDescanso
          segundosRestantes={remaining}
          duracaoTotalSegundos={duracaoDescansoExibida}
          proximaSerie={proximaSerieExibida}
          nomeProximoExercicio={nomeProximoExibido}
          pausado={pausado}
          onTogglePause={pausado ? retomar : pausar}
          onFinalizar={pedirFinalizar}
        />
        <ModalFinalizarTreino
          visivel={isConfirmModalOpen}
          percentualConcluido={percentualConcluido}
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
        <ExercicioMidia
          videoUrl={exercicioAtual.exercicio.videoUrl}
          velocidade={exercicioAtual.velocidadeExecucao}
          duracaoTotalSegundos={exercicioAtual.duracaoEstimadaSegundos}
          isPaused={pausado}
        />
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

      <ModalFinalizarTreino
        visivel={isConfirmModalOpen}
        percentualConcluido={percentualConcluido}
        onContinuar={continuarTreino}
        onEncerrar={confirmarFinalizar}
      />
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
    paddingVertical: 20,
    minHeight: 60,
  },
  erroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  erroTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.texto,
    marginBottom: 12,
    textAlign: 'center',
  },
  erroMensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginBottom: 24,
  },
  erroBotao: {
    height: 46,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: cores.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  erroBotaoTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
