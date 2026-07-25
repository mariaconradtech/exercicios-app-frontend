import { treinoMock } from './treinoMock';
import type { TreinoDetalhadoDTO } from '../types/treino';

// Implementação atual: dados mockados. Quando a API existir, trocar o corpo
// destas 4 funções por chamadas `fetch` reais — nenhum componente ou hook
// que consome este serviço precisa mudar.
//
// Contrato esperado da API (ver plano da US03 para os endpoints sugeridos):
//   buscarTreinoAtivo   -> GET   /treinos/:treinoId/execucao
//   iniciarSessao       -> POST  /sessoes
//   registrarProgresso  -> PATCH /sessoes/:sessaoId/progresso
//   finalizarSessao     -> PATCH /sessoes/:sessaoId/finalizar

export async function buscarTreinoAtivo(treinoId: number): Promise<TreinoDetalhadoDTO> {
  return { ...treinoMock, id: treinoId };
}

export async function iniciarSessao(
  treinoId: number,
  participanteId: number,
): Promise<{ sessaoId: number }> {
  console.log('[treinoService] iniciarSessao (mock)', { treinoId, participanteId });
  return { sessaoId: 1 };
}

export async function registrarProgresso(
  sessaoId: number,
  exercicioId: number,
  serie: number,
): Promise<void> {
  console.log('[treinoService] registrarProgresso (mock)', { sessaoId, exercicioId, serie });
}

export interface FinalizarSessaoPayload {
  status: 'CONCLUIDA' | 'INTERROMPIDA';
  tempoRealizadoSegundos: number;
  percentualConcluido: number;
}

export async function finalizarSessao(
  sessaoId: number,
  dados: FinalizarSessaoPayload,
): Promise<void> {
  console.log('[treinoService] finalizarSessao (mock)', { sessaoId, ...dados });
}
