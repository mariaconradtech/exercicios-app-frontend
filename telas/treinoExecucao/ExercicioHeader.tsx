import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';

type ExercicioHeaderProps = {
  indice: number;
  total: number;
  nome: string;
  onBackPress?: () => void;
};

export default function ExercicioHeader({ indice, total, nome, onBackPress }: ExercicioHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBackPress} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <View>
        <Text style={styles.legenda}>{`Exercício ${indice}/${total}`}</Text>
        <Text style={styles.titulo}>{nome}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
  },
  backArrow: {
    fontSize: 22,
    color: cores.texto,
    fontWeight: '600',
  },
  legenda: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.texto,
  },
});
