import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function LegalLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false, // Remove header shadow for consistency
      }}
    >
      <Stack.Screen 
        name="privacy-policy" 
        options={{ 
          headerShown: true,
          title: "Privacy Policy",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? 'white' : 'black',
          },
          headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            },
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            );
          }
        }} 
      />
      <Stack.Screen 
        name="terms-and-conditions" 
        options={{ 
          headerShown: true,
          title: "Terms and Conditions",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? 'white' : 'black',
          },
          headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            },
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            );
          }
        }} 
      />
      <Stack.Screen 
        name="shipping-policy" 
        options={{ 
          headerShown: true,
          title: "Shipping Policy",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? 'white' : 'black',
          },
          headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            },
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            );
          }
        }} 
      />
      <Stack.Screen 
        name="return-refund-exchange-policy" 
        options={{ 
          headerShown: true,
          title: "Return, Refund & Exchange Policy",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? 'white' : 'black',
          },
          headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
            },
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            );
          }
        }} 
      />
    </Stack>
  );
}
