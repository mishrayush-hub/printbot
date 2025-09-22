import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function LegalLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const commonHeaderOptions = {
    headerShown: true,
    headerBackTitleVisible: true,
    headerBackVisible: true,
    headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: colorScheme === 'dark' ? '#ffffff' : '#000000',
    },
    headerStyle: {
      backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF'
    },
    headerLeft: () => (
      Platform.OS === 'ios' && (
      <TouchableOpacity 
        onPress={() => router.back()}
        style={{ paddingLeft: 4 }}
      >
        <ChevronLeft 
          size={24} 
          color={colorScheme === 'dark' ? '#ffffff' : '#000000'} 
        />
      </TouchableOpacity>
      )
    ),
  };
  
  return (
    <>
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="privacy-policy" 
        options={{ 
          ...commonHeaderOptions,
          headerTitleAlign: 'center',
          title: "Privacy Policy",
        }} 
      />
      <Stack.Screen 
        name="terms-and-conditions" 
        options={{ 
          ...commonHeaderOptions,
          headerTitleAlign: 'center',
          title: "Terms and Conditions",
        }} 
      />
      <Stack.Screen 
        name="shipping-policy" 
        options={{ 
          ...commonHeaderOptions,
          headerTitleAlign: 'center',
          title: "Shipping Policy",
        }} 
      />
      <Stack.Screen 
        name="return-refund-exchange-policy" 
        options={{ 
          ...commonHeaderOptions,
          headerTitleAlign: 'center',
          title: "Return, Refund & Exchange Policy",
        }} 
      />
    </Stack>
    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
