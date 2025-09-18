import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { HapticTab } from '@/components/HapticTab';
import { Cog, House, ImageUp } from 'lucide-react-native';
import AnimatedTabBar from '@/components/AnimatedTabBar';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionModal from '@/components/PermissionModal';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [userName, setUserName] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const {
    permissionStatus,
    loading: permissionLoading,
    requestPermissions,
    openAppSettings,
  } = usePermissions();

  useEffect(() => {
    const fetchData = async () => {
      const name = await AsyncStorage.getItem('userName') || 'User';
      setUserName(name);
    };

    fetchData();
  }, []);

  // Show permission modal when permissions are not granted and not loading
  useEffect(() => {
    if (!permissionLoading && !permissionStatus.allGranted) {
      // Only show modal if user is logged in (has userName)
      if (userName && userName !== 'User') {
        setShowPermissionModal(true);
      }
    }
  }, [permissionLoading, permissionStatus.allGranted, userName]);

  const handleRequestPermissions = async (): Promise<boolean> => {
    const granted = await requestPermissions();
    if (granted) {
      setShowPermissionModal(false);
    }
    return granted;
  };

  const handleOpenSettings = () => {
    setShowPermissionModal(false);
    openAppSettings();
  };

  const handleDismissModal = () => {
    setShowPermissionModal(false);
  };

  const isIOS = Platform.OS === 'ios';

  const tabBarStyle = {
    backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#ffffff',
    borderTopWidth: 0,
    ...(isIOS
      ? {
          height: 86,
          paddingTop: 10,
          paddingBottom: 20,
        }
      : {
          elevation: 8,
          height: 64,
        }),
  } as any;

  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle,
          tabBarShowLabel: true,
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? 'white' : 'black',
            marginTop: -10,
          },
          headerTintColor: 'white',
        }}
      >
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Your Orders',
            tabBarIcon: ({ color }) => <ImageUp size={isIOS ? 24 : 22} color={color} />,
            tabBarLabel: 'Orders', // 👈 shown in tab bar
            headerTitleAlign: 'center', // 👈 center the header title
            headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
            headerShadowVisible: false, // 👈 remove header shadow
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: `Hello, ${userName || "User"} 👋`, // 👈 shown in header
            tabBarLabel: 'Home',     // 👈 shown in tab bar
            tabBarIcon: ({ color }) => <House size={isIOS ? 24 : 22} color={color} />,
            headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
            headerTitleAlign: 'center', // 👈 center the header title
          }}
        />
        <Tabs.Screen
          name="(user)"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Cog size={isIOS ? 24 : 22} color={color} />,
            headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
            headerShown: false,
            headerShadowVisible: false, // 👈 remove header shadow
          }}
        />
      </Tabs>

      {/* Permission Modal */}
      <PermissionModal
        visible={showPermissionModal}
        onRequestPermissions={handleRequestPermissions}
        onOpenSettings={handleOpenSettings}
        onDismiss={handleDismissModal}
        hasAskedBefore={permissionStatus.hasAskedBefore}
      />
    </>
  );
}
