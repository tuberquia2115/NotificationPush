import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItemToAsyncStorage = async (key: string, defaultValue: any = '') => {
  let item = await AsyncStorage.getItem(key);
  if (!item) item = JSON.stringify(defaultValue);
  return JSON.parse(item);
};
