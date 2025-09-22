import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export const handleSessionExpired = async () => {
  Alert.alert(
    "Session Expired!",
    "Your session has expired. Please login again.",
    [
      {
        text: "OK",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            try {
              await SecureStore.deleteItemAsync('stored_email');
              await SecureStore.deleteItemAsync('stored_password');
            } catch (secureErr) {
              console.warn('Error clearing secure store:', secureErr);
            }
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Error during logout:', error);
            router.replace('/(auth)/login');
          }
        },
      }
    ],
    { cancelable: false }
  );
};

export const checkForSessionExpiry = (response: Response) => {
  if (response.status === 401) {
    handleSessionExpired();
    return true;
  }
  return false;
};