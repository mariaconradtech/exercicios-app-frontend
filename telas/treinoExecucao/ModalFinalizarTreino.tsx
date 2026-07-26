import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';

type ModalFinalizarTreinoProps = {
  visivel: boolean;
  onContinuar: () => void;
  onEncerrar: () => void;
};

export default function ModalFinalizarTreino({ visivel, onContinuar, onEncerrar }: ModalFinalizarTreinoProps) {
  if (!visivel) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.cartao}>
        <Text style={styles.titulo}>Finalizar treino</Text>
        <Text style={styles.corpo}>Tem certeza que deseja encerrar o treino?</Text>

        <View style={styles.botoes}>
          <Pressable style={styles.botaoContinuar} onPress={onContinuar}>
            <Text style={styles.textoContinuar}>Continuar</Text>
          </Pressable>
          <Pressable style={styles.botaoEncerrar} onPress={onEncerrar}>
            <Text style={styles.textoEncerrar}>Encerrar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 24, 33, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cartao: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    backgroundColor: cores.cartao,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: cores.texto,
    marginBottom: 8,
  },
  corpo: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoSecundario,
    marginBottom: 20,
  },
  botoes: {
    flexDirection: 'row',
    gap: 10,
  },
  botaoContinuar: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoContinuar: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.texto,
  },
  botaoEncerrar: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoEncerrar: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
