import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  useColorScheme,
  TextInput,
  ScrollView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ShoppingCart, Search, RefreshCw, Filter, FileText, Calendar, DollarSign } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePaymentAPI } from "@/hooks/usePayementAPI";
import PaymentProcessingModal from "@/components/PaymentProcessingModal";
import { generateTransactionId } from "@/hooks/generateTransactionId";

export default function OrdersScreen() {
  const [files, setFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteringComplete, setFilteringComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<{ [key: string]: boolean }>({});

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const subText = isDark ? "text-gray-400" : "text-gray-600";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";

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

  useEffect(() => {
    const getTokenDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");
        const email = await AsyncStorage.getItem("userEmail");
        const phone = await AsyncStorage.getItem("userPhone");

        if (token && id && name && email && phone) {
          setAuthToken(token);
          setUserId(id);
          setUserName(name);
          setUserEmail(email);
          setUserPhone(phone);
          setAuthLoaded(true);
          setFilteringComplete(false); // Initialize filtering state
          // // console.log("User info loaded:", { token, id });
        } else {
          // console.log("User details missing from storage.");
          setAuthLoaded(true); // Still set to true even if no auth data
          setFilteringComplete(true); // No data to filter
        }
      } catch (error) {
        console.error("Error fetching token details:", error);
      }
    };

    getTokenDetails();
  }, []);

  const loadOrders = useCallback(async () => {
    if (!authToken || !userId) return;

    try {
      setLoading(true);
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

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Failed to load orders.");
        setFiles([]);
      } else {
        setErrorMessage("");
        setFiles(data.files || []);
        setFilteringComplete(false); // Reset filtering state when new data loads
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setErrorMessage("An unexpected error occurred.");
      setFiles([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [authToken, userId]);

  useEffect(() => {
    if (authToken && userId) {
      loadOrders();
    }
  }, [authToken, userId, loadOrders]);

  // Filter files based on search and status
  useEffect(() => {
    setFilteringComplete(false);

    let filtered = files;

    if (searchQuery) {
      filtered = filtered.filter((file: any) =>
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((file: any) => {
        if (statusFilter === "Paid") return file.payment_success;
        if (statusFilter === "Pending") return !file.payment_success;
        if (statusFilter === "Processing") return !file.payment_success && file.magic_code !== "N/A";
        return true;
      });
    }

    setFilteredFiles(filtered);
    setFilteringComplete(true);
  }, [files, searchQuery, statusFilter]);

  const { initiatePayment, modalState, setModalVisible } = usePaymentAPI();

  // Payment handler function
  const handlePayment = async (file: any) => {
    try {
      setPaymentLoading(prev => ({ ...prev, [file.id]: true }));
      const txnId = generateTransactionId();
      const amount = calculatePrice(file.page_count);

      const result = await initiatePayment(
        txnId,
        amount,
        userId,
        file.id.toString(),
        userName,
        userEmail,
        userPhone
      );

      if (result.success) {
        // Refresh the file list to get updated payment status
        await loadOrders();
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      Alert.alert("Payment Error", error?.message || "Error processing payment. Please try again.");
    } finally {
      setPaymentLoading(prev => ({ ...prev, [file.id]: false }));
    }
  };

  const getStatusBadge = (file: any) => {
    if (file.payment_success) {
      return (
        <View className={`${isDark ? 'bg-green-900' : 'bg-green-100'} px-3 py-1 rounded-full`}>
          <Text className={`${isDark ? 'text-green-300' : 'text-green-800'} font-semibold text-xs`}>Paid</Text>
        </View>
      );
    } else if (file.magic_code !== "N/A") {
      return (
        <View className={`${isDark ? 'bg-yellow-900' : 'bg-yellow-100'} px-3 py-1 rounded-full`}>
          <Text className={`${isDark ? 'text-yellow-300' : 'text-yellow-800'} font-semibold text-xs`}>Processing</Text>
        </View>
      );
    } else {
      return (
        <View className={`${isDark ? 'bg-red-900' : 'bg-red-100'} px-3 py-1 rounded-full`}>
          <Text className={`${isDark ? 'text-red-300' : 'text-red-800'} font-semibold text-xs`}>Pending</Text>
        </View>
      );
    }
  };

  const renderItem = (item: any) => (
    <View
      className={`${cardBg} p-4 w-full rounded-lg mb-3 border ${borderColor} shadow-sm`}
    >
      {/* Header with file icon and name */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <FileText color="#3B82F6" size={20} />
          </View>
          <View className="flex-1">
            <Text className={`${textColor} text-base font-semibold`} numberOfLines={2}>
              {item.file_name.replace(/\.[^/.]+$/, "")}
            </Text>
            <Text className={`${subText} text-xs mt-1`}>
              PDF Document
            </Text>
          </View>
        </View>
        <View className="flex-1 flex-col items-end justify-end">
          {getStatusBadge(item)}
          {item.payment_success && (
            <Text className={`${subText} text-xs mt-1`}>
              {item.printed === true ? "Printed" : "Not Printed"}
            </Text>
          )}
        </View>
      </View>

      {/* File details */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Calendar color={isDark ? "#9CA3AF" : "#6B7280"} size={16} />
          <Text className={`${subText} text-sm ml-2`}>
            {new Date(item.uploaded_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text className={`${subText} text-sm`}>
            {item.page_count <= 1 ? item.page_count + " page" : item.page_count + " pages"}
          </Text>
        </View>
      </View>

      {/* Price and action */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {/* <DollarSign color="#10B981" size={16} /> */}
          <Text className="text-green-600 font-bold text-lg ml-1">
            ₹{calculatePrice(item.page_count)}
          </Text>
        </View>

        {!item.payment_success && (
          <TouchableOpacity
            className={`rounded-lg ${paymentLoading[item.id] ? 'opacity-70' : 'opacity-100'}`}
            onPress={() => handlePayment(item)}
            disabled={paymentLoading[item.id]}
          >
            <LinearGradient
              colors={paymentLoading[item.id] ? ['#93c5fd', '#c4b5fd'] : ['#2563eb', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {paymentLoading[item.id] ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold text-sm ml-2">Processing...</Text>
                </>
              ) : (
                <Text className="text-white font-semibold text-sm">Pay Now</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {item.payment_success && item.magic_code !== "N/A" && (
          <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-2 rounded-lg`}>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-mono text-sm`}>
              Code: {item.magic_code}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Search and Filter Header */}
      <View className={`${cardBg} px-4 py-4 border-b ${borderColor}`}>
        {/* Search Bar */}
        <View className="flex-row items-center mb-3" style={{ gap: 12 }}>
          <View className={`flex-1 flex-row items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-3`}>
            <Search color={isDark ? "#9CA3AF" : "#6B7280"} size={20} />
            <TextInput
              placeholder="Search files..."
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`flex-1 ml-3 ${textColor} text-base`}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setRefreshing(true);
              loadOrders();
            }}
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <RefreshCw color={isDark ? "#9CA3AF" : "#6B7280"} size={20} />
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View>
          <View className="flex-row" style={{ gap: 6 }}>
            {["All", "Paid", "Processing", "Pending"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                style={{ flex: 1 }}
                className={`py-2 rounded-lg min-h-[35px] items-center ${statusFilter === status
                    ? ""
                    : isDark ? "bg-gray-700" : "bg-gray-200"
                  } justify-center`}
              >
                {statusFilter === status ? (
                  <LinearGradient
                    colors={['#2563eb', '#9333ea']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      // paddingHorizontal: 15,
                      paddingVertical: 0,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  >
                    <Text className="font-medium text-[12px] text-white px-1">
                      {status}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text
                    className={`font-medium text-[12px] px-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {status}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-3">
        {!authLoaded || loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className={`${subText} mt-2`}>Loading files...</Text>
          </View>
        ) : errorMessage || !authLoaded ? (
          <View className="flex-1 justify-center items-center">
            <Text className={`${subText} text-center text-lg`}>
              {errorMessage}
            </Text>
          </View>
        ) : authLoaded && !loading && filteringComplete && filteredFiles.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-8 rounded-full mb-4`}>
              <ShoppingCart color={isDark ? "#9CA3AF" : "#6B7280"} size={64} />
            </View>
            <Text className={`${textColor} text-xl font-semibold mb-2`}>
              {files.length === 0 ? "No Files Uploaded" : "No Results Found"}
            </Text>
            <Text className={`${subText} text-center`}>
              {files.length === 0
                ? "Upload your first document to get started"
                : "Try adjusting your search or filters"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredFiles}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item }) => renderItem(item)}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
            contentContainerStyle={{
              paddingVertical: 16,
              paddingBottom: 100
            }}
          />
        )}

        {/* Payment Processing Modal */}
        <PaymentProcessingModal
          visible={modalState.visible}
          stage={modalState.stage}
          magicCode={modalState.magicCode}
          errorMessage={modalState.errorMessage}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </View>
  );
}
