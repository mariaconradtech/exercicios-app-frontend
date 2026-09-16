export type GeneroAvatarPerfil = 'FEMININO' | 'MASCULINO';

export interface ProximoNivelPerfilDTO {
  nivelAtual: string;
  proximoNivel: string | null;
  treinosFaltantes: number;
}

export interface PerfilParticipanteDTO {
  participanteId: number;
  nome: string;
  cpf: string;
  dataAdesao: string;
  categoria: string;
  pontos: number;
  totalTreinosConcluidos: number;
  avatarGenero: GeneroAvatarPerfil | null;
  nomeAvatar: string | null;
  proximoNivel: ProximoNivelPerfilDTO;
}
