import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { ShoppingBag, House, UserRoundCog } from 'lucide-react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
            height: 100,
          },
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
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderTopWidth: 0,
            elevation: 0,
            marginBottom: 0,
          },
        }),
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: colorScheme === 'dark' ? 'white' : 'black',
          paddingBottom: 20,
        },
        headerTintColor: 'white',
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Order History',
          tabBarIcon: ({ color }) => <ShoppingBag size={26} color={color} />,
          tabBarLabel: 'Orders', // 👈 shown in tab bar
          headerTitleAlign: 'center', // 👈 center the header title
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Ayush Mishra 👋', // 👈 shown in header
          tabBarLabel: 'Home',     // 👈 shown in tab bar
          tabBarIcon: ({ color }) => <House size={26} color={color} />,
          headerTitleAlign: 'center', // 👈 center the header title
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserRoundCog size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
