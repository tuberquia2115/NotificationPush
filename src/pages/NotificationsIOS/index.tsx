import React from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {View, Text, Button, StyleSheet, Alert, DeviceEventEmitter} from 'react-native';
import PushNotificationIOS, {
  NotificationRequest,
  PushNotification,
  PushNotificationPermissions,
} from '@react-native-community/push-notification-ios';

import {RootStackParams} from '../../navigation';
import {ScrollView} from 'react-native-gesture-handler';

interface Props extends StackScreenProps<RootStackParams, 'NotificationsIOSScreen'> {}

export const NotificationsIOSScreen = ({navigation}: Props) => {
  const [permissions, setPermissions] = React.useState({});

  const {top} = useSafeAreaInsets();

  const setNotificationCategories = () => {
    PushNotificationIOS.setNotificationCategories([
      {
        id: 'test-repeat',
        actions: [
          {id: 'open', title: 'ABRIR', options: {foreground: true}},
          {
            id: 'ignore',
            title: 'Desruptive',
            options: {foreground: true, destructive: true},
          },
          {
            id: 'text',
            title: 'Text Input',
            options: {foreground: true},
            textInput: {buttonTitle: 'Send'},
          },
        ],
      },
    ]);

    Alert.alert('setNotificationCategories', `Set notification category complete`, [
      {
        text: 'Dismiss',
        onPress: () => {},
      },
    ]);
  };

  React.useEffect(() => {
    PushNotificationIOS.addEventListener('register', onRegisterNotification);
    PushNotificationIOS.addEventListener('registrationError', onRegistrationError);
    PushNotificationIOS.addEventListener('notification', onRemoteNotification);
    PushNotificationIOS.addEventListener('localNotification', onLocalNotification);

    PushNotificationIOS.requestPermissions({
      alert: true,
      badge: true,
      sound: true,
      critical: true,
    }).then(
      (value: PushNotificationPermissions) => {
        console.log('PushNotificationIOS.requestPermissions', value);
      },
      (reason: any) => {
        console.log('PushNotificationIOS.requestPermissions failed', reason);
      },
    );
    return () => {
      PushNotificationIOS.removeEventListener('register');
      PushNotificationIOS.removeEventListener('registrationError');
      PushNotificationIOS.removeEventListener('notification');
      PushNotificationIOS.removeEventListener('localNotification');
    };
  }, []);

  const onRemoteNotification = (notification: PushNotification) => {
    const isClicked = notification.getData().userInteraction === 1;

    const result = `
      Title:  ${notification.getTitle()};\n
      Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()};\n
      Notification is clicked: ${String(isClicked)}.`;

    if (notification.getTitle() == undefined) {
      Alert.alert('Silent push notification Received', result, [
        {
          text: 'Send local push',
          onPress: sendLocalNotification,
        },
      ]);
    } else {
      Alert.alert('Push Notification Received', result, [
        {
          text: 'Dismiss',
          onPress: () => {},
        },
      ]);
    }
  };

  const onRegisterNotification = (deviceToken: string) => {
    console.log('device-token', deviceToken);
  };

  const onRegistrationError = ({code, message, details}: {code: number; message: string; details: any}) => {
    Alert.alert(
      'Failed to register for remote push',
      `Error: ${code} : ${message} DETAILS: ${JSON.stringify(details)}`,
      [
        {
          text: 'Dimiis',
          onPress: val => console.log(),
        },
      ],
    );
  };

  const onLocalNotification = (notification: PushNotification) => {
    const isClicked = notification.getData().userInteraction === 1;
    Alert.alert(
      'Local Notification received',
      `Alert Title: ${notification.getTitle()}
      Alert subtitle: NULL
      Alert message: ${notification.getMessage()}
      Badge: ${notification.getBadgeCount()}
      Sound: ${notification.getSound()}
      Action id: ${notification.getActionIdentifier()}
      User Text: ${notification.getUserText()}
      Notification is clicked: ${isClicked}
      `,
      [
        {
          text: 'Dimiss',
          onPress: val => console.log(),
        },
      ],
    );
  };

  const onAbandonPermissions = () => {
    PushNotificationIOS.abandonPermissions();
  };

  const showPermissions = () => {
    PushNotificationIOS.checkPermissions((permissions: PushNotificationPermissions) => {
      console.log('check permissions', permissions);
      setPermissions(permissions);
    });
  };

  const onAuthorizationStatus = () => {
    console.log(PushNotificationIOS.AuthorizationStatus);
  };

  const sendNotification = () => {
    DeviceEventEmitter.emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        alert: {title: 'title', subtitle: 'subtitle', body: 'body'},
        badge: 1,
        sound: 'default',
        category: 'REACT_NATIVE',
        'content-available': 1,
        'mutable-content': 1,
      },
    });
  };

  const sendSilentNotification = () => {
    DeviceEventEmitter.emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        category: 'REACT_NATIVE yo',
        'content-available': 1,
      },
    });
  };

  const sendLocalNotification = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'test-notification',
      body: 'Este es una  notification de test',
      title: 'Un nuevo curso',
      isSilent: false,
      category: 'Cursos',
      userInfo: {name: 'react', date: '12::12:12'},
      subtitle: 'Nuevo',
      badge: 1,
    });
  };

  const addNotificationRequest = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'test',
      title: 'title',
      subtitle: 'subtitle',
      body: 'body',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(Date.now() + 20 * 1000),
      repeats: true,
      userInfo: {
        image: 'https://www.github.com/Naturalclar.png',
      },
    });
  };

  const addCriticalNotificationRequest = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'critical',
      title: 'Critical Alert',
      subtitle: 'subtitle',
      body: 'This is a critical alert',
      category: 'test',
      threadId: 'thread-id',
      isCritical: true,
      fireDate: new Date(new Date().valueOf() + 2000),
      repeats: true,
    });
  };

  const addMultipleRequests = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'test-1',
      title: 'First',
      subtitle: 'subtitle',
      body: 'First Notification out of 3',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 1000),
      repeats: true,
      repeatsComponent: {
        second: true,
      },
    });

    PushNotificationIOS.addNotificationRequest({
      id: 'test-2',
      title: 'Second',
      subtitle: 'subtitle',
      body: 'Second Notification out of 3',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 1200),
      repeats: true,
    });

    PushNotificationIOS.addNotificationRequest({
      id: 'test-3',
      title: 'Third',
      subtitle: 'subtitle',
      body: 'Third Notification out of 3',
      category: 'test',
      threadId: 'thread-id',
      fireDate: new Date(new Date().valueOf() + 1400),
      repeats: true,
    });
  };

  const getPendingNotificationRequests = () => {
    PushNotificationIOS.getPendingNotificationRequests((notifications: NotificationRequest[]) => {
      Alert.alert('Push notification Received', JSON.stringify(notifications), [
        {
          text: 'Dimiss',
          onPress: val => console.log(val),
        },
      ]);
    });
  };

  const removeAllPendingNotificationRequests = () => {
    PushNotificationIOS.removeAllPendingNotificationRequests();
  };

  const removePendingNotificationRequests = () => {
    PushNotificationIOS.removePendingNotificationRequests(['test-1', 'test-2']);
  };

  const repeatNotification = () => {
    PushNotificationIOS.addNotificationRequest({
      id: 'test-repeat',
      body: 'Se repitira cada minuto',
      title: 'Repeacts',
      repeats: true,
      fireDate: new Date(Date.now() + 1 * 1000),
      repeatsComponent: {
        minute: false,
        second: true,
      },
    });
  };

  const getDeliveredNotifications = () => {
    PushNotificationIOS.getDeliveredNotifications((notifications: Record<string, any>) => {
      Alert.alert('Notifications delivered', JSON.stringify(notifications));
    });
  };

  const removeAllDeliveredNotifications = () => PushNotificationIOS.removeAllDeliveredNotifications();
  const removeDeliveredNotifications = () =>
    PushNotificationIOS.removeDeliveredNotifications(['test-repeat']);

  return (
    <View style={[styles.flex, styles.background, {top}]}>
      <SafeAreaView style={styles.flex}>
        <Text style={styles.title}>NotificationIOSScreen</Text>
        <ScrollView contentContainerStyle={styles.container}>
          <Button onPress={sendNotification} title="Enviar notificación falsa" />
          <Button onPress={sendLocalNotification} title="Enviar notificación local falsa" />
          <Button onPress={addNotificationRequest} title="Agregar solicitud de notificación" />
          <Button
            onPress={addCriticalNotificationRequest}
            title="Agregar solicitud de notificación crítica (solo funciona con el derecho de notificación crítica)"
          />
          <Button onPress={addMultipleRequests} title="Agregar varias solicitudes de notificación" />
          <Button onPress={setNotificationCategories} title="Establecer categorías de notificación" />
          <Button
            onPress={removePendingNotificationRequests}
            title="Eliminar solicitudes de notificación pendientes parciales"
          />
          <Button
            onPress={removeAllPendingNotificationRequests}
            title="Eliminar todas las solicitudes de notificación pendientes"
          />
          <Button onPress={sendSilentNotification} title="Enviar una notificación silenciosa falsa" />
          <Button
            onPress={() => PushNotificationIOS.setApplicationIconBadgeNumber(42)}
            title="Establecer la insignia del icono de la aplicación en 42"
          />
          <Button
            onPress={() => PushNotificationIOS.setApplicationIconBadgeNumber(0)}
            title="Borrar la insignia del icono de la aplicación"
          />
          <Button
            onPress={getPendingNotificationRequests}
            title="Obtenga solicitudes de notificación pendientes"
          />
          <Button title="Repetir notificación" onPress={repeatNotification} />
          <Button onPress={onAbandonPermissions} title="ABANDONAR PERMISPOS" />
          <Button
            onPress={getDeliveredNotifications}
            title="Obtener notificaciones en el centro de notificaciones"
          />

          <Button
            title=" remover todas las notifications de centro de notifications"
            onPress={removeAllDeliveredNotifications}
          />

          <Button
            title="Remover notification del centro de notificaciones por ID"
            onPress={removeDeliveredNotifications}
          />
          <View>
            <Button onPress={showPermissions} title="Mostrar permisos habilitados" />
            <Text style={styles.title}>{JSON.stringify(permissions)}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F5FCFF',
  },
  flex: {flex: 1},
  container: {
    flexGrow: 1,
    backgroundColor: '#F5FCFF',
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'blue',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
