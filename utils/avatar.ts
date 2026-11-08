import type { ImageSourcePropType } from 'react-native';

export type GeneroAvatar = 'FEMININO' | 'MASCULINO';

export const imagemAvatar: Record<GeneroAvatar, ImageSourcePropType> = {
  FEMININO: require('../assets/avatares/avatar_feminino.png'),
  MASCULINO: require('../assets/avatares/avatar_masculino.png'),
};

export const COR_FUNDO_AVATAR = '#e4e8f0';
export const ZOOM_AVATAR = 1;

export const PROPORCAO_MOLDURA_AVATAR = 110 / 170;
export const ROSTO_CENTRO_Y = 0.26;
export const ROSTO_LARGURA = 0.17;
