import { StyleSheet } from 'react-native';

import type { FaseTreino } from '../../types/engajamento';

export const coresRanking = {
  fundo: '#ffffff',
  texto: '#1d2433',
  textoSecundario: '#5a6273',
  borda: '#e4e8f0',
  azul: '#3856df',
  azulClaro: '#e8eeff',
  verde: '#1d9e75',
  verdeTexto: '#0f6e56',
  trilha: '#e6e9f0',
  roxo: '#7b67ff',
};

/** A cor dos prêmios depende da fase de treino (documento de gamificação). */
export const corDaFase: Record<FaseTreino, { principal: string; fundo: string; texto: string; nome: string }> = {
  INICIANTE: { principal: '#b8732f', fundo: '#faeeda', texto: '#633806', nome: 'Bronze' },
  INTERMEDIARIO: { principal: '#7d8a96', fundo: '#eef1f4', texto: '#3d4852', nome: 'Prata' },
  AVANCADO: { principal: '#c9971a', fundo: '#fdf4d8', texto: '#5c4306', nome: 'Ouro' },
};

/** Ícones usados para cada prêmio. */
export const iconesPremio = {
  pontos: 'circle-multiple',
  estrelas: 'star',
  medalhas: 'medal',
  trofeus: 'trophy',
} as const;

export const estiloBase = StyleSheet.create({
  cartao: {
    backgroundColor: coresRanking.fundo,
    borderWidth: 1,
    borderColor: coresRanking.borda,
    borderRadius: 14,
    padding: 14,
  },
  tituloCartao: {
    fontSize: 18,
    fontWeight: '700',
    color: coresRanking.texto,
  },
  textoApoio: {
    fontSize: 15,
    lineHeight: 21,
    color: coresRanking.textoSecundario,
  },
});
