import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  useColorScheme
} from "react-native";
import { ShoppingCart } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrdersScreen() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";
  const subText = isDark ? "text-gray-400" : "text-gray-600";

  useEffect(() => {
    const getTokenDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");
        const email = await AsyncStorage.getItem("userEmail");
        const phone = await AsyncStorage.getItem("userPhone");

        if (token && id && name && email && phone) {
          setAuthToken(token);
          setUserId(id);
          setUserName(name);
          setUserEmail(email);
          setUserPhone(phone);
          console.log("User info loaded:", { token, id });
        } else {
          console.log("User details missing from storage.");
        }
      } catch (error) {
        console.error("Error fetching token details:", error);
      }
    };

    getTokenDetails();
  }, []);

  const loadOrders = useCallback(async () => {
    if (!authToken || !userId) return;

    try {
      const response = await fetch(
        "https://printbot.cloud/api/v1/get_user_files_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            authToken,
            user_id: userId
          }).toString()
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to load orders.");
        setFiles([]);
      } else {
        setErrorMessage("");
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setErrorMessage("An unexpected error occurred.");
      setFiles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authToken, userId]);

  useEffect(() => {
    if (authToken && userId) {
      loadOrders();
    }
  }, [authToken, userId, loadOrders]);

  const renderItem = (item: any) => (
    <View
      className={`${cardBg} p-5 w-full rounded-lg mb-4 border ${borderColor} shadow-sm`}
    >
      <View className="flex-row justify-between items-center">
        <Text className={`${textColor} max-w-[300px] text-lg font-bold`}>
          {item.file_name.split(".")[0].split("_").join(" ")}
        </Text>
        <Text className="text-[#008cff] font-semibold text-lg">
          ₹{item.page_count * 3}
        </Text>
      </View>
      <Text className={`${subText} text-sm mb-2`}>
        Pages: {item.page_count}
      </Text>
      <Text className={`${textColor} text-sm`}>
        Uploaded Date: {new Date(item.uploaded_date).toLocaleDateString()}
      </Text>
      <Text className={`${textColor} text-sm`}>
        Payment: {item.payment_success ? "Payment Complete" : "Pending"}
      </Text>
      <Text className={`${textColor} text-sm`}>
        Payment ID: {item.payment_id}
      </Text>
      <View className="flex-row items-center justify-between mt-3">
        <Text className={`${textColor} text-sm`}>
          Printed: {item.printed ? "Yes" : "No"}
        </Text>
        {!item.printed &&
          !item.payment_success &&
          item.magic_code !== "N/A" && (
            <>
              <Text className={`${textColor} text-lg font-semibold`}>
                OTP: {item.magic_code}
              </Text>
              <TouchableOpacity
                className="bg-[#008cff] px-4 py-2 rounded-full"
                onPress={() =>
                  Alert.alert("Copied", `OTP ${item.magic_code} copied!`)
                }
              >
                <Text className="text-white font-bold">Pay to Print</Text>
              </TouchableOpacity>
            </>
          )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 px-2 pb-20 w-full">
      {loading ? (
        <View className="flex-1 justify-center items-center mt-20">
          <ActivityIndicator size="large" color="#008cff" />
        </View>
      ) : errorMessage ? (
        <View className="flex-1 justify-center items-center mt-20">
          <Text className={`${subText} text-center text-lg`}>
            {errorMessage}
          </Text>
        </View>
      ) : files.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-20">
          <ShoppingCart color={isDark ? "gray" : "darkgray"} size={80} />
          <Text className={`${subText} text-2xl mt-4`}>No Orders</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => renderItem(item)}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadOrders();
          }}
          contentContainerStyle={{
            paddingBottom: 10,
            paddingHorizontal: 5,
            marginTop: 15
          }}
        />
      )}
    </View>
  );
}
