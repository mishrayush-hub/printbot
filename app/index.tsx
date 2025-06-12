import React, { useEffect, useState, useRef } from "react";
import { View, Image, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

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
