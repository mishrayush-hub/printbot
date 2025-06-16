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

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // <-- Added

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleSignup = () => {
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
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
    sendSignupRequest(email, fullName, mobile, password, confirmPassword);
  };

  const sendSignupRequest = async (
    email: string,
    fullName: string,
    mobile: string,
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true); // <-- Start loading
    try {
      const response = await fetch(
        "https://printbot.navstream.in/signup_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            signupEmail: email,
            signupName: fullName,
            signupMobile: mobile,
            signupPassword: password,
            confirmPassword: confirmPassword
          }).toString()
        }
      );

      const data = await response.json();
      setLoading(false); // <-- Stop loading

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Signup failed. Please try again.");
        return;
      }

      Alert.alert(
        "Signup Successful",
        "Please verify your email to complete the signup process.",
        [
          {
            text: "OK",
            onPress: () => {
              setFullName("");
              setEmail("");
              setMobile("");
              setPassword("");
              setConfirmPassword("");
              router.push("/(auth)/login");
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      setLoading(false); // <-- Stop loading on error
      Alert.alert(
        "Signup Error",
        "An error occurred while signing up. Please try again later."
      );
      console.error("Signup error:", error);
      setErrorMessage("An error occurred while signing up. Please try again.");
    }
  };

  return (
    <View className={`bg-[#008cff] flex-1`}>
      {/* Loading Modal */}
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

      {/* Form */}
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
