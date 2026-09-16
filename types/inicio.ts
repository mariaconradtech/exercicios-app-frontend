export interface TreinoRealizadoResumoDTO {
  nome: string;
  fase: string;
  nivel: number;
  quantidadeExercicios: number;
  duracaoMinutos: number;
}

export interface InicioParticipanteDTO {
  participanteId: number;
  mes: number;
  ano: number;
  diasComTreino: number[];
  treinoRealizado: TreinoRealizadoResumoDTO | null;
}
