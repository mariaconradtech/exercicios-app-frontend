import { useCallback, useEffect, useRef, useState } from 'react';

import { useCountdown } from './useCountdown';
import { finalizarSessao, iniciarSessao, registrarProgresso } from '../services/treinoService';
import {
  chaveSerie,
  type RegistroExecucao,
  type SetStatus,
  type StatusTreino,
  type TreinoDetalhadoDTO,
} from '../types/treino';

// Ainda não há autenticação/sessão de usuário ligada a esta tela isolada —
// fica um placeholder até essa decisão existir (fora do escopo desta US).
const PARTICIPANTE_ID_PLACEHOLDER = 1;

interface UseTreinoExecucaoResult {
  status: StatusTreino;
  faseVisivel: 'EXECUCAO' | 'DESCANSO';
  exercicioIndex: number;
  serieAtual: number;
  exercicioAtual: TreinoDetalhadoDTO['itens'][number];
  proximoExercicio: TreinoDetalhadoDTO['itens'][number] | null;
  remaining: number;
  registro: RegistroExecucao;
  sessaoId: number | null;
  isConfirmModalOpen: boolean;
  pausar: () => void;
  retomar: () => void;
  pedirFinalizar: () => void;
  confirmarFinalizar: () => void;
  continuarTreino: () => void;
}

function totalDeSeries(treino: TreinoDetalhadoDTO): number {
  return treino.itens.reduce((soma, item) => soma + item.series, 0);
}

function calcularPercentual(itens: Record<string, SetStatus>, treino: TreinoDetalhadoDTO): number {
  const total = totalDeSeries(treino);
  if (total === 0) {
    return 0;
  }
  const concluidas = Object.values(itens).filter((s) => s === 'concluida').length;
  return Math.round((concluidas / total) * 1000) / 10;
}

export function useTreinoExecucao(treino: TreinoDetalhadoDTO): UseTreinoExecucaoResult {
  const [status, setStatus] = useState<StatusTreino>('EXECUTANDO');
  const [exercicioIndex, setExercicioIndex] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [registro, setRegistro] = useState<RegistroExecucao>({ itens: {}, tempoRealizadoSegundos: 0 });
  const [sessaoId, setSessaoId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const exercicioAtual = treino.itens[exercicioIndex];
  const proximoExercicio = treino.itens[exercicioIndex + 1] ?? null;

  const statusRef = useRef(status);
  statusRef.current = status;
  const statusAnteriorRef = useRef<StatusTreino>('EXECUTANDO');
  const sessaoIdRef = useRef<number | null>(null);
  const inicioRef = useRef<number | null>(null);
  const exercicioIndexRef = useRef(exercicioIndex);
  exercicioIndexRef.current = exercicioIndex;
  const serieAtualRef = useRef(serieAtual);
  serieAtualRef.current = serieAtual;
  const registroRef = useRef(registro);
  registroRef.current = registro;

  const tempoDecorridoSegundos = useCallback(() => {
    if (inicioRef.current === null) {
      return 0;
    }
    return Math.round((Date.now() - inicioRef.current) / 1000);
  }, []);

  const completarDescanso = useCallback(() => {
    const itemAtual = treino.itens[exercicioIndexRef.current];
    const ultimaSerie = serieAtualRef.current >= itemAtual.series;
    const proximoIndex = ultimaSerie ? exercicioIndexRef.current + 1 : exercicioIndexRef.current;
    const proximaSerie = ultimaSerie ? 1 : serieAtualRef.current + 1;
    const proximoItem = treino.itens[proximoIndex];

    setExercicioIndex(proximoIndex);
    setSerieAtual(proximaSerie);
    setStatus('EXECUTANDO');
    countdown.reset(proximoItem.duracaoEstimadaSegundos);
    countdown.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treino]);

  const completarSerieAtual = useCallback(() => {
    const itemAtual = treino.itens[exercicioIndexRef.current];
    const chave = chaveSerie(itemAtual.exercicioId, serieAtualRef.current);
    const proximosItens: Record<string, SetStatus> = { ...registroRef.current.itens, [chave]: 'concluida' };

    registrarProgresso(sessaoIdRef.current ?? 0, itemAtual.exercicioId, serieAtualRef.current).catch(() => {});

    const ultimaSerieDoExercicio = serieAtualRef.current >= itemAtual.series;
    const ultimoExercicio = exercicioIndexRef.current >= treino.itens.length - 1;

    if (ultimaSerieDoExercicio && ultimoExercicio) {
      const registroFinal: RegistroExecucao = {
        itens: proximosItens,
        tempoRealizadoSegundos: tempoDecorridoSegundos(),
      };
      setRegistro(registroFinal);
      setStatus('CONCLUIDA');
      countdown.pause();
      finalizarSessao(sessaoIdRef.current ?? 0, {
        status: 'CONCLUIDA',
        tempoRealizadoSegundos: registroFinal.tempoRealizadoSegundos,
        percentualConcluido: calcularPercentual(proximosItens, treino),
      }).catch(() => {});
      return;
    }

    setRegistro((prev) => ({ ...prev, itens: proximosItens }));
    setStatus('DESCANSO');
    countdown.reset(itemAtual.descansoSegundos);
    countdown.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treino, tempoDecorridoSegundos]);

  const countdown = useCountdown(treino.itens[0].duracaoEstimadaSegundos, {
    onComplete: () => {
      if (statusRef.current === 'EXECUTANDO') {
        completarSerieAtual();
      } else if (statusRef.current === 'DESCANSO') {
        completarDescanso();
      }
    },
  });

  useEffect(() => {
    inicioRef.current = Date.now();
    iniciarSessao(treino.id, PARTICIPANTE_ID_PLACEHOLDER)
      .then(({ sessaoId }) => {
        sessaoIdRef.current = sessaoId;
        setSessaoId(sessaoId);
      })
      .catch(() => {});
    countdown.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pausar = useCallback(() => {
    if (status === 'PAUSADO' || status === 'CONCLUIDA' || status === 'INTERROMPIDA') {
      return;
    }
    statusAnteriorRef.current = status;
    countdown.pause();
    setStatus('PAUSADO');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const retomar = useCallback(() => {
    if (status !== 'PAUSADO') {
      return;
    }
    countdown.resume();
    setStatus(statusAnteriorRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const pedirFinalizar = useCallback(() => {
    if (status === 'CONCLUIDA' || status === 'INTERROMPIDA') {
      return;
    }
    if (status !== 'PAUSADO') {
      statusAnteriorRef.current = status;
      countdown.pause();
    }
    setIsConfirmModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const continuarTreino = useCallback(() => {
    setIsConfirmModalOpen(false);
    countdown.resume();
    setStatus(statusAnteriorRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmarFinalizar = useCallback(() => {
    setIsConfirmModalOpen(false);
    countdown.pause();
    setStatus('INTERROMPIDA');
    const registroFinal: RegistroExecucao = {
      ...registroRef.current,
      tempoRealizadoSegundos: tempoDecorridoSegundos(),
    };
    setRegistro(registroFinal);
    finalizarSessao(sessaoIdRef.current ?? 0, {
      status: 'INTERROMPIDA',
      tempoRealizadoSegundos: registroFinal.tempoRealizadoSegundos,
      percentualConcluido: calcularPercentual(registroFinal.itens, treino),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempoDecorridoSegundos]);

  const faseVisivel: 'EXECUCAO' | 'DESCANSO' =
    status === 'DESCANSO' || (status === 'PAUSADO' && statusAnteriorRef.current === 'DESCANSO')
      ? 'DESCANSO'
      : 'EXECUCAO';

  return {
    status,
    faseVisivel,
    exercicioIndex,
    serieAtual,
    exercicioAtual,
    proximoExercicio,
    remaining: countdown.remaining,
    registro,
    sessaoId,
    isConfirmModalOpen,
    pausar,
    retomar,
    pedirFinalizar,
    confirmarFinalizar,
    continuarTreino,
  };
}
