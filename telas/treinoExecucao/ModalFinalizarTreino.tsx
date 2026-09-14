import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from './cores';

type ModalFinalizarTreinoProps = {
  visivel: boolean;
  tipo?: 'confirmacao' | 'interrompido' | 'concluido';
  percentualConcluido?: number;
  onContinuar: () => void;
  onEncerrar?: () => void;
};

const mensagensAte49 = [
  'Você realizou poucos minutos de treino, isso pode prejudicar a sua saúde. E se encerrar agora, não marcará pontos no game! Tem certeza de que quer finalizar o treino agora?',
  'Você realizou poucos exercícios, isso pode prejudicar a sua saúde. E se encerrar agora, não marcará pontos no game! Tem certeza de que quer finalizar o treino agora?',
];

const mensagensDe50A95 = [
  'Falta pouco para completar todos os exercícios de hoje. Tem certeza de que quer finalizar o treino agora?',
  'Fique só mais alguns minutos, falta pouco! Você tem certeza de que quer finalizar o treino agora?',
  'Finalizando o treino agora, você não fará todos os exercícios de hoje. Quer finalizar, mesmo assim?',
  'Que tal ficar mais alguns minutos, para finalizar a sessão de hoje? Falta pouco!',
];

const mensagensInterrompido = [
  'Você se exercitou mais um dia! Parabéns! Te vejo no próximo treino!',
  'Que bom que você se movimentou um pouco hoje! Te espero no próximo treino!',
  'Bom te ver por aqui! Vamos continuar com os exercícios essa semana? Te espero aqui, para nosso próximo treino!',
];

const mensagensConcluido = [
  'Mais um dia fazendo exercícios, mais um dia vivendo melhor! Parabéns!',
  'Excelente treino! Parabéns pela dedicação com a sua saúde e a sua vida!',
  'Parabéns por mais um treino concluído! Você está cada dia melhor!',
  'Uhuuuul! Você completou mais um treino! Parabéns!',
];

function escolherMensagem(mensagens: string[]): string {
  return mensagens[Math.floor(Math.random() * mensagens.length)];
}

function mensagemConfirmacao(percentualConcluido: number): string {
  if (percentualConcluido < 50) {
    return escolherMensagem(mensagensAte49);
  }

  return escolherMensagem(mensagensDe50A95);
}

export default function ModalFinalizarTreino({
  visivel,
  tipo = 'confirmacao',
  percentualConcluido = 0,
  onContinuar,
  onEncerrar,
}: ModalFinalizarTreinoProps) {
  const [mensagem, setMensagem] = React.useState('');

  React.useEffect(() => {
    if (!visivel) {
      return;
    }

    if (tipo === 'concluido') {
      setMensagem(escolherMensagem(mensagensConcluido));
      return;
    }

    if (tipo === 'interrompido') {
      setMensagem(escolherMensagem(mensagensInterrompido));
      return;
    }

    setMensagem(mensagemConfirmacao(percentualConcluido));
  }, [percentualConcluido, tipo, visivel]);

  if (!visivel) {
    return null;
  }

  const ehMensagemFinal = tipo === 'interrompido' || tipo === 'concluido';

  return (
    <View style={styles.overlay}>
      <View style={styles.cartao}>
        <Text style={styles.titulo}>
          {tipo === 'concluido'
            ? 'Treino concluído'
            : tipo === 'interrompido'
              ? 'Treino finalizado'
              : 'Finalizar treino'}
        </Text>
        <Text style={styles.corpo}>{mensagem}</Text>

        {ehMensagemFinal ? (
          <Pressable style={styles.botaoMensagemFinal} onPress={onContinuar}>
            <Text style={styles.textoMensagemFinal}>Continuar</Text>
          </Pressable>
        ) : (
          <View style={styles.botoes}>
            <Pressable style={styles.botaoContinuar} onPress={onContinuar}>
              <Text style={styles.textoContinuar}>Retomar treino</Text>
            </Pressable>
            <Pressable style={styles.botaoEncerrar} onPress={onEncerrar}>
              <Text style={styles.textoEncerrar}>Finalizar treino</Text>
            </Pressable>
          </View>
        )}
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
  botaoMensagemFinal: {
    height: 44,
    borderRadius: 10,
    backgroundColor: cores.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoMensagemFinal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
