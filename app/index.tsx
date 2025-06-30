import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");

        if (authToken) {
          // User is logged in, go to main app
          router.replace("/(tabs)");
        } else {
          // User not logged in, go to login
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-500">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return null;
};

export default MyScreen;