import { Tabs } from "@/components/bottom-tabs";
import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionModal from '@/components/PermissionModal';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
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

  return (
    <>
      <Tabs hapticFeedbackEnabled={true}>
        <Tabs.Screen
          name="(orders)"
          options={{
            title: "Orders",
            tabBarIcon: () => require('../../assets/images/tabbar/cart.svg'),
          }}
        />
        <Tabs.Screen
          name="(index)"
          options={{
            title: "Home",
            tabBarIcon: () => require('../../assets/images/tabbar/home.svg'),
          }}
        />
        <Tabs.Screen
          name="(user)"
          options={{
            title: "Settings",
            tabBarIcon: () => require('../../assets/images/tabbar/cog.svg'),
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
