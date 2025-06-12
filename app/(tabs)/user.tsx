import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { ArrowLeft, ChevronRight, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Cart() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
 useEffect(() => {
    const fetchData = async () => {
      const userName = await AsyncStorage.getItem('userName') || 'User';
      const userEmail = await AsyncStorage.getItem('userEmail') || 'user@example.com';
      const userPhone = await AsyncStorage.getItem('userPhone') || '+00 0000 0000';

      setName(userName);
      setEmail(userEmail);
      setPhone(userPhone);
    };

    fetchData();
  }, []);

  return (
    <View className={`flex-1 px-6 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <View className="mt-8">
        {/* Username */}
        <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Username</Text>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-5 rounded-xl mt-1`}>
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>{name}</Text>
        </View>

        {/* Email */}
        <Text className={`text-lg mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</Text>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-5 rounded-xl mt-1`}>
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>
            {email}
          </Text>
        </View>

        {/* Phone */}
        <Text className={`text-lg mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Phone</Text>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-5 rounded-xl mt-1`}>
          <Text className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-black'}`}>{phone}</Text>
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
