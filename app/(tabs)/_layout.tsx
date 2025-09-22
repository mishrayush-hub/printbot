import AnimatedTabBar from "@/components/AnimatedTabBar";
import { Tabs as TabNative, Tabs } from "@/components/bottom-tabs";
import PermissionModal from '@/components/PermissionModal';
import { usePermissions } from '@/hooks/usePermissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Tabs as TabAndroid } from 'expo-router';
import { Platform, useColorScheme } from "react-native";
import { Cog, House, CircleUserRound, ShoppingCart } from 'lucide-react-native';
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  const [userName, setUserName] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const colorScheme = Platform.OS === 'ios' ? 'light' : (useColorScheme() ?? 'light');
  const theme = Colors[colorScheme];

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
      Platform.OS === 'ios' ? (
      <>
        <TabNative 
          hapticFeedbackEnabled={true} 
          initialRouteName="(home)"
          >
            <TabNative.Screen
              name="(home)"
              options={{
                title: "Home",
                tabBarIcon: () => require('../../assets/images/tabbar/home.svg'),
              }}
            />
            <TabNative.Screen
              name="(history)"
              options={{
                title: "History",
                tabBarIcon: () => require('../../assets/images/tabbar/cart.svg'),
              }}
            />
            <TabNative.Screen
              name="(profile)"
              options={{
                title: "Profile",
                tabBarIcon: () => require('../../assets/images/tabbar/profile.svg'),
              }}
            />
            <TabNative.Screen
              name="(setting)"
              options={{
                title: "Settings",
                tabBarIcon: () => require('../../assets/images/tabbar/cog.svg'),
              }}
            />
        </TabNative>

        {/* Permission Modal */}
        <PermissionModal
          visible={showPermissionModal}
          onRequestPermissions={handleRequestPermissions}
          onOpenSettings={handleOpenSettings}
          onDismiss={handleDismissModal}
          hasAskedBefore={permissionStatus.hasAskedBefore}
        />
      </>
  ) : (
    <>
      <TabAndroid
        initialRouteName='(home)'
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? 'white' : 'black',
            marginTop: -10
          },
          headerTintColor: 'white',
        }}
      >
        <TabAndroid.Screen
          name="(home)"
          options={{
            headerTitle: `Hello, ${userName || "User"} 👋`, // 👈 shown in header
            tabBarIcon: ({ color }) => <House size={28} color={color} />,
            tabBarLabel: 'Home', // 👈 shown in tab bar
            headerShown: false,
            headerTitleAlign: 'center', // 👈 center the header title
            headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
            headerShadowVisible: true, // 👈 remove header shadow
          }}
        />
        <TabAndroid.Screen
          name="(history)"
          options={{
            headerTitle: 'Orders', // 👈 shown in header
            tabBarLabel: 'Orders',     // 👈 shown in tab bar
            tabBarIcon: ({ color }) => <ShoppingCart size={28} color={color} />,
            headerShown: false,
            headerStyle: {
                  backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
            headerTitleAlign: 'center', // 👈 center the header title
          }}
        />
          <TabAndroid.Screen
            name="(setting)"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <Cog size={28} color={color} />,
              headerShown: false,
              headerStyle: {
                    backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                },
              headerShadowVisible: false, // 👈 remove header shadow
            }}
          />
          <TabAndroid.Screen
            name="(profile)"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <CircleUserRound size={28} color={color} />,
              headerStyle: {
                    backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                },
              headerShown: false,
              headerShadowVisible: false, // 👈 remove header shadow
            }}
          />
      </TabAndroid>

      {/* Permission Modal */}
      <PermissionModal
        visible={showPermissionModal}
        onRequestPermissions={handleRequestPermissions}
        onOpenSettings={handleOpenSettings}
        onDismiss={handleDismissModal}
        hasAskedBefore={permissionStatus.hasAskedBefore}
      />
    </>
  )
  );
}
