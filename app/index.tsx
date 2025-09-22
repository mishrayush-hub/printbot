import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkForSessionExpiry } from "@/utils/sessionHandler";

const MyScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");

        if (!authToken) {
          router.replace("/(auth)/login");
          return;
        }

        // Verify token with server - API requires both user_id and authToken
        try {
          const userId = await AsyncStorage.getItem("userId");
          if (!userId) {
            // No userId available, force login
            await AsyncStorage.removeItem("authToken");
            router.replace("/(auth)/login");
            return;
          }

          const body = new URLSearchParams({ authToken, user_id: userId }).toString();
          const response = await fetch("https://printbot.cloud/api/v1/verify_token_api.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body
          });

          // Check for 401 session expiry
          if (checkForSessionExpiry(response)) {
            return; // Session expired handler will take care of navigation
          }

          const data = await response.json().catch(() => null);

          if (response.ok && data && data.success) {
            // Token valid - go to main app
            router.replace("/(tabs)/(home)");
          } else {
            // Invalid token - remove and go to login
            await AsyncStorage.removeItem("authToken");
            router.replace("/(auth)/login");
          }
        } catch (err) {
          console.error("Token verification error:", err);
          // On verification failure, be conservative and send to login
          await AsyncStorage.removeItem("authToken");
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