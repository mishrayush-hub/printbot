import { Stack } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function UserLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    
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
                    title: "Settings",
                    headerShadowVisible: false, // Remove header shadow to match tabs
                }} 
            />
            <Stack.Screen 
                name="change_password" 
                options={{ 
                    title: "Change Password",
                }} 
            />
            <Stack.Screen 
                name="delete_account" 
                options={{ 
                    title: "Delete Account",
                }} 
            />
        </Stack>
    );
}
