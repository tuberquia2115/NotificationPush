import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { HomeScreen } from '../pages/Home/index';
import { LoginScreen } from '../pages/Login/index';
import { NotificationsAndroidScreen } from '../pages/NotificationsAndroid';
import { options } from './styles';
import { NotificationsIOSScreen } from '../pages/NotificationsIOS';
import { getIsHeadless } from '../notification';

export type RootStackParams = {
  HomeScreen: undefined;
  LoginScreen: undefined;
  NotificationsAndroidScreen: undefined;
  NotificationsIOSScreen: undefined;
};

const Stack = createStackNavigator<RootStackParams>();
const IS_IOS = Platform.OS === 'ios';

export const Navigation = () => {
  const [isHeadless, setIsHeadless] = React.useState(false);

  React.useEffect(() => {
    if (IS_IOS) {
      getIsHeadless().then(value => setIsHeadless(value));
    }
  }, []);

  if (isHeadless) return null;

  return (
    <Stack.Navigator initialRouteName="HomeScreen" screenOptions={options}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="NotificationsAndroidScreen" component={NotificationsAndroidScreen} />
      <Stack.Screen name="NotificationsIOSScreen" component={NotificationsIOSScreen} />
    </Stack.Navigator>
  );
};
