import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, useColorScheme, Clipboard, Platform } from "react-native";
import { Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import phonepeSDK from "react-native-phonepe-pg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Base64 from "react-native-base64";
import sha256 from "sha256";

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

  const generateMagicCode = async (orderId: string, cost: string) => {
  try {
    const response = await fetch("https://printbot.navstream.in/callback_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        order_id: orderId,
        cost: cost,
        user_id: userId,
        file_id: fileId
      }).toString()
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("Error generating magic code:", data.message);
      Alert.alert("Error", data.message || "Failed to generate magic code.");
    } else {
      console.log("Magic code generated:", data);
      
      Alert.alert(
        "Magic Code Generated",
        `Your magic code is: ${data.magic_code}`,
        [
          { text: "OK", style: "default" },
          {
            text: "Copy to Clipboard",
            onPress: () => {
              Clipboard.setString(data.magic_code);
              // Optional: Show a toast that it was copied
              Alert.alert("Copied!", "Magic code copied to clipboard.");
            }
          }
        ]
      );
    }
  } catch (error) {
    console.error("Error generating magic code:", error);
    Alert.alert("Error", "An unexpected error occurred while generating the magic code.");
  }
};

  const generateTransactionId = () => {
    const date = new Date();
    const timestamp = date.getTime().toString();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PRINTBOT-${timestamp}-${randomPart}`;
  };

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
    const environment = "PRODUCTION"; // or "SANDBOX"
    const merchantId = "M22MXCSHVPHOY";
    const appId = "";
    const salt_key = "5ef6e9e9-07e9-4d45-a583-cbe550893d61";
    const salt_index = 1;
    const callbackUrl = "https://printbot.navstream.in"; // Use temporary URL for testing
    await phonepeSDK.init(environment, merchantId, appId, true);

    phonepeSDK.isGPayAppInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          setGPAYInstalled(true);
        } else {
          setGPAYInstalled(false);
        }
      })
      .catch((error) => {
        console.error("Error checking GPay installation:", error);
        setGPAYInstalled(false);
      });

    phonepeSDK.isPhonePeInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          setPhonePeInstalled(true);
        } else {
          setPhonePeInstalled(false);
        }
      })
      .catch((error) => {
        console.error("Error checking PhonePe installation:", error);
        setPhonePeInstalled(false);
      });
    phonepeSDK.isPaytmAppInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          setPaytmInstalled(true);
        } else {
          setPaytmInstalled(false);
        }
      })
      .catch((error) => {
        console.error("Error checking Paytm installation:", error);
        setPaytmInstalled(false);
      });

    const txnId = generateTransactionId();
    const amount = (returnedPageCount * 2) * 100; // e.g. ₹2 per page → in paisa

    const requestBody = {
      merchantId: merchantId,
      merchantTransactionId: txnId,
      merchantUserId: userId,
      merchantOrderId: txnId,
      amount: amount,
      mobileNumber: userPhone,
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: GPAYInstalled || PhonePeInstalled || PaytmInstalled ? "UPI_INTENT" : "PAY_PAGE",
        targetApp: Platform.OS === "ios" ? 
                            (GPAYInstalled ? "GPAY" : PhonePeInstalled ? "PHONEPE" : PaytmInstalled ? "PAYTM" : "PAY_PAGE")
                            : ( GPAYInstalled ? "com.google.android.apps.nbu.paisa.user" : PhonePeInstalled ? "com.phonepe.app" : PaytmInstalled ? "net.one97.paytm" : "PAY_PAGE"),
      }
    };
    const payload = JSON.stringify(requestBody);
    const payloadBase64 = Base64.encode(payload);
    const stringToHash = payloadBase64 + "/pg/v1/pay" + salt_key;
    const checksum = sha256(stringToHash) + "###" + salt_index;

    const result = await phonepeSDK.startTransaction(
      payloadBase64,
      checksum,
      null,
      null
    );

    if (result.success) {
      console.log("Payment Success:", result);
      setPaid(true);
      generateMagicCode(txnId, (returnedPageCount * 2).toString());
    } else {
      console.error("Payment Failed:", result);
      Alert.alert("Payment Failed", result.message || "Payment did not complete.");
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

    const response = await fetch("https://printbot.navstream.in/file_upload_api.php", {
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

  // File Upload Handler
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg"],
        multiple: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
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
          price = pageCount * 2;
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

        setUploadedFiles((prev) => [...prev, newFile]);
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
    <View className={`flex-1 pb-[50px] ${bgColor}`}>
      <View
        className={`border border-dashed ${
          isDarkMode ? "border-gray-500" : "border-gray-400"
        } rounded-lg mt-8 p-6 py-14 gap-3 flex items-center justify-center mx-4`}
      >
        <Upload color="#38b6ff" size={60} />
        <Text className={`font-semibold text-3xl mt-2 ${textColor}`}>Drop your files to print</Text>
        <TouchableOpacity
          className={`mt-4 border ${
            isDarkMode ? "border-gray-400" : "border-gray-600"
          } px-4 py-2 rounded-full`}
          onPress={handleFileUpload}
        >
          <Text className={`text-2xl ${textColor}`}>Select files</Text>
        </TouchableOpacity>
      </View>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <FlatList
          data={uploadedFiles}
          contentContainerStyle={{ paddingBottom: 50 }}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => {
            const handleCopiesChange = (delta: number) => {
              setUploadedFiles((prev) =>
                prev.map((file, i) =>
                  i === index
                    ? {
                        ...file,
                        copies: Math.max(1, (file.copies || 1) + delta),
                      }
                    : file
                )
              );
            };

            const copies = 1;
            const totalPrice = item.price * copies;

            return (
              <View className={`${cardBg} px-5 py-3 rounded-lg mt-2 mx-4 border shadow-md`}>
                <View className="flex-row justify-between items-center">
                  <Text className={`${textColor} max-w-[300px] text-2xl font-bold`}>
                    {item.fileName.length > 20
                      ? `${item.fileName.substring(0, 17)}...${item.fileType}`
                      : item.fileName}
                  </Text>
                  <Text className="text-[#38b6ff] font-semibold text-2xl">₹{totalPrice}</Text>
                </View>

                {item.fileType === "application/pdf" && (
                  <Text className={`${secondaryTextColor} text-lg mt-1`}>Pages: {item.pages}</Text>
                )}

                {/* Copies Selector and Print Button */}
                <View className="flex-row items-center justify-end mt-3 space-x-4">
                  {/* <View className="flex-row items-center border rounded-full px-3 py-1">
                    <TouchableOpacity onPress={() => handleCopiesChange(-1)} className="px-2">
                      <Text className={`text-2xl ${textColor}`}>−</Text>
                    </TouchableOpacity>
                    <Text className={`text-lg px-2 ${textColor}`}>{copies} {copies > 1 ? "copies" : "copy"}</Text>
                    <TouchableOpacity onPress={() => handleCopiesChange(1)} className="px-2">
                      <Text className={`text-2xl ${textColor}`}>＋</Text>
                    </TouchableOpacity>
                  </View> */}

                  <TouchableOpacity
                    className="bg-[#38b6ff] px-6 py-2 rounded-full"
                    onPress={() => {
                      if (!uploaded && !paid) {
                        Alert.alert(
                          "Confirm Upload",
                          "Are you sure you want to upload the file to the cloud?",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Upload Now",
                              onPress: () => {
                                handleFileToCloud();
                              },
                            },
                          ],
                          { cancelable: true }
                        );
                      } else if (uploaded && !paid) {
                        Alert.alert(
                          "Confirm Payment",
                          "You have already uploaded this file. Do you want to pay for printing?",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Pay Now",
                              onPress: () => {
                                paymentHandler();
                              },
                            },
                          ],
                          { cancelable: true }
                        );
                      }
                    }}
                  >
                    <Text className="text-white font-bold text-lg">
                      {!uploaded && !paid ? "Upload to Cloud" : "Pay to Print"}
                      </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
