import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SemanaEngajamentoDTO } from '../../types/engajamento';
import { coresRanking, estiloBase } from './estilo';

/** O que o próximo treino da semana rende, conforme as regras de gamificação. */
function textoProximoPremio(treinos: number, meta: number): string {
  if (treinos >= meta) {
    return 'Meta da semana cumprida! Seu próximo treino estará disponível na segunda-feira.';
  }
  if (treinos === 0) {
    return 'Faça o primeiro treino da semana e ganhe 10 pontos.';
  }
  if (treinos === 1) {
    return 'Mais 1 treino: 10 pontos + 10 pontos de bônus.';
  }
  return 'Mais 1 treino: +50 pontos de bônus e uma medalha.';
}


export default function CartaoSemana({ semana }: { semana: SemanaEngajamentoDTO }) {
  const { treinosRealizados, meta, semanasSeguidasCompletas, semanasParaEstrela } = semana;

  return (
    <View
      style={estiloBase.cartao}
      accessible
      accessibilityLabel={`Sua semana: ${treinosRealizados} de ${meta} treinos realizados.`}
    >
      <View style={styles.cabecalho}>
        <Text style={estiloBase.tituloCartao}>Sua semana</Text>
        <Text style={styles.contador}>
          {treinosRealizados} de {meta} treinos
        </Text>
      </View>

      <View style={styles.segmentos}>
        {Array.from({ length: meta }, (_, index) => (
          <View
            key={index}
            style={[styles.segmento, index < treinosRealizados && styles.segmentoFeito]}
          />
        ))}
      </View>

      <Text style={styles.destaque}>{textoProximoPremio(treinosRealizados, meta)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contador: {
    fontSize: 15,
    color: coresRanking.textoSecundario,
  },
  segmentos: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  segmento: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: coresRanking.trilha,
  },
  segmentoFeito: {
    backgroundColor: coresRanking.verde,
  },
  destaque: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: coresRanking.texto,
    marginBottom: 4,
  },
});
