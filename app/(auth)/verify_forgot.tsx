import React, { useState, useRef } from "react";
import {
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
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { checkForSessionExpiry } from "@/utils/sessionHandler";
import { useKeyboard } from '@react-native-community/hooks';

export default function VerifyForgotPassword() {
  const colorScheme = useColorScheme();
  const keyboard = useKeyboard()
  const isDark = colorScheme === "dark";

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const { email } = useLocalSearchParams();
  const [forgotToken, setForgotToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for auto-scroll and focus
  const scrollViewRef = useRef<ScrollView>(null);
  const forgotTokenRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const passwordRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const confirmPasswordRef = useRef<TextInput>(null) as React.RefObject<TextInput>;

  // Auto-scroll function
  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollTo({
            y: pageY - 120, // Offset to show input clearly above keyboard
            animated: true,
          });
        });
      }
    }, 100);
  };

  const handleSignup = () => {
    if (!password || !confirmPassword || !forgotToken) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (forgotToken.length < 6) {
      setErrorMessage("Enter a valid forgot token.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setErrorMessage("");
    sendForgotPassRequest(email, forgotToken, password, confirmPassword);
  };

  const sendForgotPassRequest = async (
    email: any,
    forgotToken: any,
    password: any,
    confirmPassword: any
  ) => {
    //  console.log("Values:", {
    //   email,
    //   forgotToken,
    //   password,
    //   confirmPassword
    // });
    try {
      setLoading(true);
      const response = await fetch(
        "https://printbot.cloud/api/v1/verify_forgot_password_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            email: email,
            forgotToken: forgotToken,
            newPassword: password,
            confirmPassword: confirmPassword
          }).toString()
        }
      );

      if (checkForSessionExpiry(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        // console.log("Forgot Password response:", data.message);
        setErrorMessage(
          data.message || "Forgot Password failed. Please try again."
        );
        setLoading(false);
        Alert.alert(
          "Forgot Password Failed",
          data.message || "Forgot Password failed."
        );
        return;
      }

      setLoading(false);
      Alert.alert(
        "Password Reset Successful",
        "You can now login with your new password.",
        [
          {
            text: "OK",
            onPress: () => {
              setForgotToken("");
              setPassword("");
              setConfirmPassword("");
              router.push("/(auth)/login");
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      setLoading(false);
      console.error("Forgot Password error:", error);
      Alert.alert(
        "Error",
        "An error occurred while processing your request. Please try again."
      );
      console.error("Signup error:", error);
      setErrorMessage("An error occurred while signing up. Please try again.");
    }
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: '#008cff' }}
    >
      <Modal transparent={true} visible={loading}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#fff" />
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
          Reset Password
        </Text>

        {/* Reset Password Form */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollViewRef}
            className={`flex-1 px-4 rounded-t-[58] ${isDark ? "bg-[#1a1a1a]" : "bg-white"}`}
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: Platform.OS === 'android' && keyboard.keyboardShown ? keyboard.keyboardHeight / 2 : 0 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* Error & Success Messages */}
            {errorMessage !== "" && (
              <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
            )}
            {successMessage !== "" && (
              <Text className="text-green-500 text-center mb-4">
                {successMessage}
              </Text>
            )}

            <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
              Token
            </Text>
            {/* Reset Token Input */}
            <TextInput
              ref={forgotTokenRef}
              className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
                }`}
              placeholder="Enter Reset Token *"
              placeholderTextColor={isDark ? "#aaa" : "#999"}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              returnKeyType="next"
              value={forgotToken}
              onChangeText={setForgotToken}
              onFocus={() => scrollToInput(forgotTokenRef)}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
              New Password
            </Text>

            {/* Password Input */}
            <TextInput
              ref={passwordRef}
              className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
                }`}
              placeholder="Enter New Password *"
              placeholderTextColor={isDark ? "#aaa" : "#999"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="next"
              value={password}
              onChangeText={setPassword}
              onFocus={() => scrollToInput(passwordRef)}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />

            <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
              Confirm Password
            </Text>

            {/* Confirm Password Input */}
            <TextInput
              ref={confirmPasswordRef}
              className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-10 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
                }`}
              placeholder="Enter Confirm Password *"
              placeholderTextColor={isDark ? "#aaa" : "#999"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="done"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => scrollToInput(confirmPasswordRef)}
              onSubmitEditing={handleSignup}
            />

            {/* Signup Button */}
            <TouchableOpacity
              className="max-w-[400px] h-[51px] bg-[#008cff] rounded-xl items-center justify-center"
              onPress={handleSignup}
            >
              <Text className="text-white text-center text-2xl font-bold">
                Reset Password
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <Text
              className={`${isDark ? "text-gray-300" : "text-gray-500"
                } text-[16px] text-center mt-4`}
            >
              Remembered your password?{" "}
              <TouchableOpacity onPress={handleLogin}>
                <Text
                  className={`text-[16px] font-bold ${isDark ? "text-white" : "text-black"
                    } -mb-[4px]`}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
        {/* Privacy Policy and Terms Link - Fixed at bottom */}
        <View className={`px-10 pb-8 pt-4 ${isDark ? "bg-[#1a1a1a]" : "bg-white"
          }`}>
          <Text
            className={`${isDark ? "text-white" : "text-gray-500"
              } text-[14px] text-center leading-6`}
          >
            By clicking the Reset Password button, you agree to our{" "}
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
      </View>
    </View>
  );
}
