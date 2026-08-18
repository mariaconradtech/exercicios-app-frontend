import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';

type InstrucoesExercicioProps = {
  instrucoes: string[];
};

// Não aparece nos mockups, mas o critério de aceitação pede "nome,
// instruções" — fica colapsado por padrão para não alterar o visual da tela.
export default function InstrucoesExercicio({ instrucoes }: InstrucoesExercicioProps) {
  const [aberto, setAberto] = React.useState(false);

  if (instrucoes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setAberto((v) => !v)} style={styles.toggle} hitSlop={8}>
        <Text style={styles.toggleTexto}>{aberto ? 'Ocultar instruções' : 'Ver instruções'}</Text>
        <Text style={styles.seta}>{aberto ? '▲' : '▼'}</Text>
      </Pressable>

      {aberto ? (
        <View style={styles.lista}>
          {instrucoes.map((instrucao, indice) => (
            <View key={indice} style={styles.item}>
              <Text style={styles.marcador}>{'•'}</Text>
              <Text style={styles.itemTexto}>{instrucao}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.azul,
  },
  seta: {
    fontSize: 11,
    color: cores.azul,
  },
  lista: {
    marginTop: 6,
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    gap: 6,
  },
  marcador: {
    color: cores.textoSecundario,
  },
  itemTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoSecundario,
  },
});
