import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { Navigation } from './src/navigation';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  React.useEffect(() => {
    const unsubscribeOnMessageSent = messaging().onMessageSent(messageId => {
      console.log('Message has been sent to the FCM server', messageId);
    });
    const unsubscribeOnSendError = messaging().onSendError(({ messageId, error }) => {
      console.log('An error occurred when sending a message to FCM', messageId, error);
    });
    return () => {
      unsubscribeOnMessageSent();
      unsubscribeOnSendError();
    };
  }, []);
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
};

export default App;
