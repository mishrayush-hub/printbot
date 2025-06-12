import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Image,
  Alert
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AuthLogin } from "../../hooks/authLogin";
// import Logo from "@/components/logo";

export default function RequestForgotPassword() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequest = async () => {
    try {
      const response = await fetch(
        "https://printbot.navstream.in/request_forgot_password_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            email: email,
          }).toString()
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Login failed. Please try again.");
        Alert.alert("Request Failed", data.message || "Request failed.");
        return;
      }
      // console.log("Request successful!");
      router.push({
        pathname: "/(auth)/verify_forgot",
        params: { email },
      });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred while logging in. Please try again.");
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <View className={`${isDark ? "bg-black" : "bg-[#008cff]"} flex-1`}>
      {/* Header */}
      <View className="h-56 px-6 pt-12">
        <View className="flex items-center mt-6">
          <Image
            source={require("../../assets/images/icon-black.png")}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />
          <Text className={`font-bold text-3xl text-white`}>Printbot</Text>
        </View>
      </View>

      {/* Login Box */}
      <View
        className={`${
          isDark ? "bg-[#1a1a1a]" : "bg-white"
        } flex-1 p-8 mt-4 rounded-t-[58]`}
      >
        <Text
          className={`text-[30px] font-bold text-center mb-14 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Reset Passowrd
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
        {/* Login Button */}
        <TouchableOpacity
          className="bg-[#008cff] w-[326px] h-[51px] rounded-full py-3"
          onPress={handleRequest}
        >
          <Text className="text-white text-center text-2xl font-bold">
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign-up Link */}
        <Text
          className={`${
            isDark ? "text-gray-300" : "text-gray-500"
          } text-[16px] text-center mt-4 items-center`}
        >
          Don’t have an account?{" "}
          <TouchableOpacity onPress={handleLogin}>
            <Text
              className={`text-[16px] font-bold ${
                isDark ? "text-white" : "text-black"
              } items-center -mb-[4px]`}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
