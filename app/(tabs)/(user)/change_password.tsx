import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  useColorScheme,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HapticTab } from "@/components/HapticTab";
import { useNavigation } from "@react-navigation/native";

export default function ChangePassword() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [changeToken, setChangeToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async() => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (changeToken.trim() === "" || password.trim() === "" || confirmPassword.trim() === "") {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    handleConfirmChangePassword();
  };

  const handleConfirmChangePassword = async () => {
    try {
        setLoading(true);
        const email = await AsyncStorage.getItem("userEmail") || "";
      const response = await fetch(
        "https://printbot.navstream.in/verify_change_password_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            email: email,
            changeToken: changeToken,
            newPassword: password,
            confirmPassword: confirmPassword
          }).toString()
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLoading(false);
        Alert.alert(
          "Error",
          data.message || "Failed to request password change."
        );
        return;
      } else {
        setLoading(false);
        Alert.alert(
          "Success",
          "Password change request sent successfully. Please Relogin to your account.",
            [
                {
                text: "Logout",
                onPress: () => {
                    AsyncStorage.clear();
                    setChangeToken("");
                    setPassword("");
                    setConfirmPassword("");
                    router.replace("/(auth)/login");
                }
                }
            ]
        );
      }
    } catch (error) {
        setLoading(false);
        console.error("Error requesting password change:", error);
        Alert.alert("Error", "Failed to request password change.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Change Password",
      headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: colorScheme === 'dark' ? 'white' : 'black',
          paddingBottom: 20,
        },
      headerRight: () => (
        <HapticTab
          onPress={() => {
            handleChange();
          }}
        >
            <Text className={`text-lg ${isDark ? "text-white" : "text-black"}`}>
              Save
            </Text>
        </HapticTab>
      ),
      headerLeft: () => (
        <HapticTab
          onPress={() => {
            Alert.alert(
              "Discard Changes",
              "Are you sure you want to discard changes?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Discard",
                  onPress: () => {
                    setChangeToken("");
                    setPassword("");
                    setConfirmPassword("");
                    router.back();
                  }
                }
              ],
              { cancelable: true }
            );
          }}
        >
            <Text className={`text-lg ${isDark ? "text-white" : "text-black"}`}>
              Discard
            </Text>
        </HapticTab>
        ),
      headerTitleAlign: "center"
    });
  }, [colorScheme, changeToken, password, confirmPassword]);

  const inputStyle = {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "600" as "600"
  };

  return (
    <View className={`flex-1 px-6 ${isDark ? "bg-black" : "bg-white"}`}>
        <Modal transparent={true} visible={loading}>
                <View className="flex-1 justify-center items-center bg-black/50">
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              </Modal>
      <View className="mt-8">
        {/* Full Name */}
        <Text
          className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Change Token
        </Text>
        <TextInput
          value={changeToken}
          onChangeText={setChangeToken}
          editable
          placeholder="Enter Change Token"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          style={[
            inputStyle,
            {
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
              color: isDark ? "white" : "black",
              marginTop: 4
            }
          ]}
        />

        {/* Email */}
        <Text
          className={`text-lg mt-4 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          editable
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          placeholder="Enter Password"
          style={[
            inputStyle,
            {
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
              color: isDark ? "white" : "black",
              marginTop: 4
            }
          ]}
        />

        {/* Phone */}
        <Text
          className={`text-lg mt-4 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Confirm Password
        </Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable
          placeholder="Confirm Password"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          style={[
            inputStyle,
            {
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
              color: isDark ? "white" : "black",
              marginTop: 4
            }
          ]}
        />
      </View>
    </View>
  );
}
