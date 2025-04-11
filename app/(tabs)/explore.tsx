import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  useColorScheme,
} from "react-native";
import {
  ArrowLeft,
  ShoppingCart,
  Trash,
  ClipboardList,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define Order Type
interface Order {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  pages?: number;
  price: number;
  otp: number;
}

export default function OrdersScreen() {
  const { orders } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<Order[]>([]);
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "bg-black" : "bg-white";
  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark ? "bg-gray-800" : "bg-gray-100";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";
  const subText = isDark ? "text-gray-400" : "text-gray-600";

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const storedOrders = await AsyncStorage.getItem("orders");
        if (storedOrders) {
          setCartItems(JSON.parse(storedOrders) as Order[]);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (orders) {
      try {
        const parsedOrders = typeof orders === "string" ? JSON.parse(orders) : orders;

        if (Array.isArray(parsedOrders)) {
          const updatedOrders: Order[] = [...cartItems, ...parsedOrders];
          setCartItems(updatedOrders);
          AsyncStorage.setItem("orders", JSON.stringify(updatedOrders));
        } else {
          console.error("Parsed orders is not an array:", parsedOrders);
        }
      } catch (error) {
        console.error("Failed to save orders:", error);
      }
    }
  }, [orders]);


  return (
    <View className={`flex-1 ${bgColor} p-4 pt-1 pb-24`}>
      {/* Back Button & Title */}
      {/* <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.push("/(tabs)")} className="mr-2">
          <ArrowLeft color={isDark ? "white" : "black"} size={28} />
        </TouchableOpacity>
        <Text className={`${textColor} text-3xl font-semibold`}>Orders</Text>
      </View> */}

      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ShoppingCart color={isDark ? "gray" : "darkgray"} size={80} />
          <Text className={`${subText} text-2xl mt-4`}>No Orders</Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              className={`${cardBg} p-5 w-[350px] rounded-lg mb-4 mx-2 border ${borderColor} shadow-md`}
            >
              <View className="flex-row justify-between items-center">
                <Text className={`${textColor} max-w-[300px] text-lg font-bold`}>
                  {item.fileName.length > 20
                    ? `${item.fileName.substring(0, 17)}...${item.fileType}`
                    : item.fileName}
                </Text>
                <Text className="text-[#38b6ff] font-semibold text-lg">₹{item.price}</Text>
              </View>

              {item.fileType === "application/pdf" && (
                <Text className={`${subText} text-sm mt-1`}>Pages: {item.pages}</Text>
              )}

              <View
                className={`mt-3 flex-row items-center justify-between px-4 py-3 rounded-lg border ${borderColor} ${
                  isDark ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <Text className={`${textColor} text-lg font-semibold`}>OTP: {item.otp}</Text>
                <TouchableOpacity
                  className="bg-[#38b6ff] px-4 py-2 rounded-full"
                  onPress={() =>
                    Alert.alert("Copied", `OTP ${item.otp} copied!`)
                  }
                >
                  <Text className="text-white font-bold">Copy</Text>
                </TouchableOpacity>
              </View>

              
            </View>
          )}
        />
      )}
    </View>
  );
}
