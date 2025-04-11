import React, { useEffect, useState, useRef } from "react";
import { View, Text, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import Logo from "@/components/logo";

const MyScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Splash timeout
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      router.replace("/(auth)/login");
    }
  }, [loading]);


  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? "bg-black" : "bg-[#38b6ff]"}`}>
        <Logo width={150} height={150} color={isDark ? "#fff" : "#000"} />
        <Text className={`font-bold text-4xl mt-4 ${isDark ? "text-white" : "text-black"}`}>
          Printbot
        </Text>
      </View>
    );
  }

  return null;
};

export default MyScreen;
