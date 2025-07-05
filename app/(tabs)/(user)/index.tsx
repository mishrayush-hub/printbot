import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  useColorScheme,
  RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  CreditCard,
  Shield,
  Trash2,
  Edit3,
  Save,
  X,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Scale,
  Truck,
  RefreshCw
} from "lucide-react-native";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // User data
  const [userId, setUserId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Edit fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  
  // Payment history
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Function to calculate tiered pricing
  const calculatePrice = (pageCount: number) => {
    if (pageCount < 10) {
      return pageCount * 4; // ₹4 per page for less than 10 pages
    } else if (pageCount >= 10 && pageCount <= 50) {
      return pageCount * 3; // ₹3 per page for 10-50 pages
    } else {
      return pageCount * 2; // ₹2 per page for 50+ pages
    }
  };

  // Function to get price per page based on tier
  const getPricePerPage = (pageCount: number) => {
    if (pageCount < 10) {
      return 4;
    } else if (pageCount >= 10 && pageCount <= 50) {
      return 3;
    } else {
      return 2;
    }
  };

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (activeTab === "payments") {
      loadPaymentHistory();
    }
  }, [activeTab]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const id = await AsyncStorage.getItem("userId");
      const userName = await AsyncStorage.getItem("userName");
      const userEmail = await AsyncStorage.getItem("userEmail");
      const userPhone = await AsyncStorage.getItem("userPhone");

      if (token && id && userName && userEmail && userPhone) {
        setAuthToken(token);
        setUserId(id);
        setName(userName);
        setEmail(userEmail);
        setPhone(userPhone);
        setNewName(userName);
        setNewEmail(userEmail);
        setNewPhone(userPhone);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadPaymentHistory = async () => {
    if (!authToken || !userId) return;
    
    setPaymentLoading(true);
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
      if (data.success && data.files) {
        const paidFiles = data.files.filter((file: any) => file.payment_success);
        setPaymentHistory(paidFiles);
      }
    } catch (error) {
      console.error("Error loading payment history:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      Alert.alert("Error", "All fields are required");
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

      if (Object.keys(sendData).length === 2) {
        setEditingProfile(false);
        return;
      }

      const response = await fetch(
        "https://printbot.cloud/api/v1/edit_profile_api.php",
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
        
        setName(newName);
        setEmail(newEmail);
        setPhone(newPhone);
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

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://printbot.cloud/api/v1/request_change_password_api.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            authToken,
            user_id: userId,
            email
          }).toString()
        }
      );
      
      const data = await response.json();
      if (data.success) {
        Alert.alert(
          "Success",
          "Password change request sent successfully. Please check your email for the password change token.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(tabs)/(user)/change_password")
            }
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to request password change");
      }
    } catch (error) {
      console.error("Error requesting password change:", error);
      Alert.alert("Error", "Failed to request password change");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                "authToken",
                "userId",
                "userName",
                "userEmail",
                "userPhone"
              ]);
              router.replace("/(auth)/login");
            } catch (error) {
              console.error("Error during logout:", error);
            }
          }
        }
      ]
    );
  };

  const renderTabButton = (id: string, label: string, icon: any) => (
    <TouchableOpacity
      key={id}
      onPress={() => setActiveTab(id)}
      className={`flex-row items-center justify-center py-3 px-4 rounded-lg min-w-[100px] ${
        activeTab === id ? "bg-blue-500" : isDark ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      {icon}
      <Text
        className={`ml-2 font-medium ${
          activeTab === id ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View className="py-4 px-2">
      <View className={`${cardBg} rounded-lg p-6 border ${borderColor} shadow-sm`}>
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
              className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Edit3 color="white" size={16} />
              <Text className="text-white font-medium ml-2">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setEditingProfile(false);
                  setNewName(name);
                  setNewEmail(email);
                  setNewPhone(phone);
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

        <View style={{ gap: 16 }}>
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
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 rounded-lg p-4 mt-4"
      >
        <Text className="text-white font-semibold text-center text-base">Logout</Text>
      </TouchableOpacity>
    </View>
  );  
  const renderPaymentsTab = () => (
    <View className="py-4">
      <View className={`rounded-lg pb-6 px-2`}>
        {/* <Text className={`${textColor} text-xl font-bold mb-6`}>Payment History</Text> */}
        
        {paymentLoading ? (
          <View className="justify-center items-center py-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className={`${subText} mt-2`}>Loading payments...</Text>
          </View>
        ) : paymentHistory.length === 0 ? (
          <View className="justify-center items-center py-10">
            <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-6 rounded-full mb-4`}>
              <CreditCard color={isDark ? "#9CA3AF" : "#6B7280"} size={48} />
            </View>
            <Text className={`${textColor} text-lg font-semibold mb-2`}>No Payments Yet</Text>
            <Text className={`${subText} text-center`}>Your payment history will appear here</Text>
          </View>
        ) : (
          <View className="space-y-2 gap-1">
            {paymentHistory.map((payment, index) => (
              <View
                key={index}
                className={`${cardBg} border ${borderColor} rounded-lg p-4 mb-2`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="flex-1">
                      <Text className={`${textColor} font-semibold`} numberOfLines={1}>
                        {payment.payment_id}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-green-600 font-bold text-lg">
                    ₹{calculatePrice(payment.page_count)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-start mt-2">
                  <View className="flex-row items-center">
                    <Calendar color={isDark ? "#9CA3AF" : "#6B7280"} size={16} />
                    <Text className={`${subText} text-sm ml-2`}>
                      {new Date(payment.uploaded_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderSecurityTab = () => (
    <View className={`${cardBg} rounded-lg py-6 px-4 my-4 mx-2 rounded-lg p-6 border ${borderColor} shadow-sm`}>
      {/* <Text className={`${textColor} text-xl font-bold mb-6`}>Security Settings</Text> */}
      
      <View className="space-y-4">
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={loading}
          className="flex-row items-center justify-between p-4 mb-4 border border-gray-300 rounded-lg"
        >
          <View className="flex-row items-center">
            <Shield color={isDark ? "#9CA3AF" : "#6B7280"} size={24} />
            <View className="ml-3">
              <Text className={`${textColor} font-semibold`}>Change Password</Text>
              <Text className={`${subText} text-sm`}>Update your account password</Text>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Text className="text-blue-500 font-medium">Change</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(user)/delete_account")}
          className="flex-row items-center justify-between p-4 border border-red-300 rounded-lg"
        >
          <View className="flex-row items-center">
            <Trash2 color="#EF4444" size={24} />
            <View className="ml-3">
              <Text className="text-red-600 font-semibold">Delete Account</Text>
              <Text className={`${subText} text-sm`}>Permanently delete your account</Text>
            </View>
          </View>
          <Text className="text-red-500 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLegalTab = () => (
    <View className="py-4 px-2">
      <View className={`${cardBg} rounded-lg pt-6 pb-6 px-4 border ${borderColor} shadow-sm`}>
        {/* <Text className={`${textColor} text-xl font-bold mb-6`}>Legal Information</Text> */}
        
        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => router.push("/(legal)/terms-and-conditions")}
            className={`flex-row items-center justify-between p-4 mb-4 border ${borderColor} rounded-lg`}
          >
            <View className="flex-row items-center">
              <Scale color={isDark ? "#9CA3AF" : "#6B7280"} size={24} />
              <View className="ml-3">
                <Text className={`${textColor} font-semibold`}>Terms and Conditions</Text>
                <Text className={`${subText} text-sm`}>Read our terms of service</Text>
              </View>
            </View>
            <Text className="text-blue-500 font-medium">View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(legal)/privacy-policy")}
            className={`flex-row items-center justify-between p-4 mb-4 border ${borderColor} rounded-lg`}
          >
            <View className="flex-row items-center">
              <FileText color={isDark ? "#9CA3AF" : "#6B7280"} size={24} />
              <View className="ml-3">
                <Text className={`${textColor} font-semibold`}>Privacy Policy</Text>
                <Text className={`${subText} text-sm`}>Learn how we protect your data</Text>
              </View>
            </View>
            <Text className="text-blue-500 font-medium">View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(legal)/shipping-policy")}
            className={`flex-row items-center justify-between p-4 mb-4 border ${borderColor} rounded-lg`}
          >
            <View className="flex-row items-center">
              <Truck color={isDark ? "#9CA3AF" : "#6B7280"} size={24} />
              <View className="ml-3">
                <Text className={`${textColor} font-semibold`}>Shipping Policy</Text>
                <Text className={`${subText} text-sm`}>View our shipping information</Text>
              </View>
            </View>
            <Text className="text-blue-500 font-medium">View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(legal)/return-refund-exchange-policy")}
            className={`flex-row items-center justify-between p-4 border ${borderColor} rounded-lg`}
          >
            <View className="flex-row items-center">
              <RefreshCw color={isDark ? "#9CA3AF" : "#6B7280"} size={24} />
              <View className="ml-3">
                <Text className={`${textColor} font-semibold`}>Return, Refund & Exchange Policy</Text>
                <Text className={`${subText} text-sm`}>Learn about returns and refunds</Text>
              </View>
            </View>
            <Text className="text-blue-500 font-medium">View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Tab Navigation */}
      <View className={`${cardBg} p-4 border-b ${borderColor}`}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          <View className="flex-row" style={{ gap: 8 }}>
            {renderTabButton(
              "profile",
              "Profile",
              <User color={activeTab === "profile" ? "white" : (isDark ? "#9CA3AF" : "#6B7280")} size={18} />
            )}
            {renderTabButton(
              "payments",
              "Payments",
              <CreditCard color={activeTab === "payments" ? "white" : (isDark ? "#9CA3AF" : "#6B7280")} size={18} />
            )}
            {renderTabButton(
              "security",
              "Security",
              <Shield color={activeTab === "security" ? "white" : (isDark ? "#9CA3AF" : "#6B7280")} size={18} />
            )}
            {renderTabButton(
              "legal",
              "Legal",
              <Scale color={activeTab === "legal" ? "white" : (isDark ? "#9CA3AF" : "#6B7280")} size={18} />
            )}
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        className="flex-1 px-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadUserData();
              if (activeTab === "payments") {
                loadPaymentHistory();
              }
              setRefreshing(false);
            }}
          />
        }
      >
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "payments" && renderPaymentsTab()}
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "legal" && renderLegalTab()}
      </ScrollView>
    </View>
  );
}
