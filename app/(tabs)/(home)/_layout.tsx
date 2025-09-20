import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";

export default function UserLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const [userName, setUserName] = useState('');

    useEffect(() => {
    const fetchData = async () => {
      const name = await AsyncStorage.getItem('userName') || 'User';
      setUserName(name);
    };

    fetchData();
  }, []);
    
    return (
        <Stack
        initialRouteName="index"
        screenOptions={{
            headerShown: true,
            headerTitleStyle: {
                fontSize: 24,
                fontWeight: 'bold',
                color: colorScheme === 'dark' ? 'white' : 'black',
            },
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            },
        }}
        >
            <Stack.Screen 
                name="index" 
                options={{ 
                    headerTitle: `Hello, ${userName || "User"} 👋`, // 👈 shown in header
                    headerShadowVisible: true,
                }} 
            />
        </Stack>
    );
}
