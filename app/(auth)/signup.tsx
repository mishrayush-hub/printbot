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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";


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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Refs for auto-scroll and focus
  const scrollViewRef = useRef<ScrollView | null>(null);
  const fullNameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const mobileRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  // Auto-scroll function
  const scrollToInput = (inputRef: React.RefObject<TextInput | null>) => {
    setTimeout(() => {
      if (inputRef.current && scrollViewRef.current) {
        inputRef.current.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollTo({
            y: pageY - 150, // Offset to show input clearly above keyboard
            animated: true,
          });
        });
      }
    }, 100); // Small delay to ensure the keyboard animation has started
  };

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
    if (!acceptedTerms) {
      setErrorMessage("Please accept the Terms & Conditions and Privacy Policy.");
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
        "https://printbot.cloud/api/v1/signup_api.php",
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
              setAcceptedTerms(false);
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
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={['#2563eb', '#9333ea']} // from-blue-600 to-purple-600
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Loading Modal */}
        <Modal transparent={true} visible={loading}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </Modal>

        {/* Header */}
        <View className="h-56 px-6 pt-7">
          <View className="flex items-center mt-6">
            <Image
              source={require("../../assets/images/splash-black.png")}
              style={{ width: 150, height: 150 }}
              resizeMode="contain"
            />
            {/* <Text className="font-bold text-3xl text-white">Printbot</Text> */}
          </View>
        </View>

        {/* Form */}
        <ScrollView
          ref={scrollViewRef}
          className={`flex-1 rounded-t-[58] ${isDark ? "bg-[#1a1a1a]" : "bg-white"
            }`}
          contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className={`text-[30px] font-bold text-center mb-6 ${isDark ? "text-white" : "text-black"
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
            ref={fullNameRef}
            className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Full Name"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            value={fullName}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="name"
            autoComplete="name"
            returnKeyType="next"
            onChangeText={setFullName}
            onFocus={() => scrollToInput(fullNameRef)}
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          {/* Email Input */}
          <TextInput
            ref={emailRef}
            className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Email"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
            onFocus={() => scrollToInput(emailRef)}
            onSubmitEditing={() => mobileRef.current?.focus()}
          />

          {/* Mobile Input */}
          <TextInput
            ref={mobileRef}
            className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Mobile Number"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={mobile}
            onChangeText={setMobile}
            onFocus={() => scrollToInput(mobileRef)}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          {/* Password Input */}
          <TextInput
            ref={passwordRef}
            className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Password"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={password}
            onChangeText={setPassword}
            onFocus={() => scrollToInput(passwordRef)}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <TextInput
            ref={confirmPasswordRef}
            className={`rounded-full w-[326px] h-[51px] px-6 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Confirm Password"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => scrollToInput(confirmPasswordRef)}
            onSubmitEditing={() => Keyboard.dismiss()}
          />

          {/* Terms and Privacy Policy Acceptance */}
          <View className="flex-row items-start mb-6 w-[326px]">
            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              className="mr-3 mt-3"
            >
              <Ionicons
                name={acceptedTerms ? "checkbox" : "square-outline"}
                size={20}
                color={acceptedTerms ? "#008cff" : (isDark ? "#aaa" : "#999")}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className={`text-sm leading-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                I agree to the{" "}
                <TouchableOpacity onPress={() => router.push("/terms-and-conditions")}>
                  <Text className="text-[#008cff] font-semibold underline -mb-1">
                    Terms & Conditions
                  </Text>
                </TouchableOpacity>
                {" "}and{" "}
                <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                  <Text className="text-[#008cff] font-semibold underline -mb-1">
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className="w-[326px] h-[51px]"
            onPress={handleSignup}
          >
            <LinearGradient
              colors={['#2563eb', '#9333ea']} // from-blue-600 to-purple-600
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: '100%',
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 25.5, // Half of height (51/2) for perfect rounded corners
              }}
            >
              <Text className="text-white text-center text-2xl font-bold">
                Sign Up
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <Text
            className={`${isDark ? "text-gray-300" : "text-gray-500"
              } text-[16px] text-center mt-4`}
          >
            Already have an account?{" "}
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
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
