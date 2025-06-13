import { Stack } from "expo-router";

export default function UserLayout() {
    return (
        <Stack
        initialRouteName="user"
        screenOptions={{
            headerShown: false,
        }
        }
        >
            <Stack.Screen name="user" options={{headerShown: true}}/>
            <Stack.Screen name="change_password" options={{headerShown: true}}/>
            <Stack.Screen name="delete_account" options={{headerShown: true}}/>
        </Stack>
    );
};
