import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, useColorScheme } from "react-native";
import { Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";

export default function HomeScreen() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { fileName: string; fileSize: number; fileType: string; pages?: number; price: number; otp: number; copies: number }[]
  >([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

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

        router.push({
          pathname: "/explore",
          params: { orders: JSON.stringify([newFile]) },
        });
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

            const copies = item.copies || 1;
            const totalPrice = item.price * copies;

            return (
              <View className={`${cardBg} px-5 py-3 rounded-lg mt-2 mx-4 border shadow-md`}>
                <View className="flex-row justify-between items-center">
                  <Text className={`${textColor} max-w-[300px] text-lg font-bold`}>
                    {item.fileName.length > 20
                      ? `${item.fileName.substring(0, 17)}...${item.fileType}`
                      : item.fileName}
                  </Text>
                  <Text className="text-[#38b6ff] font-semibold text-lg">₹{totalPrice}</Text>
                </View>

                {item.fileType === "application/pdf" && (
                  <Text className={`${secondaryTextColor} text-sm mt-1`}>Pages: {item.pages}</Text>
                )}

                {/* Copies Selector and Print Button */}
                <View className="flex-row items-center justify-between mt-3 space-x-4">
                  <View className="flex-row items-center border rounded-full px-3 py-1">
                    <TouchableOpacity onPress={() => handleCopiesChange(-1)} className="px-2">
                      <Text className={`text-2xl ${textColor}`}>−</Text>
                    </TouchableOpacity>
                    <Text className={`text-lg px-2 ${textColor}`}>{copies} {copies > 1 ? "copies" : "copy"}</Text>
                    <TouchableOpacity onPress={() => handleCopiesChange(1)} className="px-2">
                      <Text className={`text-2xl ${textColor}`}>＋</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="bg-[#38b6ff] px-6 py-2 rounded-full"
                    onPress={() => {
                      const fileToPrint = [{ ...item, copies }];
                      router.push({
                        pathname: "/(auth)/checkout",
                        params: { files: JSON.stringify(fileToPrint), totalPrice },
                      });
                    }}
                  >
                    <Text className="text-white font-bold text-lg">Print</Text>
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
