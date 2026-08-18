import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { TreinoDetalhadoDTO } from '../types/treino';
import type { EngajamentoDTO } from '../types/engajamento';

// Contrato da API (implementado no repo exercicios-app-backend, src/routes/):
//   buscarTreinoAtivo   -> GET   /treinos/:treinoId/execucao
//   iniciarSessao       -> POST  /sessoes
//   registrarProgresso  -> PATCH /sessoes/:sessaoId/progresso
//   finalizarSessao     -> PATCH /sessoes/:sessaoId/finalizar

export function resolverApiBaseUrl(): string {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];

    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      return 'http://10.0.2.2:3000';
    }

    return `http://${host}:3000`;
  }

  return (
    Platform.select({
      android: 'http://10.0.2.2:3000',
      default: 'http://localhost:3000',
    }) ?? 'http://localhost:3000'
  );
}

const API_BASE_URL = resolverApiBaseUrl();
const API_TIMEOUT_MS = 10000;

async function fetchComTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo de conexão esgotado com o servidor. Verifique a URL da API.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function tratarResposta(response: Response, mensagemErro: string): Promise<void> {
  if (!response.ok) {
    throw new Error(`${mensagemErro} (status ${response.status})`);
  }
}

export async function buscarTreinoAtivo(treinoId: number): Promise<TreinoDetalhadoDTO> {
  const response = await fetchComTimeout(`${API_BASE_URL}/treinos/${treinoId}/execucao`);
  await tratarResposta(response, 'Não foi possível carregar o treino');
  return response.json();
}

export async function iniciarSessao(
  treinoId: number,
  participanteId: number,
): Promise<{ sessaoId: number }> {
  const response = await fetchComTimeout(`${API_BASE_URL}/sessoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ treinoId, participanteId }),
  });
  await tratarResposta(response, 'Não foi possível iniciar a sessão');
  return response.json();
}

export async function registrarProgresso(
  sessaoId: number,
  exercicioId: number,
  serie: number,
): Promise<void> {
  const response = await fetchComTimeout(`${API_BASE_URL}/sessoes/${sessaoId}/progresso`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercicioId, serie }),
  });
  await tratarResposta(response, 'Não foi possível registrar o progresso');
}

export interface FinalizarSessaoPayload {
  status: 'CONCLUIDA' | 'INTERROMPIDA';
  tempoRealizadoSegundos: number;
  percentualConcluido: number;
  esforcoOmni?: number;
}

export async function finalizarSessao(
  sessaoId: number,
  dados: FinalizarSessaoPayload,
): Promise<void> {
  const response = await fetchComTimeout(`${API_BASE_URL}/sessoes/${sessaoId}/finalizar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  await tratarResposta(response, 'Não foi possível finalizar a sessão');
}

export async function enviarFeedback(sessaoId: number, rating: number): Promise<void> {
  const response = await fetchComTimeout(`${API_BASE_URL}/avaliacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessaoId: Number(sessaoId),
      rating: Number(rating),
    }),
  });

  await tratarResposta(response, 'Não foi possível enviar a avaliação');
}

export async function buscarEngajamento(participanteId: number): Promise<EngajamentoDTO> {
  const response = await fetchComTimeout(`${API_BASE_URL}/engajamento?participanteId=${participanteId}`, {
    headers: {
      'x-participante-id': String(participanteId),
    },
  });

  await tratarResposta(response, 'Não foi possível carregar o engajamento');
  return response.json();
}
