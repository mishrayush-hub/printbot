import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Cog, House, ImageUp } from 'lucide-react-native';
// import TabBarBackground from '@/components/ui/TabBarBackground';
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
        // tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            height: 80,
            paddingTop: 15,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            borderBottomLeftRadius: 30,
            shadowOpacity: 0,
            marginBottom: 20,
            marginHorizontal: 13.5,
            borderWidth: 0.5,
            borderColor: colorScheme === 'dark' ? '#444444' : '#CCCCCC',
          },
          android: {
           position: 'absolute',
            backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            height: 75,
            paddingTop: 11,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            borderBottomLeftRadius: 30,
            shadowOpacity: 0,
            marginBottom: 10,
            marginHorizontal: 10,
            borderWidth: 0.5,
            elevation: 10,
            borderColor: colorScheme === 'dark' ? '#444444' : '#CCCCCC',
          },
        }),
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: colorScheme === 'dark' ? 'white' : 'black',
          marginTop: -10
        },
        headerTintColor: 'white',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        }
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Upload History',
          tabBarIcon: ({ color }) => <ImageUp size={28} color={color} />,
          tabBarLabel: 'History', // 👈 shown in tab bar
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
          tabBarIcon: ({ color }) => <House size={28} color={color} />,
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
          tabBarIcon: ({ color }) => <Cog size={28} color={color} />,
          headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            },
          headerShown: false,
          headerShadowVisible: false, // 👈 remove header shadow
        }}
      />
    </Tabs>
  );
}
