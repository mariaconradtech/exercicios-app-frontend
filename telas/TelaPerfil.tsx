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

import { buscarPerfilParticipante } from '../services/treinoService';
import { maskCpf } from '../utils/formatCpf';
import type { PerfilParticipanteDTO } from '../types/perfil';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatarMembroDesde(dataIso: string): string {
  const data = new Date(dataIso);
  return `${MESES[data.getMonth()]} ${data.getFullYear()}`;
}

function emojiPorAvatarGenero(avatarGenero: PerfilParticipanteDTO['avatarGenero']): string {
  if (avatarGenero === 'MASCULINO') {
    return '🏋️';
  }

  if (avatarGenero === 'FEMININO') {
    return '🧘‍♀️';
  }

  return '🤖';
}

interface TelaPerfilProps {
  participanteId: number;
  onAlterarAvatar: () => void;
  onLogout: () => void;
}

export default function TelaPerfil({
  participanteId,
  onAlterarAvatar,
  onLogout,
}: TelaPerfilProps) {
  const [dados, setDados] = React.useState<PerfilParticipanteDTO | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const carregar = React.useCallback(async () => {
    try {
      setErro(null);
      const resposta = await buscarPerfilParticipante(participanteId);
      setDados(resposta);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar perfil');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3856df" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (erro || !dados) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>Não foi possível abrir o perfil</Text>
        <Text style={styles.errorDescription}>
          {erro ?? 'Verifique sua conexão e tente novamente.'}
        </Text>
        <Pressable style={styles.retryButton} onPress={carregar}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerCard}>
        <Pressable
          style={styles.avatarWrap}
          onPress={onAlterarAvatar}
          accessibilityRole="button"
          accessibilityLabel="Alterar avatar"
        >
          <Text style={styles.avatarEmoji}>{emojiPorAvatarGenero(dados.avatarGenero)}</Text>
          <View style={styles.avatarEditBadge}>
            <Text style={styles.avatarEditIcon}>✎</Text>
          </View>
        </Pressable>
        <Text style={styles.nome}>{dados.nome}</Text>
        <Text style={styles.nivelSubtitulo}>Nível {dados.categoria}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🏋️</Text>
          <Text style={styles.statValue}>{dados.totalTreinosConcluidos}</Text>
          <Text style={styles.statLabel}>Treinos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{dados.proximoNivel.treinosFaltantes}</Text>
          <Text style={styles.statLabel}>Sessões para próximo nível</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>{dados.pontos}</Text>
          <Text style={styles.statLabel}>Pontos</Text>
        </View>
      </View>

      <View style={styles.proximoNivelCard}>
        <Text style={styles.proximoNivelIcon}>🎖️</Text>
        <View>
          <Text style={styles.proximoNivelLabel}>Próximo Nível</Text>
          <Text style={styles.proximoNivelValor}>
            {dados.proximoNivel.proximoNivel ?? 'Nível máximo atingido'}
          </Text>
        </View>
      </View>

      <View style={styles.dadosCard}>
        <Text style={styles.dadosTitulo}>Dados Pessoais</Text>

        <View style={styles.dadosLinha}>
          <Text style={styles.dadosLabel}>Nome</Text>
          <Text style={styles.dadosValor}>{dados.nome}</Text>
        </View>
        <View style={styles.dadosSeparador} />

        <View style={styles.dadosLinha}>
          <Text style={styles.dadosLabel}>CPF</Text>
          <Text style={styles.dadosValor}>{maskCpf(dados.cpf)}</Text>
        </View>
        <View style={styles.dadosSeparador} />

        <View style={styles.dadosLinha}>
          <Text style={styles.dadosLabel}>Categoria</Text>
          <Text style={styles.dadosValor}>{dados.categoria}</Text>
        </View>
        <View style={styles.dadosSeparador} />

        <View style={styles.dadosLinha}>
          <Text style={styles.dadosLabel}>Membro desde</Text>
          <Text style={styles.dadosValor}>{formatarMembroDesde(dados.dataAdesao)}</Text>
        </View>
      </View>

      <Pressable style={styles.acaoBotao} onPress={onAlterarAvatar}>
        <Text style={styles.acaoIcone}>👤</Text>
        <Text style={styles.acaoTexto}>Alterar Avatar</Text>
        <Text style={styles.acaoSeta}>›</Text>
      </Pressable>

      <Pressable style={styles.logoutBotao} onPress={onLogout}>
        <Text style={styles.logoutIcone}>⇥</Text>
        <Text style={styles.logoutTexto}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    color: '#556078',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#20283b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    textAlign: 'center',
    color: '#6b7388',
    fontSize: 15,
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#4467f2',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#3b5cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9e2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 13,
    color: '#3b5cff',
  },
  nome: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#20283b',
  },
  nivelSubtitulo: {
    marginTop: 2,
    fontSize: 13,
    color: '#5e677d',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#20283b',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    color: '#7a8298',
  },
  proximoNivelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
  },
  proximoNivelIcon: {
    fontSize: 22,
  },
  proximoNivelLabel: {
    fontSize: 12,
    color: '#7a8298',
  },
  proximoNivelValor: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#20283b',
  },
  dadosCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dadosTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#20283b',
    marginBottom: 8,
  },
  dadosLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dadosLabel: {
    fontSize: 14,
    color: '#7a8298',
  },
  dadosValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20283b',
  },
  dadosSeparador: {
    height: 1,
    backgroundColor: '#eef1f8',
  },
  acaoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eaf4',
    backgroundColor: '#ffffff',
  },
  acaoIcone: {
    fontSize: 18,
    color: '#5e677d',
  },
  acaoTexto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#20283b',
  },
  acaoSeta: {
    fontSize: 20,
    color: '#b7bece',
  },
  logoutBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f7c9cc',
    backgroundColor: '#fff5f5',
  },
  logoutIcone: {
    fontSize: 16,
    color: '#e5484d',
  },
  logoutTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e5484d',
  },
});
