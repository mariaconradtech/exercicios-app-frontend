import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  COR_FUNDO_AVATAR,
  imagemAvatar,
  PROPORCAO_MOLDURA_AVATAR,
  ROSTO_CENTRO_Y,
  ROSTO_LARGURA,
  ZOOM_AVATAR,
  type GeneroAvatar,
} from '../utils/avatar';

type AvatarImagemProps = {
  genero: GeneroAvatar | null | undefined;
  style?: StyleProp<ViewStyle>;
} & (
  | { modo?: 'corpo'; largura: number; altura: number; raio?: number }
  | { modo: 'rosto'; tamanho: number }
);

const CABECA_NO_CIRCULO = 0.42;

function imagemCorpo(genero: GeneroAvatar) {
  return (
    <Image
      source={imagemAvatar[genero]}
      resizeMode="cover"
      style={[styles.imagem, { transform: [{ scale: ZOOM_AVATAR }] }]}
    />
  );
}

export default function AvatarImagem(props: AvatarImagemProps) {
  const { genero, style } = props;
  const rotulo = genero ? `Avatar ${genero === 'FEMININO' ? 'feminino' : 'masculino'}` : 'Sem avatar';

  const largura = props.modo === 'rosto' ? props.tamanho : props.largura;
  const altura = props.modo === 'rosto' ? props.tamanho : props.altura;
  const raio = props.modo === 'rosto' ? props.tamanho / 2 : props.raio ?? 12;

  let conteudo: React.ReactNode;
  if (!genero) {
    conteudo = <MaterialCommunityIcons name="account" size={Math.round(largura * 0.6)} color="#c9cbd3" />;
  } else if (props.modo === 'rosto') {

    const molduraLargura = (props.tamanho * CABECA_NO_CIRCULO) / ROSTO_LARGURA;
    const molduraAltura = molduraLargura / PROPORCAO_MOLDURA_AVATAR;
    conteudo = (
      <View
        style={{
          position: 'absolute',
          width: molduraLargura,
          height: molduraAltura,
          left: props.tamanho / 2 - molduraLargura / 2,
          top: props.tamanho / 2 - molduraAltura * ROSTO_CENTRO_Y,
          overflow: 'hidden',
        }}
      >
        {imagemCorpo(genero)}
      </View>
    );
  } else {
    conteudo = imagemCorpo(genero);
  }

  return (
    <View
      style={[styles.moldura, { width: largura, height: altura, borderRadius: raio }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={rotulo}
    >
      {conteudo}
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: {
    overflow: 'hidden',
    backgroundColor: COR_FUNDO_AVATAR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
});
