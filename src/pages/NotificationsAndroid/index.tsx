import React from 'react';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsynsStorage from '@react-native-async-storage/async-storage';

import { getChannels } from '../../notification';

export const NotificationsAndroidScreen = () => {
  const [channels, setChannels] = React.useState<string[]>([]);
  const [messages, setMessages] = React.useState([]);
  const { top } = useSafeAreaInsets();

  // AsynsStorage.clear((error) => {
  // console.log(error);
  // });

  AsynsStorage.getItem('messages').then(messages => {
    if (!messages) return;
    const m = JSON.parse(messages);
    setMessages(m);
  });

  const Message = ({ item }: { item: any }) => {
    return (
      <View style={styles.containerMessage}>
        <Text style={styles.messageTitle}>{item.title} </Text>
        <Text style={styles.messageBody}>{item.body}</Text>
      </View>
    );
  };

  return (
    <View style={{ ...styles.root, top }}>
      <Text style={styles.title}>Screen NotificationsScreen Push</Text>

      <View style={styles.containerChannels}>
        <Text style={styles.titleChannel}>Channels</Text>
        <Text style={styles.subtitle}>{JSON.stringify(channels)}</Text>
        <Button title="Obtener channels" onPress={() => getChannels(setChannels)} />
      </View>
      <FlatList
        style={styles.containerMessages}
        showsVerticalScrollIndicator={false}
        data={messages}
        renderItem={({ item }) => <Message item={item} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.fcm}>Mensajes de FCM</Text>
          </View>
        }
        horizontal={false}
      />
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
    fontSize: 25,
    marginVertical: 10,
  },
  subtitle: {
    color: '#000',
    textAlign: 'center',
    marginVertical: 5,
  },
  titleChannel: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },

  center: {
    textAlign: 'center',
  },
  containerChannels: {
    borderWidth: 1,
    borderColor: '#000',
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  containerMessages: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  containerMessage: {
    borderWidth: 1,
    borderRadius: 5,
    color: '#f9f9f9',
    margin: 5,
    padding: 5,
  },

  messageTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 3,
  },
  messageBody: {
    color: '#000000',
    fontSize: 15,
    opacity: 0.6,
  },
  fcm: {
    fontSize: 20,
    textAlign: 'center',
    color: 'purple',
    fontWeight: 'bold',
  },
});
