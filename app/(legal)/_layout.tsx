import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="privacy-policy" 
        options={{ 
          headerShown: false,
          title: "Privacy Policy"
        }} 
      />
      <Stack.Screen 
        name="terms-and-conditions" 
        options={{ 
          headerShown: false,
          title: "Terms and Conditions"
        }} 
      />
    </Stack>
  );
}
