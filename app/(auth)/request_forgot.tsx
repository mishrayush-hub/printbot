import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";

export default function RequestForgotPassword() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://printbot.navstream.in/request_forgot_password_api.php",
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
            source={require("../../assets/images/icon-black.png")}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
          <Text className="font-bold text-3xl text-white">Printbot</Text>
        </View>
      </View>

      {/* Forgot Password Box */}
      <View
        className={`flex-1 p-8 mt-4 rounded-t-[58] ${
          isDark ? "bg-[#1a1a1a]" : "bg-white"
        }`}
      >
        <Text
          className={`text-[30px] font-bold text-center mb-14 ${
            isDark ? "text-white" : "text-black"
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
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Email"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
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
          className={`text-center mt-4 text-[16px] ${
            isDark ? "text-gray-300" : "text-gray-500"
          }`}
        >
          Don’t have an account?{" "}
          <TouchableOpacity onPress={handleLogin}>
            <Text
              className={`text-[16px] font-bold -mb-1 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
