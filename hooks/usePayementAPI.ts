import phonepeSDK from "react-native-phonepe-pg";
import Base64 from "react-native-base64";
import sha256 from "sha256";
import { Alert, Platform } from "react-native";

export const usePaymentAPI = async (
    transactionID: string,
    cost: number,
    userId: string,
    fileId: string,
    userPhone: string,
    setGPAYInstalled: (value: boolean) => void,
    setPhonePeInstalled: (value: boolean) => void,
    setPaytmInstalled: (value: boolean) => void,
    GPAYInstalled: boolean,
    PhonePeInstalled: boolean,
    PaytmInstalled: boolean
) => {
    try {
        const environment = "SANDBOX"; // or "SANDBOX" "PRODUCTION"
        const merchantId = "PGTESTPAYUAT86"; // "M22MXCSHVPHOY"
        const appId = "cloud.voltrack.app";
        const salt_key = "96434309-7796-489d-8924-ab56988a6076"; //"5ef6e9e9-07e9-4d45-a583-cbe550893d61"
        // const environment = "SANDBOX"; // Use SANDBOX for testing
        // const merchantId = "PGTESTPAYUAT86"; // Replace with your actual merchant ID
        // const appId = "com.navstream.printbot"; // Replace with your actual app ID
        // const salt_key = "96434309-7796-489d-8924-ab56988a6076";
        const salt_index = 1;
        const callbackUrl = ""; // Use temporary URL for testing
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

        const txnId = transactionID; // Generate a unique transaction ID
        const amount = cost * 100; // Convert to paisa

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
                    : (GPAYInstalled ? "com.google.android.apps.nbu.paisa.user" : PhonePeInstalled ? "com.phonepe.app" : PaytmInstalled ? "net.one97.paytm" : "PAY_PAGE"),
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

        if (result.status === "SUCCESS") {
            // console.log("Payment Success:", result);
            return true;
        } else {
            console.error("Payment Failed:", result);
            Alert.alert("Payment Failed", result.message || "Payment did not complete.");
            return false;
        }

    } catch (error: any) {
        console.error("Payment Error:", error);
        Alert.alert("Payment Error", error?.message || "Error processing payment.");
        return false;
    }
};