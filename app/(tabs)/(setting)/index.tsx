import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Calendar,
  CreditCard,
  FileText,
  RefreshCw,
  Scale,
  Shield,
  Trash2,
  Truck,
  User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Image
} from "react-native";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // User data
  const [userId, setUserId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [email, setEmail] = useState("");

  // Payment history
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Function to calculate tiered pricing
  const calculatePrice = (pageCount: number) => {
    if (pageCount < 10) {
      return pageCount * 4; 
    } else if (pageCount >= 10 && pageCount <= 50) {
      return pageCount * 3; 
    } else {
      return pageCount * 2; 
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
        setEmail(userEmail);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "payments") {
      loadPaymentHistory();
    }
  }, [activeTab]);

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
              onPress: () => router.push("/(tabs)/(setting)/change_password")
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

  const renderTabButton = (id: string, label: string) => (
    <TouchableOpacity
      key={id}
      onPress={() => setActiveTab(id)}
      style={{ flex: 1 }}
      className={`py-2 rounded-lg min-h-[35px] items-center justify-center ${activeTab === id ? "bg-[#008cff]" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
    >
      <Text className={`font-semibold text-[14px] px-1 ${activeTab === id ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</Text>
    </TouchableOpacity>
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

                <View className="flex-row items-center justify-between mt-2">
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
                  <View className="flex-row items-center px-2 bg-blue-100 rounded-md">
                    <Image
                      source={require("../../../assets/images/orgIcons/razorpay.png")}
                      style={{ width: 70, height: 25 }}
                    />
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
            <View className="bg-[#008cff] px-3 py-2 rounded-md">
              <Text className="text-white font-medium text-sm">Change</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(setting)/delete_account")}
          className="flex-row items-center justify-between p-4 border border-red-300 rounded-lg"
        >
          <View className="flex-row items-center">
            <Trash2 color="#EF4444" size={24} />
            <View className="ml-3">
              <Text className="text-red-600 font-semibold">Delete Account</Text>
              <Text className={`${subText} text-sm`}>Permanently delete your account</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-center bg-red-500 rounded-md py-[6px] px-4">
            <Text className="text-sm font-medium text-white">Delete</Text>
          </View>
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
            onPress={() => router.push("/(legal)/return-refund-exchange-policy")}
            className={`flex-row items-center justify-between p-4 mb-4 border ${borderColor} rounded-lg`}
          >
            <View className="flex-row items-center">
              <RefreshCw color={isDark ? "#9CA3AF" : "#6B7280"} size={24} />
              <View className="ml-3">
                <Text className={`${textColor} font-semibold`}>Returns, Refunds & Exchanges</Text>
                <Text className={`${subText} text-sm`}>Learn about returns and refunds</Text>
              </View>
            </View>
            <Text className="text-blue-500 font-medium">View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(legal)/shipping-policy")}
            className={`flex-row items-center justify-between p-4 border ${borderColor} rounded-lg`}
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
        </View>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Tab Navigation */}
      <View className={`${cardBg} p-4 border-b ${borderColor}`}>
        <View className="flex-row max-w-[100%]" style={{ gap: 6 }}>
            {renderTabButton(
              "security",
              "Security",
            )}
            {renderTabButton(
              "payments",
              "Payments",
            )}
            {renderTabButton(
              "legal",
              "Legal",
            )}
          </View>
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
              if (activeTab === "payments") {
                loadPaymentHistory();
              }
              setRefreshing(false);
            }}
          />
        }
      >
        {activeTab === "security" && renderSecurityTab()}
        {activeTab === "payments" && renderPaymentsTab()}
        {activeTab === "legal" && renderLegalTab()}
      </ScrollView>
    </View>
  );
}
