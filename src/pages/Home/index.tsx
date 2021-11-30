import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParams } from '../../navigation';
import { sendMessage } from '../../notification/notificationServices';

interface Props extends StackScreenProps<RootStackParams, 'HomeScreen'> {}

export const HomeScreen = ({ navigation }: Props) => {
  const { top } = useSafeAreaInsets();

  const changeScreen = (screen: any) => {
    return () => {
      navigation.navigate(screen);
    };
  };

  return (
    <View style={{ ...styles.root, marginTop: top + 20 }}>
      <Text style={styles.title}>Notification - Push con FCM</Text>
      <View style={styles.btn}>
        <Button
          title="Ir a notifications push Android"
          onPress={changeScreen('NotificationsAndroidScreen')}
        />
      </View>
      <View style={styles.btn}>
        <Button
          title="Ir a notifications push IOS"
          onPress={changeScreen('NotificationsIOSScreen')}
        />
      </View>
      {Platform.OS === 'android' && (
        <View style={styles.btn}>
          <Button title="Enviar message al servidor de FCM" onPress={sendMessage} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },

  btn: {
    margin: 10,
  },
});
