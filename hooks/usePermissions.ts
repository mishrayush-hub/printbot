import { useState, useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PermissionStatus {
  mediaLibrary: boolean;
  camera: boolean;
  allGranted: boolean;
  hasAskedBefore: boolean;
}

export const usePermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    mediaLibrary: false,
    camera: false,
    allGranted: false,
    hasAskedBefore: false,
  });
  const [loading, setLoading] = useState(true);

  const checkPermissions = async () => {
    try {
      setLoading(true);
      
      // Check if we've asked for permissions before
      const hasAsked = await AsyncStorage.getItem('permissionsAsked');
      const hasAskedBefore = hasAsked === 'true';

      let mediaLibraryGranted = false;
      let cameraGranted = false;

      // Check Media Library permission
      const mediaLibraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      mediaLibraryGranted = mediaLibraryStatus.status === 'granted';

      // Check Camera permission
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      cameraGranted = cameraStatus.status === 'granted';

      const allGranted = mediaLibraryGranted && cameraGranted;

      setPermissionStatus({
        mediaLibrary: mediaLibraryGranted,
        camera: cameraGranted,
        allGranted,
        hasAskedBefore,
      });

      setLoading(false);
      return { mediaLibraryGranted, cameraGranted, allGranted, hasAskedBefore };
    } catch (error) {
      console.error('Error checking permissions:', error);
      setLoading(false);
      return { mediaLibraryGranted: false, cameraGranted: false, allGranted: false, hasAskedBefore: false };
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      let allGranted = true;

      // Request Media Library permission
      const mediaLibraryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaLibraryResult.status !== 'granted') {
        allGranted = false;
      }

      // Request Camera permission
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraResult.status !== 'granted') {
        allGranted = false;
      }

      // Mark that we've asked for permissions
      await AsyncStorage.setItem('permissionsAsked', 'true');

      // Re-check permissions after requesting
      await checkPermissions();

      return allGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const openAppSettings = () => {
    Alert.alert(
      'Permission Required',
      'To use all features of PrintBot, please enable the required permissions in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      'Permissions Required',
      'PrintBot needs access to your photos and camera to upload documents for printing. Please grant the necessary permissions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Grant Permissions', onPress: requestPermissions },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissionStatus,
    loading,
    checkPermissions,
    requestPermissions,
    openAppSettings,
    showPermissionDeniedAlert,
  };
};
