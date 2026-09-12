import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type GeneroAvatar = 'FEMININO' | 'MASCULINO';

type TelaEscolhaAvatarProps = {
  onContinue?: (genero: GeneroAvatar, nomeAvatar: string) => void | Promise<void>;
  onBackPress?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  initialGenero?: GeneroAvatar | null;
  initialNomeAvatar?: string;
};

export default function TelaEscolhaAvatar({
  onContinue,
  onBackPress,
  isSubmitting,
  errorMessage,
  initialGenero = null,
  initialNomeAvatar = '',
}: TelaEscolhaAvatarProps) {
  const [generoSelecionado, setGeneroSelecionado] = React.useState<GeneroAvatar | null>(
    initialGenero,
  );
  const [nomeAvatar, setNomeAvatar] = React.useState<string>(initialNomeAvatar);

  const nomeInformado = nomeAvatar.trim().length > 0;
  const podeContinuar =
    Boolean(generoSelecionado) && nomeInformado && Boolean(onContinue) && !isSubmitting;

  const handleContinuar = () => {
    if (!podeContinuar || !onContinue || !generoSelecionado) {
      return;
    }
    void onContinue(generoSelecionado, nomeAvatar.trim());
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        {onBackPress ? (
          <Pressable onPress={onBackPress} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        ) : null}

        <Text style={styles.title}>Escolha seu avatar</Text>
        <Text style={styles.subtitle}>Selecione o seu personagem e o nomeie</Text>

        <View style={styles.optionsRow}>
          <OpcaoGenero
            emoji="🧘‍♀️"
            label="Feminino"
            selecionado={generoSelecionado === 'FEMININO'}
            onPress={() => setGeneroSelecionado('FEMININO')}
          />
          <OpcaoGenero
            emoji="🏋️"
            label="Masculino"
            selecionado={generoSelecionado === 'MASCULINO'}
            onPress={() => setGeneroSelecionado('MASCULINO')}
          />
        </View>

        {generoSelecionado ? (
          <View style={styles.nomeField}>
            <Text style={styles.label}>Nome do avatar</Text>
            <TextInput
              style={styles.input}
              placeholder="Escolha o nome do seu avatar"
              placeholderTextColor="#9aa1af"
              value={nomeAvatar}
              onChangeText={setNomeAvatar}
              autoCapitalize="words"
              maxLength={40}
            />
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.spacer} />

        <Pressable
          style={[styles.continueButton, !podeContinuar && styles.continueButtonDisabled]}
          onPress={handleContinuar}
          disabled={!podeContinuar}
          accessibilityRole="button"
          accessibilityLabel="Continuar"
        >
          <Text style={styles.continueButtonText}>
            {isSubmitting ? 'Salvando...' : 'Continuar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type OpcaoGeneroProps = {
  emoji: string;
  label: string;
  selecionado: boolean;
  onPress: () => void;
};

function OpcaoGenero({ emoji, label, selecionado, onPress }: OpcaoGeneroProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.opcaoCard, selecionado && styles.opcaoCardSelecionada]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: selecionado }}
    >
      <Text style={styles.opcaoEmoji}>{emoji}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    maxHeight: 720,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#121826',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 12,
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700',
    color: '#20222b',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#20222b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 22,
    color: '#8b93a3',
    marginBottom: 28,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  nomeField: {
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
    color: '#20222b',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#20222b',
  },
  opcaoCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e4e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  opcaoCardSelecionada: {
    borderColor: '#7d8ce8',
    backgroundColor: '#f3f5ff',
  },
  opcaoEmoji: {
    fontSize: 44,
    lineHeight: 52,
    marginBottom: 8,
  },
  opcaoLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#20222b',
  },
  errorText: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 20,
    color: '#e5484d',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  continueButton: {
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7d8ce8',
  },
  continueButtonDisabled: {
    backgroundColor: '#e4e6f3',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
});
