import React from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
} from "react-native";

export default function ShippingPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1a1a1a]" : "bg-white"}`}>
      {/* Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4 pb-20">
          
          {/* Shipping Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Shipping
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Orders placed Monday-Friday before 12pm IST (Excluding national and postal holidays) will be processed and shipped within 48 hours. Orders placed on the weekend will be processed within 48 hours of the next business day. Orders placed during peak times around holidays may require an additional 24-48 hours to be processed and shipped.
          </Text>

          {/* Contact Us Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Contact Us
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            If you have any questions about our shipping policy, please contact our customer service team at{" "}
            <Text className="text-blue-500 font-medium">support@printbot.cloud</Text>
            {" "}or call us at{" "}
            <Text className="text-blue-500 font-medium">+91 9999273367</Text>.
          </Text>
          
        </View>
      </ScrollView>
    </View>
  );
}
