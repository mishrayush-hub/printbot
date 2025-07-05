import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Shield, Camera, Image, Settings } from 'lucide-react-native';

interface PermissionModalProps {
  visible: boolean;
  onRequestPermissions: () => Promise<boolean>;
  onOpenSettings: () => void;
  onDismiss: () => void;
  hasAskedBefore: boolean;
}

export default function PermissionModal({
  visible,
  onRequestPermissions,
  onOpenSettings,
  onDismiss,
  hasAskedBefore,
}: PermissionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRequestPermissions = async () => {
    try {
      const granted = await onRequestPermissions();
      if (granted) {
        onDismiss();
      } else {
        // Show alert asking to go to settings
        Alert.alert(
          'Permissions Required',
          'Some permissions were denied. To use all features of PrintBot, please enable permissions in Settings.',
          [
            { text: 'Later', style: 'cancel', onPress: onDismiss },
            { text: 'Open Settings', onPress: onOpenSettings },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl`}>
          {/* Header */}
          <View className="items-center mb-6">
            <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-100'} p-4 rounded-full mb-4`}>
              <Shield size={32} color={isDark ? '#60a5fa' : '#3b82f6'} />
            </View>
            <Text className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'} leading-6`}>
              {hasAskedBefore ? 'Permissions Required' : 'Welcome to PrintBot!'}
            </Text>
            <Text className={`text-sm text-center mt-3 leading-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {hasAskedBefore 
                ? 'Please enable the required permissions to continue using all features.'
                : 'To provide the best experience, PrintBot needs access to your device.'
              }
            </Text>
          </View>

          {/* Permissions List */}
          <View className="mb-6 space-y-4 gap-2">
            <View className="flex-row items-center">
              <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg mr-4`}>
                <Image size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </View>
              <View className="flex-1">
                <Text className={`font-medium text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Photo Library Access
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  To upload and save your documents
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg mr-4`}>
                <Camera size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </View>
              <View className="flex-1">
                <Text className={`font-medium text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Camera Access
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  To capture documents directly
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View>
            {hasAskedBefore ? (
              <>
                <TouchableOpacity
                  onPress={onOpenSettings}
                  className="bg-blue-500 py-4 px-6 rounded-lg flex-row items-center justify-center mb-3"
                >
                  <Settings size={18} color="white" />
                  <Text className="text-white font-medium ml-2 text-base">
                    Open Settings
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleRequestPermissions}
                  className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} py-4 px-6 rounded-lg`}
                >
                  <Text className={`text-center font-medium text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleRequestPermissions}
                  className="bg-blue-500 py-4 px-6 rounded-lg mb-3"
                >
                  <Text className="text-white font-medium text-center text-base">
                    Grant Permissions
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={onDismiss}
                  className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} py-4 px-6 rounded-lg`}
                >
                  <Text className={`text-center font-medium text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
