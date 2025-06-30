import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ShoppingBag, House, UserRoundCog } from 'lucide-react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const name = await AsyncStorage.getItem('userName') || 'User';
      setUserName(name);
    };

    fetchData();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        // headerStyle: {
        //     height: 85,
        //   },
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: theme.tabBarBackground,
            height: 90,
            paddingTop: 10,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderTopWidth: 0,
            shadowOpacity: 0,
            marginBottom: 0,
          },
          android: {
            position: 'absolute',
            backgroundColor: theme.tabBarBackground,
            height: 70,
            paddingTop: 10,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderTopWidth: 0,
            elevation: 0,
            marginBottom: 0,
          },
        }),
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colorScheme === 'dark' ? 'white' : 'black',
          paddingBottom: 0,
        },
        headerTintColor: 'white',
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 5,
        }
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Upload History',
          tabBarIcon: ({ color }) => <ShoppingBag size={26} color={color} />,
          tabBarLabel: 'History', // 👈 shown in tab bar
          headerTitleAlign: 'center', // 👈 center the header title
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: `${userName} 👋`, // 👈 shown in header
          tabBarLabel: 'Home',     // 👈 shown in tab bar
          tabBarIcon: ({ color }) => <House size={26} color={color} />,
          headerTitleAlign: 'center', // 👈 center the header title
        }}
      />
      <Tabs.Screen
        name="(user)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserRoundCog size={26} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
