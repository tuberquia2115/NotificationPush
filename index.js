/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';

import { name as appName } from './app.json';
import {
  backgroundSubscribe,
  getInitialNotification,
  notificationListener,
  onNotificationOpenedApp,
} from './src/notification';

notificationListener();
backgroundSubscribe();
onNotificationOpenedApp();
getInitialNotification()

AppRegistry.registerComponent(appName, () => App);
