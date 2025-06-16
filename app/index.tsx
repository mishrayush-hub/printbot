import React, { useEffect, useState } from "react";
import { View, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");
        const response = await fetch(
          "https://printbot.navstream.in/verify_token_api.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              authToken: authToken || "",
              user_id: userId || ""
            }).toString()
          }
        );
        const data = await response.json();
        if (data.success) {
          // User is authenticated, redirect to the main app
          router.replace("/(tabs)");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth token:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      router.replace("/(auth)/login");
    }
  }, [loading]);


  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center bg-[#008cff]`}>
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return null;
};

export default MyScreen;
