import react from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';

function authlayout() {
    return (
        <Stack
        screenOptions={{
            headerShown: false,
        }}
        >
            <Stack.Screen name='signup' options={{ headerShown: false}} />
            <Stack.Screen name='login' options={{ headerShown: false}} />
            <Stack.Screen name='verify_forgot' options={{ headerShown: false}} />
            <Stack.Screen name='request_forgot' options={{ headerShown: false}} />
        </Stack>
    );
}

export default authlayout;