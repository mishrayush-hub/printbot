import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScanFace, Fingerprint, Key } from 'lucide-react-native';
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { checkForSessionExpiry } from "@/utils/sessionHandler";
import { useKeyboard } from '@react-native-community/hooks';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const keyboard = useKeyboard()
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, friction: 6 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
  };

  // Refs for auto-scroll and focus
  const scrollViewRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const passwordRef = useRef<TextInput>(null) as React.RefObject<TextInput>;

  // Auto-scroll function
  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollTo({
            y: pageY - 150, // Offset to show input clearly above keyboard
            animated: true,
          });
        });
      }
    }, 100);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://printbot.cloud/api/v1/login_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            loginEmail: email,
            loginPassword: password
          }).toString()
        }
      );

      if (checkForSessionExpiry(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Login failed. Please try again.");
        Alert.alert("Login Failed", data.message || "Login failed.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("authToken", data.data.authToken);
      // Save credentials securely so biometric login can use them later
      try {
        await SecureStore.setItemAsync('stored_email', email);
        await SecureStore.setItemAsync('stored_password', password);
        setHasStoredCredentials(true);
      } catch (secureErr) {
        console.warn('Failed to save credentials securely:', secureErr);
      }
      await AsyncStorage.setItem("userName", data.data.name);
      await AsyncStorage.setItem("userEmail", data.data.email);
      await AsyncStorage.setItem("userPhone", data.data.phone_number);
      await AsyncStorage.setItem("userId", data.data.user_id.toString());

      // Save address fields if available
      await AsyncStorage.setItem("userAddress1", data.data.address.address1 || "");
      await AsyncStorage.setItem("userAddress2", data.data.address.address2 || "");
      await AsyncStorage.setItem("userCity", data.data.address.city || "");
      await AsyncStorage.setItem("userState", data.data.address.state || "");
      await AsyncStorage.setItem("userPincode", data.data.address.pincode || "");
      await AsyncStorage.setItem("userCountry", data.data.address.country || "");

      router.replace("/(tabs)/(home)");
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      Alert.alert("Login Error", "An error occurred while logging in. Please try again.");
      setErrorMessage("An error occurred while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // On mount, check for stored credentials and biometric availability
  useEffect(() => {
    let mounted = true;
    const checkStoredAndBiometrics = async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync('stored_email');
        const savedPassword = await SecureStore.getItemAsync('stored_password');
        const hasCreds = !!(savedEmail && savedPassword);
        if (mounted) setHasStoredCredentials(hasCreds);

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (mounted) setBiometricsAvailable(!!(hasHardware && isEnrolled));
      } catch (err) {
        console.warn('Error checking biometrics or stored credentials:', err);
      }
    };

    checkStoredAndBiometrics();
    return () => { mounted = false; };
  }, []);

  // Biometric login: verify stored token with server after successful biometric auth
  const handleBiometricLogin = async () => {
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Biometrics Not Setup', 'No biometric authentication is set up on this device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        cancelLabel: 'Cancel'
      });

      if (!result.success) {
        Alert.alert('Authentication Failed', 'Biometric authentication failed or was cancelled.');
        return;
      }

      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUserId = await AsyncStorage.getItem('userId');
      // If token exists, try to verify it first
      if (storedToken) {
        setLoading(true);
        try {
          const body = new URLSearchParams({ authToken: storedToken, user_id: storedUserId ?? '' }).toString();
          const resp = await fetch('https://printbot.cloud/api/v1/verify_token_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body
          });
          if (checkForSessionExpiry(resp)) {
            return;
          }
          const data = await resp.json().catch(() => null);
          if (resp.ok && data && data.success) {
            router.replace('/(tabs)/(home)');
            return;
          } else {
            // Invalid token, remove it and fall through to credential flow
            await AsyncStorage.removeItem('authToken');
          }
        } catch (err) {
          console.error('Biometric verify error:', err);
        } finally {
          setLoading(false);
        }
      }

      // If we reach here, either there's no token or it was invalid. Try credentials stored securely.
      try {
        const savedEmail = await SecureStore.getItemAsync('stored_email');
        const savedPassword = await SecureStore.getItemAsync('stored_password');

        if (!savedEmail || !savedPassword) {
          Alert.alert('No Stored Credentials', 'No stored credentials found. Please login with email and password first.');
          return;
        }

        // Use saved credentials to call login API
        setLoading(true);
        const resp2 = await fetch('https://printbot.cloud/api/v1/login_api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ loginEmail: savedEmail, loginPassword: savedPassword }).toString()
        });
        if (checkForSessionExpiry(resp2)) {
          return;
        }
        const loginData = await resp2.json().catch(() => null);
        if (resp2.ok && loginData && loginData.success) {
          // Save token and profile info as existing login flow
          await AsyncStorage.setItem('authToken', loginData.data.authToken);
          await AsyncStorage.setItem('userName', loginData.data.name);
          await AsyncStorage.setItem('userEmail', loginData.data.email);
          await AsyncStorage.setItem('userPhone', loginData.data.phone_number);
          await AsyncStorage.setItem('userId', loginData.data.user_id.toString());
          // Save address fields if available
          await AsyncStorage.setItem('userAddress1', loginData.data.address.address1 || '');
          await AsyncStorage.setItem('userAddress2', loginData.data.address.address2 || '');
          await AsyncStorage.setItem('userCity', loginData.data.address.city || '');
          await AsyncStorage.setItem('userState', loginData.data.address.state || '');
          await AsyncStorage.setItem('userPincode', loginData.data.address.pincode || '');
          await AsyncStorage.setItem('userCountry', loginData.data.address.country || '');

          router.replace('/(tabs)/(home)');
        } else {
          Alert.alert('Stored Credentials Invalid', 'Stored credentials are no longer valid. Please login manually.');
          // Clear stored secure credentials to avoid repeated failures
          await SecureStore.deleteItemAsync('stored_email');
          await SecureStore.deleteItemAsync('stored_password');
          setHasStoredCredentials(false);
        }
      } catch (err) {
        console.error('Biometric credential login error:', err);
        Alert.alert('Login Error', 'An error occurred while logging in with saved credentials.');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Biometric login error:', err);
      Alert.alert('Biometric Error', 'An error occurred during biometric authentication.');
    }
  };

  const handleSignup = () => router.push("/(auth)/signup");
  const handleForgotPassword = () => router.push("/(auth)/request_forgot");

  return (
    <View
      style={{ flex: 1, backgroundColor: '#008cff' }}
    >
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View className="flex-1 justify-center items-center bg-black/40">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Modal>

      {/* Header */}
      <View className="h-56 px-6 pt-7">
        <View className="flex items-center mt-6">
          <Image
            source={require("../../assets/images/splash/splash-black.png")}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>
      </View>

      <View className={`flex-1 px-4 py-4 rounded-t-[58] ${isDark ? "bg-[#1a1a1a]" : "bg-white"}`}>
        <Text
          className={`text-[30px] font-bold text-center mb-6 ${isDark ? "text-white" : "text-black"
            }`}
        >
          Login
        </Text>

        {/* Login Box */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom:  Platform.OS === "android" && keyboard.keyboardShown ? keyboard.keyboardHeight / 1.4 : Platform.OS === "android" && !keyboard.keyboardShown ? 0 : 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
              Email Address
            </Text>

            {/* Email Input */}
            <TextInput
              ref={emailRef}
              className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-2 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
                }`}
              placeholder="Enter Email Address"
              placeholderTextColor={isDark ? "#aaa" : "#999"}
              value={email}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
              onChangeText={setEmail}
              onFocus={() => scrollToInput(emailRef)}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
              Password
            </Text>

            {/* Password Input with toggle */}
            <View
              className={`flex-row items-center rounded-xl max-w-[400px] h-[51px] px-4 mb-6 ${isDark ? "bg-[#2a2a2a]" : "bg-gray-100"
                }`}
            >
              <TextInput
                ref={passwordRef}
                className={`flex-1 text-xl ${isDark ? "text-white" : "text-black"} py-3`}
                placeholder="Enter Password"
                placeholderTextColor={isDark ? "#aaa" : "#999"}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                value={password}
                onChangeText={setPassword}
                onFocus={() => scrollToInput(passwordRef)}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="max-w-[400px] h-[51px] bg-[#008cff] rounded-xl items-center justify-center"
              onPress={handleLogin}
            >
              <Text className="text-white text-center text-2xl font-bold">
                Login
              </Text>
            </TouchableOpacity>

            {!keyboard.keyboardShown && hasStoredCredentials && biometricsAvailable && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="max-w-[400px] h-[51px] mt-3 border border-[#008cff] rounded-xl items-center justify-center"
                onPress={handleBiometricLogin}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <View className="flex-row items-center justify-center">
                    {Platform.OS === 'ios' ? (
                      <ScanFace color={isDark ? '#fff' : '#000'} size={20} />
                    ) : (
                      <Fingerprint color={isDark ? '#fff' : '#000'} size={20} />
                    )}
                    <Text className="text-black dark:text-white text-center text-lg font-medium ml-3">
                      {Platform.OS === 'ios' ? 'Login with Face ID' : 'Login with Fingerprint'}
                    </Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            )}

            {/* Sign-up Link */}
            {!keyboard.keyboardShown && (
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-500"
                } text-[16px] text-center mt-4`}
            >
              Don’t have an account?{" "}
              <TouchableOpacity onPress={handleSignup}>
                <Text
                  className={`text-[16px] font-bold -mb-1 ${isDark ? "text-white" : "text-black"
                    }`}
                >
                  Sign up
                </Text>
              </TouchableOpacity>
            </Text>
            )}

            {/* Forgot Password */}
            {!keyboard.keyboardShown && (
            <View className="items-center mt-4">
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text
                  className={`text-[16px] font-bold ${isDark ? "text-white" : "text-black"
                    }`}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Privacy Policy and Terms Link - Fixed at bottom */}
      {!keyboard.keyboardShown && (
      <View className={`px-10 pb-8 pt-4 ${isDark ? "bg-[#1a1a1a]" : "bg-white"
        }`}>
        <Text
          className={`${isDark ? "text-white" : "text-gray-500"
            } text-[14px] text-center leading-6`}
        >
          By clicking the Login button, you agree to our{" "}
          <Text
            onPress={() => router.push("/(legal)/terms-and-conditions")}
            className="text-blue-500"
          >
            Terms and Conditions
          </Text>
          {" "}and{" "}
          <Text
            onPress={() => router.push("/(legal)/privacy-policy")}
            className="text-blue-500"
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
      )}
    </View>
  );
}
