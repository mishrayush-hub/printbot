import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LogOut } from 'lucide-react-native';
import { Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const router = useRouter();

    const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "authToken",
                "userId",
                "userName",
                "userEmail",
                "userPhone"
              ]);
              router.replace("/(auth)/login");
            } catch (error) {
              console.error("Error during logout:", error);
            }
          }
        }
      ]
    );
  };
    
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
                    title: "Profile",
                    headerShadowVisible: true,
                    headerRight: () => (
                        <TouchableOpacity
                          onPress={() => {
                            handleLogout();
                          }}
                          style={{ marginLeft: 8 }}
                        >
                          <LogOut 
                            size={24} 
                            color={'#fe6e6eff'} 
                          />
                        </TouchableOpacity>
                    )
                }} 
            />
        </Stack>
    );
}
