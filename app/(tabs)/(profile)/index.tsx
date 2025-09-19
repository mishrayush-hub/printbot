import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Edit3, Save, Scroll, User, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";

export default function OrdersScreen() {
    const [editingProfile, setEditingProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [country, setCountry] = useState("");
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress1, setNewAddress1] = useState("");
    const [newAddress2, setNewAddress2] = useState("");
    const [newCity, setNewCity] = useState("");
    const [newState, setNewState] = useState("");
    const [newPincode, setNewPincode] = useState("");
    const [newCountry, setNewCountry] = useState("");

    const router = useRouter();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    
    const textColor = isDark ? "text-white" : "text-black";
    const cardBg = isDark ? "bg-gray-800" : "bg-white";
    const borderColor = isDark ? "border-gray-700" : "border-gray-200";
    const subText = isDark ? "text-gray-400" : "text-gray-600";

    useEffect(() => {
        loadUserData();
      }, []);

    const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const id = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      const userEmail = await AsyncStorage.getItem("userEmail");
      const userPhone = await AsyncStorage.getItem("userPhone");
      const userAddress1 = await AsyncStorage.getItem("userAddress1") || "";
      const userAddress2 = await AsyncStorage.getItem("userAddress2") || "";
      const userCity = await AsyncStorage.getItem("userCity") || "";
      const userState = await AsyncStorage.getItem("userState") || "";
      const userPincode = await AsyncStorage.getItem("userPincode") || "";
      const userCountry = await AsyncStorage.getItem("userCountry") || "";

      if (token && id && userName && userEmail && userPhone) {
        setAuthToken(token);
        setUserId(id);
        setName(userName);
        setEmail(userEmail);
        setPhone(userPhone);
        setAddress1(userAddress1);
        setAddress2(userAddress2);
        setCity(userCity);
        setState(userState);
        setPincode(userPincode);
        setCountry(userCountry);
        
        setNewName(userName);
        setNewEmail(userEmail);
        setNewPhone(userPhone);
        setNewAddress1(userAddress1);
        setNewAddress2(userAddress2);
        setNewCity(userCity);
        setNewState(userState);
        setNewPincode(userPincode);
        setNewCountry(userCountry);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      Alert.alert("Error", "Name, email, and phone are required");
      return;
    }

    setLoading(true);
    try {
      const sendData: { [key: string]: string } = {
        authToken,
        user_id: userId
      };

      if (newName !== name) sendData.user_name = newName;
      if (newEmail !== email) sendData.user_email = newEmail;
      if (newPhone !== phone) sendData.user_phone = newPhone;
      if (newAddress1 !== address1) sendData.address1 = newAddress1;
      if (newAddress2 !== address2) sendData.address2 = newAddress2;
      if (newCity !== city) sendData.city = newCity;
      if (newState !== state) sendData.state = newState;
      if (newPincode !== pincode) sendData.pincode = newPincode;
      if (newCountry !== country) sendData.country = newCountry;

      if (Object.keys(sendData).length === 2) {
        setEditingProfile(false);
        return;
      }

      const response = await fetch(
        "https://printbot.cloud/api/v1/update_profile_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(sendData).toString()
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update local storage and state
        await AsyncStorage.setItem("userName", newName);
        await AsyncStorage.setItem("userEmail", newEmail);
        await AsyncStorage.setItem("userPhone", newPhone);
        await AsyncStorage.setItem("userAddress1", newAddress1);
        await AsyncStorage.setItem("userAddress2", newAddress2);
        await AsyncStorage.setItem("userCity", newCity);
        await AsyncStorage.setItem("userState", newState);
        await AsyncStorage.setItem("userPincode", newPincode);
        await AsyncStorage.setItem("userCountry", newCountry);

        setName(newName);
        setEmail(newEmail);
        setPhone(newPhone);
        setAddress1(newAddress1);
        setAddress2(newAddress2);
        setCity(newCity);
        setState(newState);
        setPincode(newPincode);
        setCountry(newCountry);
        setEditingProfile(false);

        Alert.alert("Success", "Profile updated successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-3`}>
      <View className={`${cardBg} rounded-lg p-4 border ${borderColor} shadow-sm h-[89%]`}>
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="bg-blue-100 p-3 rounded-full mr-4">
              <User color="#3B82F6" size={24} />
            </View>
            <View>
              <Text className={`${textColor} text-xl font-bold`}>{name}</Text>
              <Text className={`${subText} text-sm`}>Profile Information</Text>
            </View>
          </View>
          {!editingProfile ? (
            <TouchableOpacity
              onPress={() => setEditingProfile(true)}
              className="flex-row items-center rounded-lg min-h-[35px] bg-[#008cff] px-4 py-2"
            >
              <Edit3 color="white" size={16} />
              <Text className="text-white font-medium ml-2">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row" style={{ gap: 2 }}>
              <TouchableOpacity
                onPress={() => {
                  setEditingProfile(false);
                  setNewName(name);
                  setNewEmail(email);
                  setNewPhone(phone);
                  setNewAddress1(address1);
                  setNewAddress2(address2);
                  setNewCity(city);
                  setNewState(state);
                  setNewPincode(pincode);
                  setNewCountry(country);
                }}
                className="flex-row items-center bg-gray-500 px-3 py-2 rounded-lg"
              >
                <X color="white" size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={loading}
                className="flex-row items-center bg-green-500 px-4 py-2 rounded-lg"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Save color="white" size={16} />
                )}
                <Text className="text-white font-medium ml-2">Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Details - Scrollable Section */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>Full Name</Text>
            {editingProfile ? (
              <TextInput
                value={newName}
                onChangeText={setNewName}
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{name}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>Email Address</Text>
            {editingProfile ? (
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your email address"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{email}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>Phone Number</Text>
            {editingProfile ? (
              <TextInput
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your phone number"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{phone}</Text>
              </View>
            )}
          </View>

          {/* Address Section */}
          <View>
            {/* <Text className={`${textColor} text-lg font-semibold mb-3`}>Address Information</Text> */}
            
            <View>
              <Text className={`${subText} text-sm font-medium mb-2`}>Address Line 1</Text>
              {editingProfile ? (
                <TextInput
                  value={newAddress1}
                  onChangeText={setNewAddress1}
                  className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                  placeholder="Enter address line 1"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                />
              ) : (
                <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                  <Text className={`${textColor} text-base`}>{address1 || "Not provided"}</Text>
                </View>
              )}
            </View>
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>Address Line 2</Text>
            {editingProfile ? (
              <TextInput
                value={newAddress2}
                onChangeText={setNewAddress2}
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter address line 2 (optional)"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{address2 || "Not provided"}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>City</Text>
            {editingProfile ? (
              <TextInput
                value={newCity}
                onChangeText={setNewCity}
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your city"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{city || "Not provided"}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>State</Text>
            {editingProfile ? (
              <TextInput
                value={newState}
                onChangeText={setNewState}
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your state"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{state || "Not provided"}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>Pincode</Text>
            {editingProfile ? (
              <TextInput
                value={newPincode}
                onChangeText={setNewPincode}
                keyboardType="numeric"
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your pincode"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{pincode || "Not provided"}</Text>
              </View>
            )}
          </View>

          <View>
            <Text className={`${subText} text-sm font-medium mb-2`}>Country</Text>
            {editingProfile ? (
              <TextInput
                value={newCountry}
                onChangeText={setNewCountry}
                className={`${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-black'} p-4 rounded-lg border ${borderColor} text-base`}
                placeholder="Enter your country"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              />
            ) : (
              <View className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                <Text className={`${textColor} text-base`}>{country || "Not provided"}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Logout Button */}
      {/* <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 rounded-lg p-4 mt-4"
      >
        <Text className="text-white font-bold text-center text-xl">Logout</Text>
      </TouchableOpacity> */}
    </View>
  );
}