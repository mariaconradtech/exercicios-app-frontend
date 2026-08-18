import type { TreinoDetalhadoDTO } from '../types/treino';

export const treinoMock: TreinoDetalhadoDTO = {
  id: 1,
  nome: 'TREINO 1 - NÍVEL 1 - INICIANTE',
  itens: [
    {
      exercicioId: 1,
      ordem: 1,
      series: 3,
      descansoSegundos: 60,
      duracaoEstimadaSegundos: 45,
      exercicio: {
        id: 1,
        nome: 'Supino Reto',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instrucao: [
          'Deite-se no banco alinhado com a barra.',
          'Segure a barra com pegada na largura dos ombros.',
          'Desça controladamente até o peito e empurre para cima.',
        ],
      },
    },
    {
      exercicioId: 2,
      ordem: 2,
      series: 3,
      descansoSegundos: 60,
      duracaoEstimadaSegundos: 45,
      exercicio: {
        id: 2,
        nome: 'Agachamento Livre',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        instrucao: [
          'Posicione a barra nos trapézios.',
          'Mantenha os pés na largura dos ombros.',
          'Desça flexionando os joelhos mantendo a coluna reta.',
        ],
      },
    },
    {
      exercicioId: 3,
      ordem: 3,
      series: 3,
      descansoSegundos: 60,
      duracaoEstimadaSegundos: 45,
      exercicio: {
        id: 3,
        nome: 'Remada Curvada',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        instrucao: [
          'Incline o tronco à frente mantendo a coluna reta.',
          'Puxe a barra em direção ao abdômen.',
          'Controle a descida da barra até a extensão total dos braços.',
        ],
      },
    },
    {
      exercicioId: 4,
      ordem: 4,
      series: 3,
      descansoSegundos: 60,
      duracaoEstimadaSegundos: 45,
      exercicio: {
        id: 4,
        nome: 'Desenvolvimento com Halteres',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        instrucao: [
          'Sente-se com apoio nas costas, halteres na altura dos ombros.',
          'Empurre os halteres para cima até quase estender os cotovelos.',
          'Desça controladamente até a posição inicial.',
        ],
      },
    },
    {
      exercicioId: 5,
      ordem: 5,
      series: 3,
      descansoSegundos: 60,
      duracaoEstimadaSegundos: 45,
      exercicio: {
        id: 5,
        nome: 'Rosca Direta',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
        instrucao: [
          'Segure a barra com os braços estendidos ao lado do corpo.',
          'Flexione os cotovelos trazendo a barra até os ombros.',
          'Desça controladamente sem balançar o tronco.',
        ],
      },
    },
    {
      exercicioId: 6,
      ordem: 6,
      series: 3,
      descansoSegundos: 60,
      duracaoEstimadaSegundos: 45,
      exercicio: {
        id: 6,
        nome: 'Tríceps na Polia',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        instrucao: [
          'Segure a barra da polia com os cotovelos junto ao corpo.',
          'Estenda os braços empurrando a barra para baixo.',
          'Retorne controladamente sem afastar os cotovelos do corpo.',
        ],
      },
    },
  ],
};
