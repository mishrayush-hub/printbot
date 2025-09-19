import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

export default function DeleteAccount() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChange = async () => {
    if (password.trim() === "") {
      Alert.alert("Error", "Please enter your password.");
      return;
    }
    handleDeleteAccount();
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const userId = (await AsyncStorage.getItem("userId")) || "";
      const response = await fetch(
        "https://printbot.cloud/api/v1/verify_delete_account_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            user_id: userId,
            password: password
          }).toString()
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setDeleteLoading(false);
        Alert.alert(
          "Error",
          data.message || "Failed to request account deletion."
        );
        return;
      }
      setDeleteLoading(false);
      Alert.alert(
        "Success",
        "Account deletion request sent successfully. Please check your email for confirmation.",
        [
          {
            text: "Logout",
            onPress: () => {
              AsyncStorage.clear();
              setPassword("");
              router.replace("/(auth)/login");
            }
          }
        ]
      );
    } catch (error) {
      setDeleteLoading(false);
      console.error("Error requesting account deletion:", error);
      Alert.alert("Error", "Failed to request account deletion.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Delete Account",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colorScheme === "dark" ? "white" : "black",
        paddingBottom: 20
      },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            handleChange();
          }}
        >
          <Text className={`text-lg ${isDark ? "text-white" : "text-black"}`}>
            Delete
          </Text>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity
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
                    setPassword("");
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
        </TouchableOpacity>
      ),
      headerTitleAlign: "center"
    });
  }, [colorScheme, password]);

  const inputStyle = {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "600" as "600"
  };

  return (
    <View className={`flex-1 px-6 ${isDark ? "bg-black" : "bg-white"}`}>
      <Modal transparent={true} visible={deleteLoading}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
      <View className="mt-8">
        {/* Password */}
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
          secureTextEntry={false}
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
      </View>
    </View>
  );
}
