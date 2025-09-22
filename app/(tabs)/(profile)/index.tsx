import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Edit3, Save, User, X } from "lucide-react-native";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { checkForSessionExpiry } from "@/utils/sessionHandler";
import { useKeyboard } from '@react-native-community/hooks';

export default function ProfileScreen() {
  const keyboard = useKeyboard()
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

  // Refs for auto-scroll and focus
  const scrollViewRef = useRef<ScrollView>(null);
  const fullNameRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const emailRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const mobileRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const address1Ref = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const address2Ref = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const cityRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const stateRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const pincodeRef = useRef<TextInput>(null) as React.RefObject<TextInput>;
  const countryRef = useRef<TextInput>(null) as React.RefObject<TextInput>;

  // Auto-scroll function
  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
      setTimeout(() => {
        if (inputRef.current && scrollViewRef.current) {
          inputRef.current.measure((x, y, width, height, pageX, pageY) => {
            scrollViewRef.current?.scrollTo({
              y: pageY - 100, // Offset to show input clearly above keyboard
              animated: true,
            });
          });
        }
      }, 100);
    };

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

      // Check for 401 session expiry
      if (checkForSessionExpiry(response)) {
        return; // Session expired handler will take care of navigation
      }

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
      <View className={`${cardBg} rounded-lg py-4 border ${borderColor} shadow-sm ${Platform.OS === 'ios' ? 'h-[89%]' : 'h-[85%]'}`}>
        <View className="flex-row items-center justify-between mb-6 px-4">
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
              className="flex-row items-center rounded-md min-h-[35px] bg-[#008cff] px-4 py-2"
            >
              <Edit3 color="white" size={16} />
              <Text className="text-white font-medium ml-2">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row" style={{ gap: 6 }}>
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
                className="flex-row items-center bg-gray-500 px-3 py-2 rounded-md"
              >
                <X color="white" size={16} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={loading}
                className="flex-row items-center bg-green-500 px-4 py-2 rounded-md"
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
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{paddingHorizontal: 16, gap: 4, paddingBottom: keyboard.keyboardShown ? keyboard.keyboardHeight / 1.4 : 0 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Full Name</Text>
              <TextInput
                ref={fullNameRef}
                value={editingProfile ? newName : name}
                onChangeText={setNewName}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your full name"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(fullNameRef)}
                onSubmitEditing={() => emailRef.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Email Address</Text>
              <TextInput
                ref={emailRef}
                value={editingProfile ? newEmail : email}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your email address"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(emailRef)}
                onSubmitEditing={() => mobileRef.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Phone Number</Text>
              <TextInput
                ref={mobileRef}
                value={editingProfile ? newPhone : phone}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your phone number"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(mobileRef)}
                onSubmitEditing={() => address1Ref.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            {/* Address Section */}
            <View>
              <View>
                <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Address Line 1</Text>
                <TextInput
                  ref={address1Ref}
                  value={editingProfile ? newAddress1 : address1}
                  editable={editingProfile}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setNewAddress1}
                  className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                  placeholder="Enter address line 1"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  onFocus={() => scrollToInput(address1Ref)}
                  onSubmitEditing={() => address2Ref.current?.focus()}
                  textAlignVertical="center"
                />
              </View>
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Address Line 2</Text>
              <TextInput
                ref={address2Ref}
                value={editingProfile ? newAddress2 : address2}
                onChangeText={setNewAddress2}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter address line 2 (optional)"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(address2Ref)}
                onSubmitEditing={() => cityRef.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>City</Text>
              <TextInput
                ref={cityRef}
                value={editingProfile ? newCity : city}
                onChangeText={setNewCity}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your city"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(cityRef)}
                onSubmitEditing={() => stateRef.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>State</Text>
              <TextInput
                ref={stateRef}
                value={editingProfile ? newState : state}
                onChangeText={setNewState}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your state"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(stateRef)}
                onSubmitEditing={() => pincodeRef.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Pincode</Text>
              <TextInput
                ref={pincodeRef}
                value={editingProfile ? newPincode : pincode}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setNewPincode}
                keyboardType="numeric"
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your pincode"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(pincodeRef)}
                onSubmitEditing={() => countryRef.current?.focus()}
                textAlignVertical="center"
              />
            </View>

            <View>
              <Text className={`${subText} text-md font-medium mb-2 ml-1`}>Country</Text>
              <TextInput
                ref={countryRef}
                value={editingProfile ? newCountry : country}
                editable={editingProfile}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setNewCountry}
                className={`rounded-xl max-w-[400px] h-[51px] px-2 py-2 text-md mb-4 ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}
                placeholder="Enter your country"
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                onFocus={() => scrollToInput(countryRef)}
                textAlignVertical="center"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}