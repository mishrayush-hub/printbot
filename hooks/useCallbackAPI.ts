
import { Alert } from "react-native";
import { checkForSessionExpiry } from "@/utils/sessionHandler";

export const callbackAPI = async (orderId: string, user_id: string, file_id: string) => {
    try {
      const response = await fetch("https://printbot.cloud/api/v1/callback_api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          orderId: orderId.toString(),
          userId: user_id.toString(),
          fileId: file_id.toString()
        }).toString()
      });

      // Check for 401 session expiry
      if (checkForSessionExpiry(response)) {
        return null; // Session expired handler will take care of navigation
      }

      // console.log("Data: ", {
      //   orderId: orderId,
      //   userId: user_id,
      //   fileId: file_id
      // });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error("Error generating magic code:", data);
        Alert.alert("Error", data.message || "Failed to generate magic code.");
        return null; // Return null in case of error
      } else {
        // console.log("Magic code generated:", data);
        Alert.alert(
          "Magic Code Generated",
          `Your magic code is: ${data.data.magic_code}`,
          [
            { text: "OK", style: "default" },
          ],
          { cancelable: true }
        );
        return data.data.magic_code; // Return the magic code
      }
    } catch (error) {
      console.error("Error generating magic code:", error);
      Alert.alert("Error", "An unexpected error occurred while generating the magic code.");
      return null; // Return null in case of error
    }
  };