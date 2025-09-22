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
  Platform
} from "react-native";
import { ShoppingCart, Search, RefreshCw, FileText, Calendar } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePaymentAPI } from "@/hooks/usePayementAPI";
import PaymentProcessingModal from "@/components/PaymentProcessingModal";
import { generateTransactionId } from "@/hooks/generateTransactionId";
import { desanitizeFileName } from "@/utils/desanitizeFileName";
import { checkForSessionExpiry } from "@/utils/sessionHandler";
import { useFocusEffect } from "@react-navigation/native";

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
  const [paymentLoading, setPaymentLoading] = useState<{ [key: string]: boolean }>({});

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "#ffffff" : "#000000";
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

      // Check for 401 session expiry
      if (checkForSessionExpiry(response)) {
        return; // Session expired handler will take care of navigation
      }

      const data = await response.json();
      console.log("Fetch files response:", data.files);
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

  // Load orders every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (authToken && userId) {
        loadOrders();
      }
    }, [authToken, userId, loadOrders])
  );

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
        if (statusFilter === "Paid") return file.payment_success && file.magic_code !== "N/A" && !file.printed;
        if (statusFilter === "Pending") return !file.payment_success && file.magic_code === "N/A" && !file.printed ;
        if (statusFilter === "Printed") return file.payment_success && file.magic_code !== "N/A" && file.printed;
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
        <View className={` px-3 py-1 rounded-md`}>
          <Text className={`text-green-400 font-semibold text-base`}>Completed</Text>
        </View>
      );
    } else if (file.magic_code !== "N/A") {
      return (
        <View className={` px-3 py-1 rounded-md`}>
          <Text className={`text-yellow-400 font-semibold text-base`}>Processing</Text>
        </View>
      );
    } else {
      return (
        <View className={` px-3 py-1 rounded-md`}>
          <Text className={`text-red-400 font-semibold text-base`}>Pending</Text>
        </View>
      );
    }
  };

  const renderItem = (item: any) => (
    <View className={`${cardBg} px-4 py-3 w-full rounded-lg mb-3 border ${borderColor} shadow-sm`}>
      {/* File name row - full width */}
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 p-2 rounded-lg mr-3">
          <FileText color="#3B82F6" size={24} />
        </View>
        <View className="flex-1 gap-1">
        <Text className={`${textColor} text-base font-semibold flex-1`} numberOfLines={2}>
          {desanitizeFileName(item.file_name)}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className={`${subText} text-sm`}>
          {calculatePrice(item.page_count) > 0 && (
          <Text className={`${subText} text-sm ml-4`}>
            {item.page_count <= 1 ? `${item.page_count} page` : `${item.page_count} pages`}
          </Text>
        )} 
        </Text>
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
        </View>
      </View>
    </View>

      {/* Price and action */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-start justify-start ml-[-10px]">
          {getStatusBadge(item)}
        </View>
        <View className="flex-row items-center justify-between">
        {!item.payment_success && (
          <TouchableOpacity
            className={`rounded-lg bg-[#008cff] items-center justify-center ${paymentLoading[item.id] ? 'opacity-70' : 'opacity-100'}`}
            onPress={() => handlePayment(item)}
            disabled={paymentLoading[item.id]}
            style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            {paymentLoading[item.id] ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-sm ml-2">Processing...</Text>
              </>
            ) : (
              <Text className="text-white font-semibold text-base">Pay ₹{calculatePrice(item.page_count)}</Text>
            )}
          </TouchableOpacity>
        )}
        </View>

        {item.payment_success && item.magic_code !== "N/A" && item.printed === false && (
          <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-2 rounded-lg`}>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-mono text-base`}>
              Code: {item.magic_code}
            </Text>
          </View>
        )}
        {item.payment_success && item.magic_code !== "N/A" && item.printed === true && (
            <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-2 rounded-lg`}>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-mono text-base`}>
              {item.printed === true ? "Printed" : "Not Printed"}
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
          <View className={`flex-1 h-[45px] flex-row items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3`}>
            <Search color={isDark ? "#9CA3AF" : "#6B7280"} size={20} />
            <TextInput
              placeholder="Search files..."
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoComplete="off"
              style={{
                flex: 1,
                fontSize: 16,
                color: textColor,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === 'android' ? 8 : 0
              }}
              autoCorrect={false}
              autoCapitalize="none"
              textAlignVertical='center'
              clearButtonMode="while-editing"
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
          <View className="flex-row" style={{ gap: 4 }}>
            {["All", "Paid", "Pending", "Printed"].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                style={{ flex: 1 }}
                className={`rounded-lg min-h-[35px] items-center ${statusFilter === status
                    ? ""
                    : isDark ? "bg-gray-700" : "bg-gray-200"
                  } justify-center`}
              >
                {statusFilter === status ? (
                  <View className="bg-[#008cff] rounded-lg absolute items-center justify-center left-0 right-0 top-0 bottom-0">
                    <Text className="font-semibold text-[14px] text-white px-1">
                      {status}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className={`font-semibold text-[14px] px-1 ${
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
            <Text className={`text-black dark:text-white text-xl font-semibold mb-2`}>
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
