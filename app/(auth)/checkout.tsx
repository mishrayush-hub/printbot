import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, useColorScheme } from "react-native";
import { ArrowLeft, CreditCard, Banknote, CheckCircle, Logs } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

interface OrderItem {
  id: string;
  fileName: string;
  price: number;
}

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { files, totalPrice } = useLocalSearchParams();
  const orderDetails: OrderItem[] = typeof files === "string" ? JSON.parse(files) : [];
  const totalAmount = orderDetails.reduce((sum: number, item: OrderItem) => sum + item.price, 0) || totalPrice;

  // Payment Method State
  const [selectedPayment, setSelectedPayment] = useState("Card");

  // Dynamic Theme Support
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  const bgColor = isDarkMode ? "bg-black" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const cardColor = isDarkMode ? "bg-gray-800" : "bg-gray-100";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-300";

  return (
    <View className={`flex-1 ${bgColor} p-6 pt-16`}>
      {/* Back Button & Title */}
      <View className="flex-row items-center gap-2 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2">
          <ArrowLeft color={isDarkMode ? "white" : "black"} size={28} />
        </TouchableOpacity>
        <Text className={`${textColor} text-3xl font-semibold`}>Checkout</Text>
      </View>

      {/* Scrollable Order Details */}
      <ScrollView className="flex-1">
        {orderDetails.map((item: OrderItem) => (
          <View key={item.id} className={`flex-row items-center ${cardColor} p-4 rounded-lg mb-4 border ${borderColor}`}>            
            <Logs color={isDarkMode ? "white" : "black"} />
            <View className="flex-1 ml-3">
              <Text className={`${textColor} text-lg font-semibold`}>{item.fileName}</Text>
              <Text className="text-gray-500">₹{item.price}</Text>
            </View>
          </View>
        ))}

        {/* Payment Method Selection */}
        <Text className={`${textColor} text-lg font-semibold mt-6 mb-2`}>Select Payment Method</Text>

        {["Card", "Cash"].map((method) => (
          <TouchableOpacity 
            key={method}
            className={`flex-row items-center p-4 rounded-lg p-2 m-2 ${selectedPayment === method ? "bg-gray-300" : cardColor} mb-2 border ${borderColor}`}
            onPress={() => setSelectedPayment(method)}
          >
            {method === "Card" ? <CreditCard color={isDarkMode ? "white" : "black"} size={24} /> : <Banknote color={isDarkMode ? "white" : "black"} size={24} />}
            <Text className={`${textColor} text-lg ml-4 mr-3`}>{method === "Card" ? "Credit/Debit Card" : "Cash on Delivery"}</Text>
            {selectedPayment === method && <CheckCircle color="green" size={24} className="ml-auto" />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fixed Checkout Summary */}
      <View className={`absolute bottom-4 left-4 right-4 ${cardColor} p-4 rounded-lg shadow-lg border ${borderColor}`}>
        <Text className={`${textColor} text-lg font-semibold`}>Total: ₹{totalAmount}</Text>
        <TouchableOpacity className="mt-2 bg-[#38b6ff] px-4 py-3 rounded-full">
          <Text className="text-black text-xl font-bold text-center">Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
