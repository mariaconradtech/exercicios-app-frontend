import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registrarTokenPush, removerTokenPush } from './treinoService';

/**
 * Registro do token Expo Push Notifications no backend (push "fora do app",
 * para o lembrete padrão, o lembrete repetido e o lembrete semanal).
 *
 * Observações importantes:
 * - Push remoto exige um dispositivo físico ou um build de desenvolvimento
 *   (EAS Build / expo-dev-client). O simulador iOS nunca recebe push remoto.
 * - A partir do SDK 53, o Expo Go deixou de suportar push remoto; para testar
 *   de ponta a ponta é necessário um "development build".
 * - `getExpoPushTokenAsync` precisa do `projectId` do EAS. Se o projeto ainda
 *   não tiver um `extra.eas.projectId` configurado (via `eas init`), o
 *   registro é pulado silenciosamente — o resto do app continua funcionando
 *   normalmente, só sem push.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function configurarCanalAndroid(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync('lembretes-treino', {
    name: 'Lembretes de treino',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 200, 200],
    lightColor: '#3b5cff',
  });
}

function obterProjectId(): string | null {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
  return typeof projectId === 'string' && projectId.length > 0 ? projectId : null;
}

/**
 * Solicita permissão, obtém o token Expo Push do dispositivo e registra no
 * backend para o participante logado. Chamado após o login (e depois da
 * escolha do avatar, se for a primeira vez).
 */
export async function registrarNotificacoesPush(participanteId: number): Promise<void> {
  try {
    if (!Device.isDevice) {
      // Emuladores/simuladores não recebem push remoto da Expo.
      return;
    }

    const projectId = obterProjectId();
    if (!projectId) {
      console.warn(
        '[pushNotifications] Projeto sem "extra.eas.projectId" configurado (rode "eas init"). ' +
          'Notificações push ficarão desativadas até essa configuração existir.',
      );
      return;
    }

    await configurarCanalAndroid();

    const permissaoAtual = await Notifications.getPermissionsAsync();
    let status = permissaoAtual.status;

    if (status !== 'granted') {
      const solicitacao = await Notifications.requestPermissionsAsync();
      status = solicitacao.status;
    }

    if (status !== 'granted') {
      return;
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    if (expoPushToken) {
      await registrarTokenPush(participanteId, expoPushToken);
    }
  } catch (error) {
    // Falha ao registrar push nunca deve impedir o uso do app.
    console.warn(
      '[pushNotifications] Não foi possível registrar o token de notificações:',
      error instanceof Error ? error.message : error,
    );
  }
}

/** Remove o token do backend (chamado no logout, para não notificar a conta errada no mesmo aparelho). */
export async function removerNotificacoesPush(participanteId: number): Promise<void> {
  try {
    await removerTokenPush(participanteId);
  } catch (error) {
    console.warn(
      '[pushNotifications] Não foi possível remover o token de notificações:',
      error instanceof Error ? error.message : error,
    );
  }
}
