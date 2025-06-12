import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, useColorScheme, Image } from "react-native";
import { router } from "expo-router";
// import Logo from "@/components/logo";

export default function LoginScreen() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    if (email === "ayush@gmail.com" && password === "1234") {
      setErrorMessage("");
      router.push("/(tabs)");
    } else {
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };

  const handleSignup = () => {
    router.push("/(auth)/signup");
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
          <Text className={`font-bold text-3xl text-white`}>
            Printbot
          </Text>
        </View>
      </View>

      {/* Login Box */}
      <View className={`${isDark ? "bg-[#1a1a1a]" : "bg-white"} flex-1 p-8 mt-4 rounded-t-[58]`}>
        <Text className={`text-[30px] font-bold text-center mb-14 ${isDark ? "text-white" : "text-black"}`}>
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

        {/* Password Input */}
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-10 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Password"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <TouchableOpacity
          className="bg-[#008cff] w-[326px] h-[51px] rounded-full py-3"
          onPress={handleLogin}
        >
          <Text className="text-white text-center text-2xl font-bold">Login</Text>
        </TouchableOpacity>

        {/* Sign-up Link */}
        <Text className={`${isDark ? "text-gray-300" : "text-gray-500"} text-[16px] text-center mt-4 items-center`}>
          Don’t have an account?{" "}
          <TouchableOpacity onPress={handleSignup}>
            <Text className={`text-[16px] font-bold ${isDark ? "text-white" : "text-black"} items-center -mb-[4px]`}>
              Sign up
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
