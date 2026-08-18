import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AcoesTreino from './AcoesTreino';
import AnelProgresso from './AnelProgresso';
import { cores } from './cores';

type TelaDescansoProps = {
  segundosRestantes: number;
  duracaoTotalSegundos: number;
  proximaSerie: number;
  nomeProximoExercicio: string;
  pausado: boolean;
  onTogglePause: () => void;
  onFinalizar: () => void;
};

export default function TelaDescanso({
  segundosRestantes,
  duracaoTotalSegundos,
  proximaSerie,
  nomeProximoExercicio,
  pausado,
  onTogglePause,
  onFinalizar,
}: TelaDescansoProps) {
  const progresso = duracaoTotalSegundos > 0 ? segundosRestantes / duracaoTotalSegundos : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Descanso</Text>

      <View style={styles.centroWrap}>
        <View style={styles.anelWrap}>
          <AnelProgresso valor={segundosRestantes} progresso={progresso} />
        </View>

        <Text style={styles.proximoLegenda}>{`Próximo: Série ${proximaSerie}`}</Text>
        <Text style={styles.proximoNome}>{nomeProximoExercicio}</Text>
      </View>

      <View style={styles.acoesWrap}>
        <AcoesTreino pausado={pausado} onTogglePause={onTogglePause} onFinalizar={onFinalizar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  titulo: {
    fontSize: 20,
    color: cores.textoSecundario,
  },
  centroWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  anelWrap: {
    marginBottom: 24,
  },
  proximoLegenda: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginBottom: 2,
  },
  proximoNome: {
    fontSize: 16,
    fontWeight: '800',
    color: cores.texto,
  },
  acoesWrap: {
    width: '100%',
  },
});
