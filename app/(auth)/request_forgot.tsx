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
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function RequestForgotPassword() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Refs for auto-scroll and focus
  const scrollViewRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);

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

  const handleRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://printbot.cloud/api/v1/request_forgot_password_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            email: email
          }).toString()
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoading(false);
        setErrorMessage(data.message || "Request failed. Please try again.");
        Alert.alert("Request Failed", data.message || "Request failed.");
        return;
      }
      setLoading(false);
      Alert.alert(
        "Success",
        "Password reset request sent successfully. Please check your email for Change Password Token.",
        [
          {
            text: "OK",
            onPress: () => {
              setEmail("");
              setErrorMessage("");
              router.push({
                pathname: "/(auth)/verify_forgot",
                params: { email }
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      setLoading(false);
      setErrorMessage("An error occurred. Please try again.");
      Alert.alert("Error", "An error occurred while processing your request.");
      console.error("Request error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className={`bg-[#008cff] flex-1`}>
        <Modal transparent={true} visible={loading}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Modal>
        {/* Header */}
        <View className="h-56 px-6 pt-12">
          <View className="flex items-center mt-6">
            <Image
              source={require("../../assets/images/splash-white.png")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Text className="font-bold text-3xl text-white">Printbot</Text>
          </View>
        </View>

        {/* Forgot Password Box */}
        <ScrollView
          ref={scrollViewRef}
          className={`flex-1 rounded-t-[58] ${isDark ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className={`text-[30px] font-bold text-center mb-14 ${isDark ? "text-white" : "text-black"
              }`}
          >
            Reset Password
          </Text>

          {/* Error Message */}
          {errorMessage !== "" && (
            <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
          )}

          {/* Email Input */}
          <TextInput
            ref={emailRef}
            className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Email"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            value={email}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="done"
            onChangeText={setEmail}
            onFocus={() => scrollToInput(emailRef)}
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-[#008cff] w-[326px] h-[51px] rounded-full py-3"
            onPress={handleRequest}
          >
            <Text className="text-white text-center text-2xl font-bold">
              Submit
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

        {/* Privacy Policy and Terms Link - Fixed at bottom */}
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
      </View>
    </KeyboardAvoidingView>
  );
}
