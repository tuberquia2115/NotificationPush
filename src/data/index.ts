import {
  PushNotificationObject,
  PushNotificationScheduleObject,
} from 'react-native-push-notification';

export const notification: PushNotificationObject = {
  channelId: 'test-channel',
  title: 'Titulo de la notification',
  message: 'Este es el mensaje de la notificación',
  color: 'blue',
  bigText: `
    Este es un text grande que se va a desplegar por el usuario. pero necesita más texto para que se 
    pude desplegar de forma remota sin necesidades de confiragiure,Este es un text grande que se va a desplegar por el usuario. pero necesita más texto para que se 
    pude desplegar de forma remota sin necesidades de confiragiure
    `,
  priority: 'high',
  id: 21,
};

export const notificationSchule: PushNotificationScheduleObject = {
  channelId: 'test-channel',
  title: 'Alarm',
  message: 'Tu alarma de colombia sonará en 20 segundos',
  date: new Date(Date.now() + 20 * 1000),
  allowWhileIdle: true,
};
