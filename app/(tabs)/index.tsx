import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, useColorScheme } from "react-native";
import { Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePaymentAPI } from "@/hooks/usePayementAPI";
import PaymentProcessingModal from "@/components/PaymentProcessingModal";
import { generateTransactionId } from "@/hooks/generateTransactionId";
import { checkAndRequestPermissions, showPermissionRequiredAlert } from "@/utils/permissionUtils";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { fileName: string; fileSize: number; fileType: string; pages?: number; price: number; otp: number; copies: number; isEstimated?: boolean }[]
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

  // Helper to sanitize filenames:
  // - trims whitespace
  // - replaces internal whitespace runs with single underscore
  // - avoids leading/trailing underscores
  // - preserves extension and avoids underscore before extension
  // Minimal sanitize: only replace spaces with underscores and preserve extension.
  // If `uid` provided, prefix the filename with `<uid>_`.
  const sanitizeFileName = (originalName: string | undefined, uid?: string) => {
    const name = (originalName || "").toString();

    if (!name) return uid ? `${uid}` : "file";

    const lastDot = name.lastIndexOf('.');
    let base = name;
    let ext = '';

    if (lastDot > 0) {
      base = name.slice(0, lastDot);
      ext = name.slice(lastDot); // includes the dot
    }

    // Only replace spaces with underscores in the base name
    base = base.replace(/\s+/g, '_');

    const finalBase = (uid && uid.toString().trim() !== '') ? `${uid}_${base}` : base;

    return finalBase + ext;
  };

  const removeFile = () => {
    setFile({
      uri: "",
      name: "",
      type: ""
    });
    setUploaded(false);
    setUploadedFiles([]);
    setFileId("");
    setPaid(false);
    setMagicCode("");
    setReturnedPageCount(0);
    setLoading(false);
  };

  const { initiatePayment, modalState, setModalVisible } = usePaymentAPI();

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
      const amount = uploadedFiles.reduce((sum, file) => sum + file.price, 0);

      const result = await initiatePayment(
        txnId,
        amount,
        userId,
        fileId,
        userName,
        userEmail,
        userPhone
      );

      if (result.success && result.magicCode) {
        setPaid(true);
        setMagicCode(result.magicCode);
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

      if (!file || !file.uri) {
        Alert.alert("No file selected", "Please select a file before uploading.");
        setLoading(false);
        setUploaded(false);
        return;
      }

      // Validate file exists
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        Alert.alert("File Error", "The selected file no longer exists. Please select a new file.");
        setLoading(false);
        setUploaded(false);
        return;
      }

      // console.log("Uploading file:", {
      //   uri: file.uri,
      //   name: file.name,
      //   type: file.type,
      //   size: fileInfo.size
      // });

      const formData = new FormData();
      formData.append("authToken", authToken);
      formData.append("user_id", userId);

      // Ensure file name is sanitized before upload
      const uploadFileName = sanitizeFileName(file.name, userId);

      formData.append("file", {
        uri: file.uri,
        name: uploadFileName,
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
      // console.log("Upload response:", text);

      try {
        const data = JSON.parse(text);
        // console.log("Parsed response:", data);

        if (!response.ok || !data.success) {
          console.error("Upload failed:", data.message);
          Alert.alert("Upload Failed", data.message || "Unknown error occurred during upload.");
          setUploaded(false);
        } else {
          // console.log("Upload successful:", data);
          setUploaded(true);
          setReturnedPageCount(data.page_count || 0);
          setFileId(data.file_id || "");

          // Update the uploaded files with server response
          if (data.page_count && uploadedFiles.length > 0) {
            const serverPageCount = data.page_count;
            const serverPrice = calculatePrice(serverPageCount);

            const updatedFiles = uploadedFiles.map(f => ({
              ...f,
              pages: serverPageCount,
              price: serverPrice,
              isEstimated: false // Now we have actual count
            }));
            setUploadedFiles(updatedFiles);

            // console.log("Updated pricing based on server response:", {
            //   serverPageCount,
            //   serverPrice,
            //   pricePerPage: getPricePerPage(serverPageCount)
            // });
          }

          Alert.alert("Upload Successful", `Your file has been uploaded to the cloud. Pages: ${data.page_count || 'Unknown'}`);
        }
      } catch (jsonError) {
        console.error("Invalid JSON from server:", text);
        Alert.alert("Upload Failed", "Unexpected server response. Please try again.");
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
      // For mobile, we'll use a more reliable approach
      // First, try to read the file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.error("File does not exist:", uri);
        return 1;
      }

      try {
        // Try to read as binary and look for page markers
  const fileData = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

        // Convert base64 to binary string for better parsing
        const binaryData = atob(fileData);

        // Look for PDF page count patterns
        const pageCountPatterns = [
          /\/Count\s+(\d+)/g,
          /\/Type\s*\/Page[^s]/g,
          /\/N\s+(\d+)/g
        ];

        let maxCount = 0;

        for (const pattern of pageCountPatterns) {
          const matches = binaryData.match(pattern);
          if (matches) {
            if (pattern.source.includes('Count') || pattern.source.includes('N')) {
              // Extract number from /Count or /N pattern
              const countMatch = pattern.exec(binaryData);
              if (countMatch && countMatch[1]) {
                maxCount = Math.max(maxCount, parseInt(countMatch[1], 10));
              }
            } else {
              // Count occurrences for /Type /Page pattern
              maxCount = Math.max(maxCount, matches.length);
            }
          }
        }

        return maxCount > 0 ? maxCount : 1;
      } catch (parseError) {
        console.error("Error parsing PDF for page count:", parseError);
        // Fallback: estimate based on file size (rough estimate)
        const sizeInKB = fileInfo.size / 1024;
        const estimatedPages = Math.max(1, Math.ceil(sizeInKB / 50)); // Assume ~50KB per page
        return Math.min(estimatedPages, 100); // Cap at 100 pages for safety
      }
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
      // Check permissions first
      const hasPermissions = await checkAndRequestPermissions();
      if (!hasPermissions) {
        showPermissionRequiredAlert();
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
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

        // Validate file type
        if (fileType !== "application/pdf") {
          Alert.alert("Invalid File", "Only PDF files are allowed.");
          return;
        }

        // console.log("Selected file:", {
        //   name: file.name,
        //   size: file.size,
        //   type: fileType,
        //   uri: file.uri
        // });

  // Sanitize filename and include userId prefix when available
  const sanitizedFileName = sanitizeFileName(file.name, userId);

        setFile({
          uri: file.uri,
          name: sanitizedFileName,
          type: fileType,
        });

        let price = 0;
        let pageCount = 1;

        try {
          pageCount = await getPdfPageCount(file.uri);
          price = calculatePrice(pageCount);

          // console.log("PDF analysis:", {
          //   pageCount,
          //   price,
          //   pricePerPage: getPricePerPage(pageCount)
          // });
        } catch (error) {
          console.error("Error analyzing PDF:", error);
          Alert.alert("Warning", "Could not analyze PDF properly. Using default pricing.");
          pageCount = 1;
          price = 4; // Default to 1 page at ₹4
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const newFile = {
          fileName: sanitizedFileName ?? "Unknown_File",
          fileSize: file.size ?? 0,
          fileType,
          pages: pageCount,
          price,
          otp,
          copies: 1,
          isEstimated: true, // Flag to indicate this is estimated, will be updated after upload
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 10, paddingTop: 15 }}>
        {/* Upload Documents Section - Matching Web */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
            <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Page count is estimated until upload. Final price will be calculated after upload.
            </Text>
          </View>

          {/* Upload Area - Web Style */}
          <View className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-6 items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Upload size={40} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
            <Text className={`text-base font-medium mt-3 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Drop PDF files here or click to browse
            </Text>
            <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Supports PDF files up to 50MB
            </Text>
            <TouchableOpacity
              className="max-w-[326px] max-h-[40px]"
              onPress={handleFileUpload}
            >
              <LinearGradient
                colors={['#2563eb', '#9333ea']} // from-blue-600 to-purple-600
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: '100%',
                  height: '100%',
                  paddingVertical: 2,
                  paddingHorizontal: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10, // Half of height (51/2) for perfect rounded corners
                }}
              >
                <Text className="text-white font-medium">Select PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View className="pt-4">
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
                      <View className="flex-row items-center">
                        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pages: {item.pages || 1}
                        </Text>
                        {item.isEstimated && !uploaded && (
                          <Text className={`text-xs ml-2 px-2 py-1 rounded ${isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                            Estimated
                          </Text>
                        )}
                      </View>
                      <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        ₹ {totalPrice.toFixed(2)}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-end">
                      {!uploaded && !paid && (
                        <TouchableOpacity
                          className="bg-red-500 max-w-[200px] max-h-[35px] items-center justify-center px-4 rounded-[8px] mr-2"
                          onPress={() => {
                            Alert.alert(
                              "Remove File",
                              `Remove ${item.fileName}?`,
                              [
                                { text: "Cancel", style: "cancel" },
                                { text: "Remove", style: "destructive", onPress: removeFile }
                              ]
                            );
                          }}
                        >
                          <Text className="text-white text-sm font-medium">Remove</Text>
                        </TouchableOpacity>
                      )}

                      {!uploaded && !paid && (
                        <TouchableOpacity
                          className="max-w-[200px] max-h-[35px] items-center"
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
                          <LinearGradient
                            colors={['#2563eb', '#9333ea']} // from-blue-600 to-purple-600
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              width: '100%',
                              height: '100%',
                              paddingVertical: 0,
                              paddingHorizontal: 20,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8, // Half of height (51/2) for perfect rounded corners
                            }}
                          >
                            <Text className="text-white text-sm font-medium">Upload File</Text>
                          </LinearGradient>
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
                        <View className="flex-row justify-between items-center w-full">
                          <View className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
                            <Text className={`text-sm text-green-700 dark:text-green-300`}>
                              Completed ✓
                            </Text>
                          </View>
                          {magicCode && (
                            <View className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                              <Text className={`text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                Code: {magicCode}
                              </Text>
                            </View>
                          )}
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
                    className="max-h-[40px] mt-4 items-center"
                    onPress={paymentHandler}
                  >
                    <LinearGradient
                      colors={['#2563eb', '#9333ea']} // from-blue-600 to-purple-600
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8, // Half of height (51/2) for perfect rounded corners
                      }}
                    >
                      <Text className="text-white font-medium">
                        💳 Proceed to Payment
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View className="h-20" />
      </ScrollView>

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        visible={modalState.visible}
        stage={modalState.stage}
        magicCode={modalState.magicCode}
        errorMessage={modalState.errorMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
