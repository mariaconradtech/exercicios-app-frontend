import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatCpf } from '../utils/formatCpf';
import IconeOlho from './IconeOlho';

type TelaLoginProps = {
  onSubmit?: (cpf: string, senha: string) => void | Promise<void>;
  onForgotPasswordPress?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

export default function TelaLogin({
  onSubmit,
  onForgotPasswordPress,
  isSubmitting,
  errorMessage,
}: TelaLoginProps) {
  const [cpf, setCpf] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [senhaVisivel, setSenhaVisivel] = React.useState(false);

  const podeEnviar = Boolean(onSubmit) && !isSubmitting;

  const handleSubmit = () => {
    if (!podeEnviar || !onSubmit) {
      return;
    }

    const cpfSomenteDigitos = cpf.replace(/\D/g, '');
    void onSubmit(cpfSomenteDigitos, senha);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meraki</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.field}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            placeholderTextColor="#9aa1af"
            value={cpf}
            onChangeText={(texto) => setCpf(formatCpf(texto))}
            keyboardType="numeric"
            maxLength={14}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Sua senha"
              placeholderTextColor="#9aa1af"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!senhaVisivel}
            />
            <Pressable onPress={() => setSenhaVisivel((atual) => !atual)} hitSlop={10}>
              <IconeOlho visivel={senhaVisivel} />
            </Pressable>
          </View>
        </View>

        <Pressable onPress={onForgotPasswordPress} hitSlop={8} style={styles.forgotPasswordWrap}>
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.spacer} />

        <Pressable
          style={[styles.submitButton, !podeEnviar && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!podeEnviar}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
        </Pressable>
      </View>
    </View>
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
  header: {
    backgroundColor: '#4467f2',
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#4467f2',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  inputFlex: {
    flex: 1,
    fontSize: 17,
    color: '#20222b',
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#4467f2',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 20,
    color: '#e5484d',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  submitButton: {
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4467f2',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
});
