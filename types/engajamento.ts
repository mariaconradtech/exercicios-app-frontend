export type FaseTreino = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';

export interface SemanaEngajamentoDTO {
  treinosRealizados: number;
  meta: number;
  semanasSeguidasCompletas: number;
  semanasParaEstrela: number;
}

export interface RankingItemDTO {
  participanteId: number;
  posicao: number;
  nome: string;
  pontos: number;
  estrelas: number;
  medalhas: number;
  trofeus: number;
  ehVoce: boolean;
}

export interface RankingFaseDTO {
  itens: RankingItemDTO[];
  participanteForaDoTopo: RankingItemDTO | null;
  totalParticipantes: number;
}

export interface NivelEngajamentoDTO {
  nivelAtual: number;
  sessoesRealizadas: number;
  sessoesNecessarias: number;
  progressoPercentual: number;
  programaConcluido: boolean;
}

export interface PercepcaoEsforcoDTO {
  data: string;
  valor: number;
}

export interface EngajamentoDTO {
  participanteId: number;
  mensagem: string;
  fase: FaseTreino;
  faseLabel: string;
  semana: SemanaEngajamentoDTO;
  ranking: RankingFaseDTO;
  nivel: NivelEngajamentoDTO;
  percepcaoEsforco: PercepcaoEsforcoDTO[];
}
