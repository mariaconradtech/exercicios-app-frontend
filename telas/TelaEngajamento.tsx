import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { buscarEngajamento } from '../services/treinoService';
import type { EngajamentoDTO } from '../types/engajamento';
import CartaoSemana from './ranking/CartaoSemana';
import GraficoEsforco from './ranking/GraficoEsforco';
import ModalPremios from './ranking/ModalPremios';
import TabelaRanking from './ranking/TabelaRanking';
import { coresRanking } from './ranking/estilo';

interface TelaEngajamentoProps {
  participanteId: number;
}

export default function TelaEngajamento({ participanteId }: TelaEngajamentoProps) {
  const [dados, setDados] = React.useState<EngajamentoDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalPremiosVisivel, setModalPremiosVisivel] = React.useState(false);

  const carregar = React.useCallback(async () => {
    try {
      setErro(null);
      setDados(await buscarEngajamento(participanteId));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar o ranking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [participanteId]);

  React.useEffect(() => {
    carregar();
  }, [carregar]);

  const onRefresh = () => {
    setRefreshing(true);
    carregar();
  };

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={coresRanking.azul} />
        <Text style={styles.carregando}>Carregando seu progresso...</Text>
      </View>
    );
  }

  if (erro || !dados) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erroTitulo}>Não foi possível abrir o ranking</Text>
        <Text style={styles.erroDescricao}>{erro ?? 'Verifique sua conexão e tente novamente.'}</Text>
        <Pressable style={styles.botaoTentar} onPress={carregar} accessibilityRole="button">
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.pagina}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.cabecalho}>
          <Text style={styles.titulo} accessibilityRole="header">
            Ranking e progresso
          </Text>
          <Pressable
            style={({ pressed }) => [styles.botaoPremios, pressed && styles.botaoPressionado]}
            onPress={() => setModalPremiosVisivel(true)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Como ganhar prêmios"
          >
            <MaterialCommunityIcons name="help-circle-outline" size={20} color={coresRanking.azul} />
          </Pressable>
        </View>

        <View style={styles.cartaoMensagem} accessibilityLiveRegion="polite">
          <Text style={styles.mensagem}>{dados.mensagem}</Text>
        </View>

        <CartaoSemana semana={dados.semana} />
        <TabelaRanking ranking={dados.ranking} fase={dados.fase} faseLabel={dados.faseLabel} />
        <GraficoEsforco valores={dados.percepcaoEsforco} />
      </ScrollView>

      <ModalPremios
        visivel={modalPremiosVisivel}
        fase={dados.fase}
        onFechar={() => setModalPremiosVisivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  conteudo: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 12,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: {
    flexShrink: 1,
    fontSize: 24,
    fontWeight: '800',
    color: coresRanking.texto,
  },
  botaoPremios: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: coresRanking.azul,
    backgroundColor: '#ffffff',
  },
  botaoPressionado: {
    backgroundColor: coresRanking.azulClaro,
  },
  botaoPremiosTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: coresRanking.azul,
  },
  cartaoMensagem: {
    backgroundColor: coresRanking.azulClaro,
    borderWidth: 1,
    borderColor: '#c5d2ff',
    borderRadius: 14,
    padding: 16,
  },
  mensagem: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#24307a',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  carregando: {
    marginTop: 10,
    fontSize: 16,
    color: coresRanking.textoSecundario,
  },
  erroTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: coresRanking.texto,
    marginBottom: 8,
    textAlign: 'center',
  },
  erroDescricao: {
    fontSize: 16,
    lineHeight: 22,
    color: coresRanking.textoSecundario,
    textAlign: 'center',
  },
  botaoTentar: {
    marginTop: 20,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: coresRanking.azul,
  },
  botaoTentarTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
