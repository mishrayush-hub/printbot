import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { ArrowLeft, ChevronRight, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

export default function Cart() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-1 px-6 ${isDark ? 'bg-black' : 'bg-white'}`}>
      {/* Back Button */}
      {/* <TouchableOpacity onPress={() => router.push("/(tabs)")}>
        <ArrowLeft color={isDark ? "white" : "black"} size={28} />
      </TouchableOpacity> */}

      {/* Profile Header */}
      <View className="items-center mt-10">
        <User color={isDark ? "white" : "black"} size={80} />
        <Text className={`text-lg font-semibold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>
          Profile
        </Text>
      </View>

      {/* Profile Details */}
      <View className="mt-8">
        {/* Username */}
        <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Username</Text>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-5 rounded-xl mt-1`}>
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>Ashwin</Text>
        </View>

        {/* Email */}
        <Text className={`text-lg mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</Text>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-5 rounded-xl mt-1`}>
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>
            Its.Ashwin.23@Gmail.Com
          </Text>
        </View>

        {/* Phone */}
        <Text className={`text-lg mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</Text>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-5 rounded-xl mt-1`}>
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>+91 8248669086</Text>
        </View>

        {/* Order History */}
        <TouchableOpacity
          className={`flex-row items-center justify-between p-5 rounded-xl mt-6 ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`}
          onPress={() => router.push("/explore")}
        >
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>
            View Order History
          </Text>
          <ChevronRight color={isDark ? 'white' : 'black'} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
