import React from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
} from "react-native";

export default function ReturnRefundExchangePolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4 pb-20">
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            3-Day Return Policy
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            We offer a 3-day return policy from the date of delivery. Items must be in original condition with all tags attached.
          </Text>

          {/* Returns Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Returns
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            We have a 3-day return policy, which means you have 3 days after receiving your item to request a return.
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            To start a return, you can contact us at{" "}
            <Text className="text-blue-500 font-medium">support@printbot.cloud</Text>.
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Items sent back to us without first requesting a return will not be accepted.
          </Text>

          {/* Damages and Issues Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Damages and Issues
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
          </Text>

          {/* Exceptions / Non-Returnable Items Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Exceptions / Non-Returnable Items
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Unfortunately, we cannot accept returns on sale items or gift cards.
          </Text>

          {/* Exchanges Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Exchanges
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            <Text className="font-semibold">Note:</Text> For hygiene reasons, we can only exchange items that are unopened and in their original packaging.
          </Text>

          {/* European Union 14 Day Cooling Off Period Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            European Union 14 Day Cooling Off Period
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification. As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
          </Text>

          {/* Refunds Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Refunds
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            We will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            If more than 5 business days have passed since we've approved your return, please contact us at{" "}
            <Text className="text-blue-500 font-medium">support@printbot.cloud</Text>.
          </Text>

          {/* Need Help Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Need Help?
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            If you have any questions about our return, refund, or exchange policy, please don't hesitate to contact our customer service team.
          </Text>

          {/* Contact Support Section */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Contact Support
          </Text>
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            For any inquiries or support needs, please reach out to us at{" "}
            <Text className="text-blue-500 font-medium">support@printbot.cloud</Text>
            {" "}or call us at{" "}
            <Text className="text-blue-500 font-medium">+91 9999273367</Text>.
          </Text>
          
        </View>
      </ScrollView>
    </View>
  );
}
