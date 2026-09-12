export type CategoriaEngajamento = 'OURO' | 'PRATA' | 'BRONZE';

export interface PodioItemDTO {
  categoria: CategoriaEngajamento;
  participanteNome: string;
  nomeAvatar?: string;
  treinosConcluidos: number;
}

export interface RankingItemDTO {
  participanteId: number;
  nome: string;
  nomeAvatar: string;
  bronze: number;
  estrelas: number;
  medalhas: number;
  trofeus: number;
}

export interface ProximoNivelDTO {
  nivelAtual: string;
  proximoNivel: string | null;
  treinosConcluidos: number;
  treinosFaltantes: number;
  progressoPercentual: number;
}

export interface PercepcaoEsforcoDTO {
  data: string;
  valor: number;
}

export interface EngajamentoDTO {
  participanteId: number;
  categoriaAtual: CategoriaEngajamento;
  mudouCategoria: boolean;
  mensagemCelebracao: string;
  podio: PodioItemDTO[];
  ranking: RankingItemDTO[];
  proximoNivel: ProximoNivelDTO;
  percepcaoEsforco: PercepcaoEsforcoDTO[];
}