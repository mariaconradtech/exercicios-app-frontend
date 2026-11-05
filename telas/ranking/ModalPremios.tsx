import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { FaseTreino } from '../../types/engajamento';
import { coresRanking, corDaFase, iconesPremio } from './estilo';

interface ModalPremiosProps {
  visivel: boolean;
  fase: FaseTreino;
  onFechar: () => void;
}

// Regras do documento "Telas gamificação".
const regras = [
  {
    icone: iconesPremio.pontos,
    titulo: 'Pontos',
    texto: '+10 pontos a cada treino concluído. No 2º treino da semana, você ganha +10 pontos de bônus.',
  },
  {
    icone: iconesPremio.medalhas,
    titulo: 'Medalha',
    texto: 'Fez 3 treinos na semana? Ganha uma medalha e +50 pontos de bônus.',
  },
  {
    icone: iconesPremio.estrelas,
    titulo: 'Estrela',
    texto: 'Fez 3 treinos por semana durante 3 semanas seguidas? Ganha uma estrela e +100 pontos.',
  },
  {
    icone: iconesPremio.trofeus,
    titulo: 'Troféu',
    texto: 'Ao completar cada nível de treino, você ganha um troféu, uma estrela e +100 pontos.',
  },
] as const;

export default function ModalPremios({ visivel, fase, onFechar }: ModalPremiosProps) {
  const cor = corDaFase[fase];

  React.useEffect(() => {
    if (!visivel) {
      return undefined;
    }
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => {
      onFechar();
      return true;
    });
    return () => assinatura.remove();
  }, [visivel, onFechar]);

  if (!visivel) {
    return null;
  }

  return (
    <View style={styles.fundo}>
      <View style={styles.caixa} accessibilityViewIsModal>
        <ScrollView contentContainerStyle={styles.conteudo}>
          <Text style={styles.titulo} accessibilityRole="header">
            Como ganhar prêmios
          </Text>

          {regras.map((regra) => (
            <View key={regra.titulo} style={styles.regra}>
              <View style={[styles.iconeFundo, { backgroundColor: cor.fundo }]}>
                <MaterialCommunityIcons name={regra.icone} size={28} color={cor.principal} />
              </View>
              <View style={styles.regraTexto}>
                <Text style={styles.regraTitulo}>{regra.titulo}</Text>
                <Text style={styles.regraDescricao}>{regra.texto}</Text>
              </View>
            </View>
          ))}

          <View style={styles.nota}>
            <Text style={styles.notaTexto}>
              Ao passar de fase, você entra em um novo ranking: os pontos e as medalhas recomeçam, e as
              estrelas e os troféus continuam com você.
            </Text>
          </View>
        </ScrollView>

        <Pressable
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
          onPress={onFechar}
          accessibilityRole="button"
          accessibilityLabel="Entendi, fechar explicação dos prêmios"
        >
          <Text style={styles.botaoTexto}>Entendi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: 'rgba(15, 20, 35, 0.55)',
    justifyContent: 'center',
    padding: 18,
  },
  caixa: {
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  conteudo: {
    gap: 16,
    paddingBottom: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: coresRanking.texto,
  },
  regra: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconeFundo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regraTexto: {
    flex: 1,
  },
  regraTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: coresRanking.texto,
  },
  regraDescricao: {
    fontSize: 16,
    lineHeight: 23,
    color: coresRanking.textoSecundario,
  },
  nota: {
    backgroundColor: '#f3f5f9',
    borderRadius: 12,
    padding: 12,
  },
  notaTexto: {
    fontSize: 15,
    lineHeight: 22,
    color: coresRanking.texto,
  },
  botao: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: coresRanking.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPressionado: {
    opacity: 0.85,
  },
  botaoTexto: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
