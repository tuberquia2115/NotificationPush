import { Platform, Alert } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification, { ChannelObject } from 'react-native-push-notification';

import { getItemToAsyncStorage } from '../utils/asyncStorage';

const permissions = { alert: true, badge: true, sound: true };
const IS_IOS = Platform.OS === 'ios';
const SDK_VERSION = messaging.SDK_VERSION;
const isAutoInitEnabled = messaging().isAutoInitEnabled;
const isDeviceRegistered = messaging().isDeviceRegisteredForRemoteMessages;

export const foregroundSubscribe = messaging().onMessage(async remoteMessage => {
  console.log('FCM Message Data:', remoteMessage);

  const messageArray: Array<any> = await getItemToAsyncStorage('messages', []);
  messageArray.push(remoteMessage.notification);

  await AsyncStorage.setItem('messages', JSON.stringify(messageArray));
});

/**
 * @description
 * Metodo que permite observar las notificaciones en segundo plano.
 */
export const backgroundSubscribe = () => {
  messaging().setBackgroundMessageHandler(async (message: FirebaseMessagingTypes.RemoteMessage) => { 
    const messageArray: Array<any> = await getItemToAsyncStorage('messages', []);
    messageArray.push(message.notification);
    
    await AsyncStorage.setItem('messages', JSON.stringify(messageArray));
  });

};

/**
 * @description
 * Metodo que permite obtener los permisións para android.
 * @returns  {Promise<void>}
 */
export const requestUserPermission = async (): Promise<void> => {
  const authStatus = await messaging().requestPermission({
    sound: true,
    alert: true,
    badge: true,
    // announcement: true,
  });
  const {
    AuthorizationStatus: { AUTHORIZED, PROVISIONAL },
  } = messaging;

  const snabled = authStatus === AUTHORIZED || authStatus === PROVISIONAL;

  if (snabled) return getFCMToken();
};

/**
 * @description
 * Metodo que permite obtener permisi
 * @returns {Promise<FirebaseMessagingTypes.AuthorizationStatus>}
 */
export const getPermissions = async (): Promise<FirebaseMessagingTypes.AuthorizationStatus> => {
  const authStatus = await messaging().hasPermission();
  return authStatus;
};

/**
 * @description
 * En iOS, es posible obtener el token APN de los usuarios.
 * Esto puede ser necesario si desea enviar mensajes a sus dispositivos iOS sin utilizar el servicio FCM.
 */
export const getAPNSToken = async () => {
  try {
    const apnsToken = await messaging().getAPNSToken();
    if (apnsToken) saveTokenDevice(apnsToken);
  } catch (error) {
    throw new Error(`Hubo un error a obtener el token APNS: ${error}`);
  }
};

/**
 * @description
 * Metodo para guardar el token del dispositivo en AsyncStorage.
 *
 * @param token token para guardar en el storage de AsyncStorage
 * @returns  {Promise<void>}
 */
const saveTokenDevice = async (token: string): Promise<void> => {
  const fcmToken = await AsyncStorage.getItem('fcmToken');

  if (fcmToken || !fcmToken) return await AsyncStorage.setItem('fcmToken', token);
};

/**
 * @description
 * Metodo para obtener el token cuando se realiza un refresh
 *
 */
const tokenRefresh = async () => {
  messaging().onTokenRefresh(async token => {
    await AsyncStorage.setItem('fcmToken', token);
  });
};

/**
 * @description
 * metodo para obtener el token de FCM.
 * del dispositivo.
 */
const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();

    if (token) await saveTokenDevice(token);
  } catch (error) {
    throw new Error(`Hubo un error al obtener el token FCM ${error}`);
  }
};

/**
 * @description
 * Metodo que permite observar el cambio de una notificación,
 * cuando la aplicación está cerrada background.
 */
export const onNotificationOpenedApp = () => {
  messaging().onNotificationOpenedApp(async (message: FirebaseMessagingTypes.RemoteMessage) => {
    const messageArray: Array<any> = await getItemToAsyncStorage('messages', []);
    messageArray.push(message.notification);
    await AsyncStorage.setItem('messages', JSON.stringify(messageArray));
  });
};

/**
 * @description
 * Metodo que permite observar cuando la aplicación se inicia con una notificatión.
 */
export const getInitialNotification = async () => {
  try {
    const value: FirebaseMessagingTypes.RemoteMessage | null =
      await messaging().getInitialNotification();
    if (value) {
      console.log('Notificatio caused app to open from quit state', value);
    }
  } catch (error) {
    throw new Error('Hubo un error al inicial la app');
  }
};

/**
 * @description
 * Metodo que permite registrarse a un topic.
 * @param topic El tema al cual se va a subscribir
 */
export const subscribeToTopic = async (topic: string) => {
  await messaging().subscribeToTopic(topic);
  Alert.alert('Subscrito', `Subscrito al topic: ${topic}`);
};

export const unsubscribeTopic = async (topic: string) => {
  await messaging().unsubscribeFromTopic(topic);
  Alert.alert('Subscripción Cancelada', `Se cancelo la subscripción al tema: ${topic}`);
};

/**
 *  Metodo para anular el registro de la aplicación para recibir notificaciones remotas en IOS
 * @returns {Promise<Void>}
 */
export const unRegisterAppWithFCMIOS = async (): Promise<void> => {
  if (!isDeviceRegistered) return;
  await messaging().unregisterDeviceForRemoteMessages();
};

/**
 *  @description
 *  En iOS, si su aplicación desea recibir mensajes remotos de FCM (a través de APN),
 *  debe registrarse explícitamente con APN si el registro automático ha sido deshabilitado.
 *
 *  Puede llamar a este método de forma segura en Android sin verificaciones de plataforma.
 *  Es una operación no operativa en Android y promete resolver el vacío.
 *
 *  Puede llamar de forma segura a este método varias veces, si la aplicación ya está registrada,
 *  este método se resuelve de inmediato.
 *
 *  @returns {Promise<Void>}
 */
export const registerAppWithFCMFromIOS = async (): Promise<void> => {
  if (isDeviceRegistered) return;
  await messaging().registerDeviceForRemoteMessages();
};

/**
 * @description
 * Returns wether the root view is headless or not i.e 
 * true if the app was launched in the background (for example, by data-only cloud message);
 * 
 * More info: https://rnfirebase.io/messaging/usage#background-application-state

 * @returns {Promise<boolean>}
 */
export const getIsHeadless = async (): Promise<boolean> => await messaging().getIsHeadless();

/**
 * @description
 * Al enviar un RemoteMessage, se llama a este oyente cuando el mensaje se ha enviado a FCM.
 * Devuelve una función de cancelación de suscripción para dejar de escuchar los mensajes enviados.
 */
export const unsubscribeOnMessageSent = messaging().onMessageSent(messageId => {
  console.log('Message has been sent to the FCM server', messageId);
});

/**
 * @description
 * Al enviar un RemoteMessage, 
 * se llama a este oyente cuando se produce un error y no se pudo enviar el mensaje.
 * Devuelve una función de cancelación de suscripción para dejar de escuchar los errores enviados.
 */
const unsubscribeOnsendError = messaging().onSendError(({ messageId, error }) => {
  console.log('An error occurred when sending a message to FCM', messageId, error);
});

export const listenerDeleteMessage = () => {
  console.log("se elimino")
}

/**
 * 
 * @param fn Function que se ejecuta cuando se elimina un mensaje en FCM.
 * @returns {() => void}
 */
export const onDeletedMessages = (fn: () => void): () => void => messaging().onDeletedMessages(fn);

/**
 * @description
 * Metodo que permite Eliminar el token de un dispositivo.
 * @returns 
 */
export const deleteToken = async () => await messaging().deleteToken();

/**
 * @description
 * Establece si la inicialización automática para mensajería está habilitada o deshabilitada.
 *
 * Configúrelo en falso para permitir un flujo de "aceptación primero" para sus usuarios.
 * De forma predeterminada, la inicialización automática está habilitada,
 * que actualiza el identificador del dispositivo y los datos de configuración
 * necesarios para enviar mensajes a Firebase.
 * @param enabled valor de tipo boolean
 * @returns {Promise<void>}
 */
export const setAutoInitEnabled = async (enabled: boolean): Promise<void> => {
  await messaging().setAutoInitEnabled(enabled);
};

export const sendMessage = () => {
  const message: FirebaseMessagingTypes.RemoteMessage = {
    data: {
      loggedIn: Date.now().toString(),
      uid: '979586DFGHDFGH',
    },
    notification: {
      title: 'Un nuevo mensaje enviado',
      body: 'Se envio con la función sendMessage',
    },
  };

  messaging()
    .sendMessage(message)
    .then(value => {
      console.log('value: sendMessage()', value);
    });
};

// METODOS PARA FUNCIONALIDADES LOCALES PARA NOTIFICATIONS PUSH

export const configurePushNotification = () => {
  PushNotification.configure({
    onRegister: ({ token }) => console.log(token, 'react-native-push-notification'),
    onNotification: notification => notification.finish(PushNotificationIOS.FetchResult.NoData),
    requestPermissions: IS_IOS,
    onRegistrationError: err => console.error('Error al conectar notification remoto', err),
    popInitialNotification: true,
    ...(IS_IOS ? { permissions } : {}),
    onRemoteFetch: notificationData => console.log('notificationData', notificationData),
  });
};

/**
 * @description
 * Crear un canal de notification
 */
export const createChannels = (objChannel: ChannelObject) => {
  PushNotification.createChannel(objChannel, created => {
    console.log('Se creo el canal', created);
  });
};

/**
 * @description
 * Metodo para obtener todos los canales creados
 * @param setChannels
 */
export const getChannels = (setChannels: (value: string[]) => void) => {
  PushNotification.getChannels(channels => {
    setChannels(channels);
  });
};

export const notificationListener = () => {
  registerAppWithFCMFromIOS();
  requestUserPermission();
  foregroundSubscribe();
  tokenRefresh();
  unsubscribeOnMessageSent();
  unsubscribeOnsendError();
};
