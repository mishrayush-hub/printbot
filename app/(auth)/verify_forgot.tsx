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
import { router, useLocalSearchParams } from "expo-router";

export default function VerifyForgotPassword() {
  const colorScheme = useColorScheme();
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
  const [loading, setLoading] = useState(false); // <-- Added

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
    console.log("Values:", {
      email,
      forgotToken,
      password,
      confirmPassword
    });
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.log("Forgot Password response:", data.message);
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

        {/* Mobile Input */}
        <TextInput
          className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${
            isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
          }`}
          placeholder="Reset Token"
          placeholderTextColor={isDark ? "#aaa" : "#999"}
          autoCapitalize="none"
          autoCorrect={false}
          value={forgotToken}
          onChangeText={setForgotToken}
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
            Reset Password
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <Text
          className={`${
            isDark ? "text-gray-300" : "text-gray-500"
          } text-[14px] text-center mt-4`}
        >
          Go Back to{" "}
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
