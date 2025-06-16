import React, { useEffect, useState } from "react";
import { View, Image, Alert, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker"; // For file access
import * as ImagePicker from "expo-image-picker"; // For photo library (optional)

const MyScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);

  // Open device settings
  const openSettings = async () => {
    await Linking.openSettings();
    setShowPermissionDenied(false);
    checkPermissionsAndAuth(); // Re-check after returning
  };

  // Show alert if permissions denied
  const showPermissionAlert = () => {
    Alert.alert(
      "Permission Required",
      "This app needs access to your files to upload documents. Please enable it in Settings.",
      [
        { text: "Cancel", onPress: () => setShowPermissionDenied(false) },
        { text: "Open Settings", onPress: openSettings },
      ]
    );
  };

  // Check & request necessary permissions
  const checkPermissionsAndAuth = async () => {
    try {
      let allPermissionsGranted = true;

      // 1. iOS: Check if file access is allowed (no direct permission API, but we can test)
      if (Platform.OS === "ios") {
        const { status } = await ImagePicker.getMediaLibraryPermissionsAsync(); // (Optional: Only if you need photos)
        if (status !== "granted") {
          allPermissionsGranted = false;
        }
      }

      // 2. Android: Storage permissions are handled in `app.json` (no runtime request needed)
      // (Optional: If you want to explicitly check Android storage permissions, use PermissionsAndroid)

      if (!allPermissionsGranted) {
        setShowPermissionDenied(true);
        return;
      }

      // Proceed with auth check if permissions are OK
      await checkAuth();
    } catch (error) {
      console.error("Permission check error:", error);
      setLoading(false);
    }
  };

  // Auth check logic (unchanged)
  const checkAuth = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");
      
      const response = await fetch(
        "https://printbot.navstream.in/verify_token_api.php", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            authToken: authToken || "",
            user_id: userId || "",
          }).toString(),
        }
      );
      
      const data = await response.json();
      if (data.success) {
        router.replace("/(tabs)");
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermissionsAndAuth();
  }, []);

  useEffect(() => {
    if (showPermissionDenied) {
      showPermissionAlert();
    }
  }, [showPermissionDenied]);

  useEffect(() => {
    if (!loading) {
      router.replace("/(auth)/login");
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#008cff" }}>
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