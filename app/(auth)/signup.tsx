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
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState(""); // Default to India
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // <-- Added
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Refs for auto-scroll and focus
  const scrollViewRef = useRef<ScrollView>(null);
  const fullNameRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const emailRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const mobileRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const address1Ref = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const address2Ref = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const cityRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const stateRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const pincodeRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const countryRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const passwordRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const confirmPasswordRef = useRef<TextInput>(null) as React.RefObject<TextInput>;

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
    }, 100); // Small delay to ensure the keyboard animation has started
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleSignup = () => {
    if (!fullName || !email || !mobile || !address1 || !city || !state || !pincode || !country || !password || !confirmPassword) {
      setErrorMessage("All required fields must be filled.");
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
    if (pincode.length < 5) {
      setErrorMessage("Enter a valid pincode.");
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
    sendSignupRequest(email, fullName, mobile, address1, address2, city, state, pincode, country, password, confirmPassword);
  };

  const sendSignupRequest = async (
    email: string,
    fullName: string,
    mobile: string,
    address1: string,
    address2: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
    password: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    
    // console.log("Starting signup request...");
    // console.log("Request data:", {
    //   signupEmail: email,
    //   signupName: fullName,
    //   signupMobile: mobile,
    //   address1,
    //   address2,
    //   city,
    //   state,
    //   pincode,
    //   country,
    // });
    
    try {
      const requestBody = new URLSearchParams({
        signupEmail: email,
        signupName: fullName,
        signupMobile: mobile,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
        signupPassword: password,
        confirmPassword: confirmPassword
      }).toString();
      
      // console.log("Request body:", requestBody);
      
      const response = await fetch(
        "https://printbot.cloud/api/v1/signup_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
          },
          body: requestBody
        }
      );

      // console.log("Response received:");
      // console.log("Status:", response.status);
      // console.log("Status Text:", response.statusText);
      // console.log("Headers:", response.headers);
      
      // Check if response has content
      const responseText = await response.text();
      // console.log("Response text length:", responseText.length);
      // console.log("Response text:", responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${responseText}`);
      }
      
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // console.error("JSON Parse Error:", parseError);
        // console.error("Response was:", responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      setLoading(false);

      if (!response.ok || !data.success) {
        const errorMsg = data.message || `Server error (${response.status}): ${response.statusText}`;
        setErrorMessage(errorMsg);
        Alert.alert("Signup Failed", errorMsg);
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
              setAddress1("");
              setAddress2("");
              setCity("");
              setState("");
              setPincode("");
              setCountry("India");
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
      setLoading(false);
      // console.error("Signup error details:", error);
      
      let errorMessage = "An error occurred while signing up. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error instanceof Error) {
        if (error.message.includes('Empty response')) {
          errorMessage = "Server is not responding properly. Please try again later.";
        } else if (error.message.includes('Invalid JSON')) {
          errorMessage = "Server returned an invalid response. Please try again.";
        } else if (error.message.includes('HTTP')) {
          errorMessage = `Server error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }
      
      // console.error("Final error message:", errorMessage);
      Alert.alert("Signup Error", errorMessage);
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
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
        <View className="h-56 px-2 pt-7">
          <View className="flex items-center mt-6">
            <Image
              source={require("../../assets/images/splash/splash-black.png")}
              style={{ width: 150, height: 150 }}
              resizeMode="contain"
            />
            {/* <Text className="font-bold text-3xl text-white">Printbot</Text> */}
          </View>
        </View>
        <View className={`flex-1 px-4 py-4 rounded-t-[58] ${isDark ? "bg-[#1a1a1a]" : "bg-white"}`}>
        <Text
            className={`text-[30px] font-bold text-center mb-6 ${isDark ? "text-white" : "text-black"
              }`}
          >
            Sign Up
          </Text>
        {/* Form */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {errorMessage !== "" && (
            <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
          )}
          {successMessage !== "" && (
            <Text className="text-green-500 text-center mb-4">
              {successMessage}
            </Text>
          )}

          {/* Full Name Input */}
          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Full Name
          </Text>
          <TextInput
            ref={fullNameRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Full Name *"
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

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Email Address
          </Text>

          {/* Email Input */}
          <TextInput
            ref={emailRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Email Address *"
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

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Mobile Number
          </Text>

          {/* Mobile Input */}
          <TextInput
            ref={mobileRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Mobile Number *"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            value={mobile}
            onChangeText={setMobile}
            onFocus={() => scrollToInput(mobileRef)}
            onSubmitEditing={() => address1Ref.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Address Line 1
          </Text>

          {/* Address Line 1 */}
          <TextInput
            ref={address1Ref}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Address Line 1 *"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            autoCapitalize="words"
            returnKeyType="next"
            value={address1}
            onChangeText={setAddress1}
            onFocus={() => scrollToInput(address1Ref)}
            onSubmitEditing={() => address2Ref.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Address Line 2
          </Text>

          {/* Address Line 2 */}
          <TextInput
            ref={address2Ref}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Address Line 2"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            autoCapitalize="words"
            returnKeyType="next"
            value={address2}
            onChangeText={setAddress2}
            onFocus={() => scrollToInput(address2Ref)}
            onSubmitEditing={() => cityRef.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            City
          </Text>

          {/* City */}
          <TextInput
            ref={cityRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter City *"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            autoCapitalize="words"
            returnKeyType="next"
            value={city}
            onChangeText={setCity}
            onFocus={() => scrollToInput(cityRef)}
            onSubmitEditing={() => stateRef.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            State
          </Text>

          {/* State */}
          <TextInput
            ref={stateRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter State *"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            autoCapitalize="words"
            returnKeyType="next"
            value={state}
            onChangeText={setState}
            onFocus={() => scrollToInput(stateRef)}
            onSubmitEditing={() => pincodeRef.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Pincode
          </Text>

          {/* Pincode */}
          <TextInput
            ref={pincodeRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Pincode *"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            keyboardType="numeric"
            returnKeyType="next"
            value={pincode}
            onChangeText={setPincode}
            onFocus={() => scrollToInput(pincodeRef)}
            onSubmitEditing={() => countryRef.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Country
          </Text>

          {/* Country */}
          <TextInput
            ref={countryRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Country *"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            autoCapitalize="words"
            returnKeyType="next"
            value={country}
            onChangeText={setCountry}
            onFocus={() => scrollToInput(countryRef)}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Password
          </Text>

          {/* Password Input */}
          <TextInput
            ref={passwordRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
              }`}
            placeholder="Enter Password (min 6 chars)"
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
          <Text className={`text-[18px] font-semibold ml-2 mb-2 ${isDark ? "text-white" : "text-black"}`}>
            Confirm Password
          </Text>

          {/* Confirm Password Input */}
          <TextInput
            ref={confirmPasswordRef}
            className={`rounded-xl max-w-[400px] h-[51px] px-4 py-3 text-xl mb-4 ${isDark ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-black"
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
        </ScrollView>

        {/* Terms and Privacy Policy Acceptance */}
          <View className="flex-row items-center justify-center py-3 mb-2 max-w-[400px]">
            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              className="mr-3 mt-2"
            >
              <Ionicons
                name={acceptedTerms ? "checkbox" : "square-outline"}
                size={20}
                color={acceptedTerms ? "#008cff" : (isDark ? "#aaa" : "#999")}
              />
            </TouchableOpacity>
            <View className="flex-1 mt-2">
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
            className="max-w-[400px] h-[51px] bg-[#008cff] rounded-xl items-center justify-center"
            onPress={handleSignup}
          >
            <Text className="text-white text-center text-2xl font-bold">
              Sign Up
            </Text>
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
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
