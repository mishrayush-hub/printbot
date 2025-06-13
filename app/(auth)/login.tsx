import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://printbot.navstream.in/login_api.php",
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Login failed. Please try again.");
        Alert.alert("Login Failed", data.message || "Login failed.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("authToken", data.data.authToken);
      await AsyncStorage.setItem("userName", data.data.name);
      await AsyncStorage.setItem("userEmail", data.data.email);
      await AsyncStorage.setItem("userPhone", data.data.phone_number);
      await AsyncStorage.setItem("userId", data.data.user_id.toString());

      router.push("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      Alert.alert("Login Error", "An error occurred while logging in. Please try again.");
      setErrorMessage("An error occurred while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => router.push("/(auth)/signup");
  const handleForgotPassword = () => router.push("/(auth)/request_forgot");

  return (
    <View className={`${isDark ? "bg-black" : "bg-[#008cff]"} flex-1`}>
      {/* Loading Modal */}
      <Modal transparent={true} animationType="fade" visible={loading}>
        <View className="flex-1 justify-center items-center bg-black/40">
          <ActivityIndicator size="large" color="#ffffff" />
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
          Login
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

        {/* Password Input with toggle */}
        <View
          className={`flex-row items-center rounded-full w-[326px] h-[51px] px-4 mb-10 ${
            isDark ? "bg-[#2a2a2a]" : "bg-gray-100"
          }`}
        >
          <TextInput
            className={`flex-1 text-xl ${isDark ? "text-white" : "text-black"}`}
            placeholder="Password"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
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
          className="bg-[#008cff] w-[326px] h-[51px] rounded-full py-3"
          onPress={handleLogin}
        >
          <Text className="text-white text-center text-2xl font-bold">
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign-up Link */}
        <Text
          className={`${
            isDark ? "text-gray-300" : "text-gray-500"
          } text-[16px] text-center mt-4`}
        >
          Don’t have an account?{" "}
          <TouchableOpacity onPress={handleSignup}>
            <Text
              className={`text-[16px] font-bold -mb-1 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </Text>

        {/* Forgot Password */}
        <View className="items-center mt-4">
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text
              className={`text-[16px] font-bold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
