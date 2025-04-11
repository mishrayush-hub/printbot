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
          color: 'white',
        },
        headerTintColor: 'white',
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingBag size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Printbot', // 👈 shown in header
          tabBarLabel: 'Home',     // 👈 shown in tab bar
          tabBarIcon: ({ color }) => <House size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'User Profile',
          tabBarIcon: ({ color }) => <UserRoundCog size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
