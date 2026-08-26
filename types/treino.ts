export interface ExercicioDTO {
  id: number;
  nome: string;
  videoUrl: string;
  instrucao: string[];
}

export interface TreinoExercicioDTO {
  exercicioId: number;
  ordem: number;
  series: number;
  descansoSegundos: number;
  duracaoEstimadaSegundos: number;
  exercicio: ExercicioDTO;
}

export type FaseTreino = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';

export interface TreinoDetalhadoDTO {
  id: number;
  nome: string;
  descricao?: string | null;
  fase?: FaseTreino;
  nivel?: number;
  itens: TreinoExercicioDTO[];
}

export type SetStatus = 'pendente' | 'concluida';

export interface RegistroExecucao {
  itens: Record<string, SetStatus>;
  tempoRealizadoSegundos: number;
}

export type StatusTreino = 'EXECUTANDO' | 'DESCANSO' | 'PAUSADO' | 'CONCLUIDA' | 'INTERROMPIDA';

export function chaveSerie(exercicioId: number, serie: number): string {
  return `${exercicioId}-${serie}`;
}
