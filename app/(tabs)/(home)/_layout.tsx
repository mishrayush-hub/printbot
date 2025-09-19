import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

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
                    title: "Dashboard",
                    headerShadowVisible: true,
                }} 
            />
        </Stack>
    );
}
