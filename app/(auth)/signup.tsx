import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Image
} from "react-native";
import { router } from "expo-router";
import Logo from "@/components/logo";

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = () => {
    if (!fullName || !email || !mobile || !password) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (!email.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (mobile.length < 10) {
      setErrorMessage("Enter a valid mobile number.");
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
    setSuccessMessage("Sign Up Successful!");

    setTimeout(() => {
      router.push("/(auth)/login");
    }, 1000);
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-[#008cff]"}`}>
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

      {/* Signup Form */}
      <View
        className={`flex-1 p-8 mt-4 rounded-t-[58] ${
          isDark ? "bg-[#1a1a1a]" : "bg-white"
        }`}
      >
        <Text
          className={`text-[30px] font-bold text-center mb-6 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Sign Up
        </Text>

        {/* Error & Success Messages */}
        {errorMessage !== "" && (
          <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
        )}
        {successMessage !== "" && (
          <Text className="text-green-500 text-center mb-4">
            {successMessage}
          </Text>
        )}

        {/* Full Name Input */}
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Full Name"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          value={fullName}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="name"
          autoComplete="name"
          onChangeText={setFullName}
        />

        {/* Email Input */}
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Email"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Mobile Input */}
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Mobile Number"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          value={mobile}
          onChangeText={setMobile}
        />

        {/* Password Input */}
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Password"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-10 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Confirm Password"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Signup Button */}
        <TouchableOpacity
          className="bg-[#008cff] w-[326px] h-[51px] rounded-full py-3"
          onPress={handleSignup}
        >
          <Text className="text-white text-center text-2xl font-bold">
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <Text
          className={`${
            isDark ? "text-gray-300" : "text-gray-500"
          } text-[14px] text-center mt-4`}
        >
          Already have an account?{" "}
          <TouchableOpacity onPress={handleLogin}>
            <Text
              className={`text-[16px] font-bold ${
                isDark ? "text-white" : "text-black"
              } -mb-[4px]`}
            >
              Login
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
