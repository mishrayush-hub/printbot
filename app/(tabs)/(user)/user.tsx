import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HapticTab } from "@/components/HapticTab";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Cart() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [uid, setUid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const navigation = useNavigation();
  const [editProfile, setEditProfile] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://printbot.navstream.in/request_change_password_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            authToken: authToken,
            user_id: uid,
            email: email
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
          "Password change request sent successfully. Please check your email for Password Change Token.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push("/(tabs)/(user)/change_password");
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
  const handleEditProfile = async () => {
    try {
      setLoading(true);
      const sendData: { [key: string]: string } = {};
      if (name.trim() !== "") sendData.user_name = name;
      if (email.trim() !== "") sendData.user_email = email;
      if (phone.trim() !== "") sendData.user_phone = phone;
      if (authToken.trim() !== "") sendData.authToken = authToken;
      if (uid.trim() !== "") sendData.user_id = uid;
      
      const response = await fetch(
        "https://printbot.navstream.in/update_profile_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(sendData).toString()
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLoading(false);
        Alert.alert(
          "Error",
          data.message || "Failed to update profile."
        );
        return;
      } else {
        setLoading(false);
        setEditProfile(false);
        await AsyncStorage.setItem("userName", name);
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userPhone", phone);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const response = await fetch(
        "https://printbot.navstream.in/request_delete_account_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            authToken: authToken,
            user_id: uid
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
      } else {
        setDeleteLoading(false);
        Alert.alert(
          "Success",
          "Account deletion request sent successfully. Please enter your password to confirm.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push("/(tabs)/(user)/delete_account");
              }
            }
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      setDeleteLoading(false);
      console.error("Error requesting account deletion:", error);
      Alert.alert("Error", "Failed to request account deletion.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colorScheme === "dark" ? "white" : "black",
        paddingBottom: 20
      },
      headerRight: () => (
        <HapticTab
          onPress={() => {
            if (editProfile) {
              Alert.alert(
                "Discard Changes",
                "Are you sure you want to discard changes?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Discard",
                    onPress: () => {
                      setEditProfile(false);
                      handleEditProfile();
                    }
                  }
                ],
                { cancelable: true }
              );
            } else {
              AsyncStorage.clear();
              Alert.alert(
                "Log Out",
                "Are you sure you want to log out?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      setUid("");
                      setAuthToken("");
                      setName("");
                      setEmail("");
                      setPhone("");
                      AsyncStorage.clear();
                      router.replace("/(auth)/login");
                    }
                  }
                ],
                { cancelable: true }
              );
            }
          }}
        >
          {editProfile ? (
            <AntDesign
              name="close"
              size={24}
              color={isDark ? "white" : "black"}
              style={{ marginRight: 15 }}
            />
          ) : (
            <MaterialIcons
              name="logout"
              size={24}
              color={isDark ? "white" : "black"}
              style={{ marginRight: 15 }}
            />
          )}
        </HapticTab>
      ),
      headerLeft: () => (
        <HapticTab onPress={() => {
          if (editProfile === true) {
            Alert.alert(
              "Save Changes",
              "Do you want to save changes before exiting?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Save",
                  onPress: () => {
                    handleEditProfile();
                  }
                },
                {
                  text: "Discard",
                  onPress: () => {
                    setEditProfile(false);
                  }
                }
              ],
              { cancelable: true }
            );
          } else {
            Alert.alert(
              "Want to Edit Profile?",
              "Do you want to edit your profile?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Edit",
                  onPress: () => {
                    setEditProfile(true);
                  }
                }
              ],
              { cancelable: true }
            );
          }
        }}>
          {editProfile ? (
            <Feather
              name="check"
              size={24}
              color={isDark ? "white" : "black"}
              style={{ marginLeft: 15 }}
            />
          ) : (
            <Text
              className="text-lg font-semibold"
              style={{ color: isDark ? "white" : "black", marginLeft: 15 }}
            >
              Edit
            </Text>
          )}
        </HapticTab>
      ),
      headerTitleAlign: "center"
    });
  }, [editProfile, colorScheme]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = (await AsyncStorage.getItem("userId")) || "0";
      const userAuthToken = (await AsyncStorage.getItem("authToken")) || "";
      const userName = (await AsyncStorage.getItem("userName")) || "User";
      const userEmail =
        (await AsyncStorage.getItem("userEmail")) || "user@example.com";
      const userPhone =
        (await AsyncStorage.getItem("userPhone")) || "+00 0000 0000";

      setUid(userId);
      setAuthToken(userAuthToken);
      setName(userName);
      setEmail(userEmail);
      setPhone(userPhone);
    };

    fetchData();
  }, []);

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
      <Modal transparent={true} visible={deleteLoading}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
      <View className="mt-8">
        {/* Full Name */}
        <Text
          className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          Full Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          editable={editProfile}
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
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          editable={editProfile}
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
          Phone
        </Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          editable={editProfile}
          style={[
            inputStyle,
            {
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
              color: isDark ? "white" : "black",
              marginTop: 4
            }
          ]}
        />

        {/* Change Password */}
        {!editProfile && (
          <TouchableOpacity
            className={`flex-row items-center justify-start py-[15px] px-5 rounded-xl mt-6 ${
              isDark ? "bg-[#1f2937]" : "bg-[#f3f4f6]"
            }`}
            onPress={() => handleChangePassword()}
          >
            <FontAwesome
              name="lock"
              size={24}
              color={isDark ? "white" : "black"}
              style={{ marginRight: 15 }}
            />
            <Text
              className={`font-semibold text-xl ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Change Password
            </Text>
          </TouchableOpacity>
        )}

        {/* Delete Account */}
        {!editProfile && (
          <TouchableOpacity
            className={`flex-row items-center justify-start py-[15px] px-5 rounded-xl mt-6 ${
              isDark ? "bg-[#1f2937]" : "bg-[#f3f4f6]"
            }`}
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "OK", onPress: () => handleDeleteAccount() }
                ],
                { cancelable: true }
              )
            }
          >
            <MaterialCommunityIcons
              name="delete-forever"
              size={24}
              color={"#d11a2a"}
              style={{ marginRight: 10 }}
            />
            <Text className={`font-semibold text-xl text-red-500`}>
              Delete Account
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
