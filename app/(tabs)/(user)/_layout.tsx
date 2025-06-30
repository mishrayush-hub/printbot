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
                fontSize: 20,
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
                    title: "Profile",
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
