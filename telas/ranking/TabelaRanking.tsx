import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { FaseTreino, RankingFaseDTO, RankingItemDTO } from '../../types/engajamento';
import { coresRanking, corDaFase, estiloBase, iconesPremio } from './estilo';

interface TabelaRankingProps {
  ranking: RankingFaseDTO;
  fase: FaseTreino;
  faseLabel: string;
}

const colunas = [
  { chave: 'pontos', icone: iconesPremio.pontos, rotulo: 'Pontos' },
  { chave: 'estrelas', icone: iconesPremio.estrelas, rotulo: 'Estrelas' },
  { chave: 'medalhas', icone: iconesPremio.medalhas, rotulo: 'Medalhas' },
  { chave: 'trofeus', icone: iconesPremio.trofeus, rotulo: 'Troféus' },
] as const;

function LinhaRanking({ linha }: { linha: RankingItemDTO }) {
  const nome = linha.ehVoce ? `Você (${linha.nome})` : linha.nome;

  return (
    <View
      style={[styles.linha, linha.ehVoce && styles.linhaVoce]}
      accessible
      accessibilityLabel={`${linha.posicao}º lugar, ${nome}: ${linha.pontos} pontos, ${linha.estrelas} estrelas, ${linha.medalhas} medalhas, ${linha.trofeus} troféus`}
    >
      <Text style={[styles.posicao, linha.ehVoce && styles.textoVoce]}>{linha.posicao}º</Text>
      <Text style={[styles.nome, linha.ehVoce && styles.textoVoce]} numberOfLines={1}>
        {nome}
      </Text>
      {colunas.map((coluna) => (
        <Text key={coluna.chave} style={[styles.valor, linha.ehVoce && styles.textoVoce]}>
          {linha[coluna.chave]}
        </Text>
      ))}
    </View>
  );
}

export default function TabelaRanking({ ranking, fase, faseLabel }: TabelaRankingProps) {
  const cor = corDaFase[fase];

  return (
    <View style={[estiloBase.cartao, styles.cartao]}>
      <View style={styles.cabecalho}>
        <Text style={estiloBase.tituloCartao}>Ranking da sua fase</Text>
        <View style={[styles.selo, { backgroundColor: cor.fundo }]}>
          <Text style={[styles.seloTexto, { color: cor.texto }]}>{faseLabel}</Text>
        </View>
      </View>

      <View style={styles.linhaIcones} importantForAccessibility="no-hide-descendants">
        <View style={styles.espacoPosicao} />
        <View style={styles.espacoNome} />
        {colunas.map((coluna) => (
          <View key={coluna.chave} style={styles.colunaIcone}>
            <MaterialCommunityIcons name={coluna.icone} size={24} color={cor.principal} />
          </View>
        ))}
      </View>

      {ranking.itens.map((linha) => (
        <LinhaRanking key={linha.participanteId} linha={linha} />
      ))}

      {ranking.participanteForaDoTopo && (
        <>
          <Text style={styles.reticencias} importantForAccessibility="no">
            ⋯
          </Text>
          <LinhaRanking linha={ranking.participanteForaDoTopo} />
        </>
      )}

      {ranking.itens.length === 0 && (
        <Text style={estiloBase.textoApoio}>Faça seu primeiro treino para entrar no ranking.</Text>
      )}

      <Text style={[estiloBase.textoApoio, styles.rodape]}>
        {ranking.totalParticipantes} participantes nesta fase
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    paddingHorizontal: 8,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  selo: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  seloTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
  linhaIcones: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  espacoPosicao: { width: 34 },
  espacoNome: { flex: 1 },
  colunaIcone: { width: 44, alignItems: 'center' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  linhaVoce: {
    backgroundColor: coresRanking.azulClaro,
  },
  posicao: {
    width: 34,
    fontSize: 17,
    color: coresRanking.texto,
  },
  nome: {
    flex: 1,
    fontSize: 17,
    color: coresRanking.texto,
  },
  valor: {
    width: 44,
    textAlign: 'center',
    fontSize: 17,
    color: coresRanking.texto,
  },
  textoVoce: {
    fontWeight: '700',
    color: coresRanking.azul,
  },
  reticencias: {
    textAlign: 'center',
    fontSize: 18,
    color: coresRanking.textoSecundario,
  },
  rodape: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 14,
  },
});
