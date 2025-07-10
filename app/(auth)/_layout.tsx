import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

function authlayout() {
    const theme = useColorScheme() ?? 'light';
    return (
        <>
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
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </>
    );
}

export default authlayout;