import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';

type StatBoxProps = {
  label: string;
  valor: string;
};

export default function StatBox({ label, valor }: StatBoxProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    paddingVertical: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: cores.textoSecundario,
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.texto,
  },
});
