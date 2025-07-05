import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const checkAndRequestPermissions = async (): Promise<boolean> => {
  try {
    // Check current permissions
    const mediaLibraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
    const cameraStatus = await ImagePicker.getCameraPermissionsAsync();

    let needsMediaLibrary = mediaLibraryStatus.status !== 'granted';
    let needsCamera = cameraStatus.status !== 'granted';

    // If all permissions are granted, return true
    if (!needsMediaLibrary && !needsCamera) {
      return true;
    }

    // Request missing permissions
    let allGranted = true;

    if (needsMediaLibrary) {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (result.status !== 'granted') {
        allGranted = false;
      }
    }

    if (needsCamera) {
      const result = await ImagePicker.requestCameraPermissionsAsync();
      if (result.status !== 'granted') {
        allGranted = false;
      }
    }

    return allGranted;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

export const showPermissionRequiredAlert = () => {
  Alert.alert(
    'Permission Required',
    'PrintBot needs access to your photos and camera to upload documents. Please enable permissions in Settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Open Settings', 
        onPress: () => Linking.openSettings()
      },
    ]
  );
};
