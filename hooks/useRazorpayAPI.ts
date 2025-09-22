import RazorpayCheckout from 'react-native-razorpay';
import { Alert, Platform } from 'react-native';
import { checkForSessionExpiry } from "@/utils/sessionHandler";

interface PaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: {
    paymentOptions: PaymentOptions;
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    code: string;
  };
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    file_id: string;
    payment_id: string;
    amount: number;
    magic_code: string;
    email_sent: boolean;
  };
}

export const useRazorpayAPI = () => {
  const createOrder = async (
    userId: string,
    userName: string,
    userEmail: string,
    userMobile: string,
    amount: number,
    fileId: string,
    fileName: string
  ): Promise<CreateOrderResponse> => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('userName', userName);
      formData.append('userEmail', userEmail);
      formData.append('userMobile', userMobile);
      formData.append('amount', amount.toString());
      formData.append('fileId', fileId);
      formData.append('fileName', fileName);
      
      // Add app logo for Razorpay checkout
      formData.append('appLogo', 'https://printbot.cloud/assets/logo.png');
      formData.append('description', 'PrintBot - Instant Document Printing');

      const response = await fetch('https://printbot.cloud/api/v1/create_order_razor_api.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check for 401 session expiry
      if (checkForSessionExpiry(response)) {
        return {
          success: false,
          message: 'Session expired',
        };
      }

      const result: CreateOrderResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create order');
      }

      return result;
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  };

  const processPayment = async (
    userId: string,
    userName: string,
    userEmail: string,
    userMobile: string,
    amount: number,
    fileId: string,
    fileName: string,
    onProcessingStart?: () => void,
    onProcessingComplete?: (success: boolean, magicCode?: string, error?: string) => void
  ): Promise<{ success: boolean; magicCode?: string; paymentId?: string; error?: string }> => {
    try {
      // Step 1: Create order on server
      const orderResponse = await createOrder(
        userId,
        userName,
        userEmail,
        userMobile,
        amount,
        fileId,
        fileName
      );

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const { paymentOptions, orderId, razorpayOrderId } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      return new Promise((resolve) => {
        RazorpayCheckout.open(paymentOptions)
          .then(async (paymentData: any) => {
            try {
              // Notify that payment verification is starting
              onProcessingStart?.();
              
              // Step 3: Verify payment on server
              const verificationResponse = await verifyPayment(
                orderId,
                fileId,
                userId,
                paymentData.razorpay_payment_id,
                paymentData.razorpay_order_id,
                paymentData.razorpay_signature
              );

              if (verificationResponse.success && verificationResponse.data) {
                onProcessingComplete?.(true, verificationResponse.data.magic_code);
                resolve({
                  success: true,
                  magicCode: verificationResponse.data.magic_code,
                  paymentId: verificationResponse.data.payment_id,
                });
              } else {
                const errorMsg = verificationResponse.message || 'Payment verification failed';
                onProcessingComplete?.(false, undefined, errorMsg);
                resolve({
                  success: false,
                  error: errorMsg,
                });
              }
            } catch (error: any) {
              console.error('Payment verification error:', error);
              const errorMsg = error.message || 'Payment verification failed';
              onProcessingComplete?.(false, undefined, errorMsg);
              resolve({
                success: false,
                error: errorMsg,
              });
            }
          })
          .catch((error: any) => {
            console.error('Razorpay payment error:', error);

            // Try to parse error description if it's a JSON string
            let userMessage = 'Payment failed';
            if (error && typeof error.description === 'string') {
              try {
                const parsed = JSON.parse(error.description);
                if (parsed && parsed.error && parsed.error.reason) {
                  if (parsed.error.reason === 'payment_error') {
                    userMessage = 'Payment could not be completed. Please try again or use a different payment method.';
                  } else {
                    userMessage = parsed.error.description || userMessage;
                  }
                }
              } catch {
                // Not JSON, use as is
                userMessage = error.description || userMessage;
              }
            } else if (error && error.description) {
              userMessage = error.description;
            }

            // Handle user cancellation
            if (error.code === 1 || userMessage.toLowerCase().includes('cancelled')) {
              userMessage = 'Payment was cancelled by user.';
            }

            resolve({
              success: false,
              error: userMessage,
            });
          });
      });
    } catch (error: any) {
      console.error('Payment process error:', error);
      return {
        success: false,
        error: error.message || 'Payment process failed',
      };
    }
  };

  const verifyPayment = async (
    orderId: string,
    fileId: string,
    userId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<PaymentVerificationResponse> => {
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('fileId', fileId);
      formData.append('userId', userId);
      formData.append('razorpay_payment_id', razorpayPaymentId);
      formData.append('razorpay_order_id', razorpayOrderId);
      formData.append('razorpay_signature', razorpaySignature);

      const response = await fetch('https://printbot.cloud/api/v1/callback_razor_api.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check for 401 session expiry
      if (checkForSessionExpiry(response)) {
        return {
          success: false,
          message: 'Session expired',
        };
      }

      const result: PaymentVerificationResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment verification failed');
      }

      return result;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: error.message || 'Payment verification failed',
      };
    }
  };

  const showPaymentErrorAlert = (errorMessage: string) => {
    Alert.alert(
      'Payment Failed',
      errorMessage,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showPaymentSuccessAlert = (magicCode: string) => {
    Alert.alert(
      'Payment Successful! 🎉',
      `Your magic code is: ${magicCode}\n\nPlease save this code - you'll need it to collect your printed documents!`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return {
    processPayment,
    createOrder,
    verifyPayment,
    showPaymentErrorAlert,
    showPaymentSuccessAlert,
  };
};
