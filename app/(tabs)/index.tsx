import React, {useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, useColorScheme } from "react-native";
import { Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { callbackAPI } from "@/hooks/useCallbackAPI";
import { usePaymentAPI } from "@/hooks/usePayementAPI";
import { generateTransactionId } from "@/hooks/generateTransactionId";

export default function HomeScreen() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { fileName: string; fileSize: number; fileType: string; pages?: number; price: number; otp: number; copies: number }[]
  >([]);
  const colorScheme = useColorScheme();
  const [authToken, setAuthToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const isDarkMode = colorScheme === "dark";
  const [file, setFile] = useState({
    uri: "",
    name: "",
    type: ""
  });
  const [fileId, setFileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [paid, setPaid] = useState(false);
  const [magicCode, setMagicCode] = useState("");
  const [returnedPageCount, setReturnedPageCount] = useState(0);
  const [GPAYInstalled, setGPAYInstalled] = useState(false);
  const [PhonePeInstalled, setPhonePeInstalled] = useState(false);
  const [PaytmInstalled, setPaytmInstalled] = useState(false);

  useEffect(() => {
    const getTokenDetails = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");
        const userPhone = await AsyncStorage.getItem("userPhone");
        const userEmail = await AsyncStorage.getItem("userEmail");
        const userName = await AsyncStorage.getItem("userName");
        if (authToken) setAuthToken(authToken);
        if (userId) setUserId(userId);
        if (userPhone) setUserPhone(userPhone);
        if (userEmail) setUserEmail(userEmail);
        if (userName) setUserName(userName);
      } catch (error) {
        console.error("Error fetching token details:", error);
        Alert.alert("Error", "Failed to fetch user details. Please try again.");
      }
    };
    getTokenDetails();
  }, []);

  const paymentHandler = async () => {
    if (!uploaded) {
      Alert.alert("Upload Required", "Please upload a file before proceeding to payment.");
      return;
    }
    if (paid) {
      Alert.alert("Payment Already Made", "You have already paid for this file.");
      return;
    }

    try {
      setLoading(true);
      const txnId = generateTransactionId();
      const amount = uploadedFiles.reduce((sum, file) => sum + file.price, 0); // Amount in rupees (payment API will convert to paisa)
      const result = await usePaymentAPI(
        txnId,
        amount,
        userId,
        fileId,
        userPhone,
        setGPAYInstalled,
        setPhonePeInstalled,
        setPaytmInstalled,
        GPAYInstalled,
        PhonePeInstalled,
        PaytmInstalled
      );
      if (result) {
        console.log("Payment Success:", result);
        setPaid(true);
        const magic = await callbackAPI(txnId, userId, fileId); // Call the callback API with txnId, userId, and fileId
        if (magic) {
          setMagicCode(magic);
        }
      } else {
        console.error("Payment Failed:", result);
        Alert.alert("Payment Failed", "Payment did not complete.");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      Alert.alert("Payment Error", error?.message || "Error processing payment.");
    } finally {
      setLoading(false);
    }
  };


  const handleFileToCloud = async () => {
    try {
      setLoading(true);
      setUploaded(false);
      const authToken = await AsyncStorage.getItem("authToken") || "";
      const userId = await AsyncStorage.getItem("userId") || "";

      if (!file) {
        Alert.alert("No file selected", "Please select a file before uploading.");
        setLoading(false);
        setUploaded(false);
        return;
      }

      const formData = new FormData();
      formData.append("authToken", authToken);
      formData.append("user_id", userId);
      formData.append("file", {
        uri: file.uri,
        name: file.name || `PB_File_${userId}`,
        type: file.type || "application/pdf",
      } as any);

      const response = await fetch("https://printbot.cloud/api/v1/file_upload_api.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);
        if (!response.ok || !data.success) {
          console.error("Upload failed:", data.message);
          Alert.alert("Upload Failed", data.message || "Unknown error.");
          setUploaded(false);
        } else {
          console.log("File uploaded:", data);
          setUploaded(true);
          setReturnedPageCount(data.page_count || 0);
          setFileId(data.file_id || "");
          Alert.alert("Upload Successful", "Your file has been uploaded to the cloud.");
        }
      } catch (jsonError) {
        console.error("Invalid JSON from server:", text);
        Alert.alert("Upload Failed", "Unexpected server response.");
        setUploaded(false);
      }

    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "An unexpected error occurred.");
      setUploaded(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to count pages in a PDF
  const getPdfPageCount = async (uri: string) => {
    try {
      const fileData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const matches = fileData.match(/\/Type\s*\/Page[^s]/g);
      return matches ? matches.length : 1;
    } catch (error) {
      console.error("Error getting PDF page count:", error);
      return 1;
    }
  };

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

  // File Upload Handler
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg"],
        multiple: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        // Reset all states when a new file is selected
        setUploaded(false);
        setPaid(false);
        setFileId("");
        setMagicCode("");
        setUploadedFiles([]);
        setReturnedPageCount(0);
        
        const file = result.assets[0];
        const fileType = file.mimeType || "";
        setFile({
          uri: file.uri,
          name: file.name || `PB_File_${userId}}`,
          type: fileType,
        });
        let price = 0;
        let pageCount = 1;

        if (fileType === "application/pdf") {
          pageCount = await getPdfPageCount(file.uri);
          price = calculatePrice(pageCount); // Use tiered pricing
        } else if (fileType === "image/jpeg") {
          price = 10;
        } else {
          Alert.alert("Invalid File", "Only PDF and JPG files are allowed.");
          return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const newFile = {
          fileName: file.name ?? "Unknown File",
          fileSize: file.size ?? 0,
          fileType,
          pages: fileType === "application/pdf" ? pageCount : undefined,
          price,
          otp,
          copies: 1,
        };

        setUploadedFiles([newFile]); // Replace with new file instead of adding
      }
    } catch (err) {
      console.error("Error picking file:", err);
    }
  };

  const bgColor = isDarkMode ? "bg-black" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const secondaryTextColor = isDarkMode ? "text-gray-400" : "text-gray-700";
  const cardBg = isDarkMode ? "bg-neutral-900 border-gray-700" : "bg-neutral-100 border-gray-300";

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Upload Documents Section - Matching Web */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* <Text className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Hello, {userName || "User"} 👋
          </Text> */}
          <Text className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Upload Documents
          </Text>
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Upload and manage your documents for printing
          </Text>

          {/* Pricing Info */}
          <View className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-200'}`}>
            <Text className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              Tiered Pricing:
            </Text>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              • Less than 10 pages: ₹4/page  • 10-50 pages: ₹3/page  • 50+ pages: ₹2/page
            </Text>
          </View>

          {/* Upload Area - Web Style */}
          <View className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-6 items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Upload size={40} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
            <Text className={`text-base font-medium mt-3 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Drop files here or click to browse
            </Text>
            <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Supports PDF up to 50MB
            </Text>
            <TouchableOpacity
              className="bg-blue-500 px-6 py-2 rounded-lg"
              onPress={handleFileUpload}
            >
              <Text className="text-white font-medium">Select Files</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 pt-4">
          {/* Uploaded Files Section - Web Style */}
          {uploadedFiles.length > 0 && (
            <View className="mb-1">
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {uploaded ? "Uploaded File" : "Selected File"}
              </Text>

              {/* Uploaded Files List */}
              {uploadedFiles.map((item, index) => {
                const totalPrice = item.price;

                return (
                  <View key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg mb-3 border`}>
                    {/* File Header - Web Style */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded items-center justify-center mr-3">
                          <Text className="text-blue-600 text-sm font-bold">📄</Text>
                        </View>
                        <View className="flex-1">
                          <Text className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} ${item.fileName.length > 25 ? 'text-sm' : 'text-base'}`} numberOfLines={1}>
                            {item.fileName}
                          </Text>
                          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(item.fileSize / 1024).toFixed(0)} KB
                          </Text>
                        </View>
                      </View>

                      {/* Status Badge */}
                      <View className={`px-2 py-1 rounded-full ${paid ? 'bg-green-100 dark:bg-green-900' :
                          uploaded ? 'bg-blue-100 dark:bg-blue-900' :
                            'bg-yellow-100 dark:bg-yellow-900'
                        }`}>
                        <Text className={`text-xs font-medium ${paid ? 'text-green-700 dark:text-green-300' :
                            uploaded ? 'text-blue-700 dark:text-blue-100' :
                              'text-yellow-700 dark:text-yellow-100'
                          }`}>
                          {paid ? 'Paid' : uploaded ? 'Verified' : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    {/* File Details */}
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Pages: {item.pages || 1}
                      </Text>
                      <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        ₹ {totalPrice.toFixed(2)}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-end">
                      {!uploaded && !paid && (
                        <TouchableOpacity
                          className="bg-blue-500 px-4 py-2 rounded-lg"
                          onPress={() => {
                            Alert.alert(
                              "Upload File",
                              `Upload ${item.fileName} to cloud?`,
                              [
                                { text: "Cancel", style: "cancel" },
                                { text: "Upload", onPress: () => handleFileToCloud() }
                              ]
                            );
                          }}
                        >
                          <Text className="text-white text-sm font-medium">Upload</Text>
                        </TouchableOpacity>
                      )}

                      {uploaded && !paid && (
                        <View className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                          <Text className={`text-sm text-blue-700 dark:text-blue-100`}>
                            Ready for Payment
                          </Text>
                        </View>
                      )}

                      {paid && (
                        <View className="flex-row items-end space-y-2">
                          {magicCode && (
                            <View className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                              <Text className={`text-xs font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                Code: {magicCode}
                              </Text>
                            </View>
                          )}
                          <View className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
                            <Text className={`text-sm text-green-700 dark:text-green-300`}>
                              Completed ✓
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Quick Stats - Web Style */}
          <View className="mb-4">
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Quick Stats
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Files</Text>
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {uploadedFiles.length}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Verified</Text>
                  <Text className={`font-semibold ${uploaded ? 'text-green-600' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {uploaded ? uploadedFiles.length : 0}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Paid</Text>
                  <Text className={`font-semibold ${paid ? 'text-green-600' : isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {paid ? uploadedFiles.length : 0}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Processing</Text>
                  <Text className={`font-semibold text-blue-600`}>
                    {loading ? 1 : 0}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Errors</Text>
                  <Text className="font-semibold text-red-600">0</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Summary - Web Style */}
          {uploadedFiles.length > 0 && (
            <View className="mb-4">
              <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Payment Summary
                </Text>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Total</Text>
                  <Text className="text-lg font-bold text-green-600">
                    ₹{uploadedFiles.reduce((sum, file) => sum + file.price, 0).toFixed(2)}
                  </Text>
                </View>

                <View className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price Breakdown
                  </Text>
                  {uploadedFiles.map((file, index) => (
                    <View key={index} className="flex-row justify-between py-1">
                      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {file.pages || 1} pages × ₹{getPricePerPage(file.pages || 1)}/page
                      </Text>
                      <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        ₹{file.price.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {uploadedFiles.length > 0 && uploaded && !paid && (
                  <TouchableOpacity
                    className="bg-blue-500 py-3 px-4 rounded-lg mt-4 items-center"
                    onPress={paymentHandler}
                  >
                    <Text className="text-white font-medium">
                      💳 Proceed to Payment
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
