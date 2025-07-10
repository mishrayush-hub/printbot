import { useState } from 'react';
import { useRazorpayAPI } from './useRazorpayAPI';

export const usePaymentAPI = () => {
    const { processPayment, showPaymentErrorAlert } = useRazorpayAPI();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalStage, setModalStage] = useState<'processing' | 'success' | 'error'>('processing');
    const [magicCode, setMagicCode] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const initiatePayment = async (
        transactionID: string,
        cost: number,
        userId: string,
        fileId: string,
        userName: string,
        userEmail: string,
        userPhone: string
    ) => {
        try {
            const result = await processPayment(
                userId,
                userName,
                userEmail,
                userPhone,
                cost,
                fileId,
                `Transaction-${transactionID}`,
                // onProcessingStart callback
                () => {
                    setModalStage('processing');
                    setModalVisible(true);
                },
                // onProcessingComplete callback
                (success: boolean, code?: string, error?: string) => {
                    if (success && code) {
                        setMagicCode(code);
                        setModalStage('success');
                        // Hide modal after 5 seconds for success
                        setTimeout(() => {
                            setModalVisible(false);
                            setMagicCode('');
                        }, 5000);
                    } else {
                        setErrorMessage(error || 'Payment processing failed');
                        setModalStage('error');
                        // Hide modal after 3 seconds for error
                        setTimeout(() => {
                            setModalVisible(false);
                            setErrorMessage('');
                        }, 3000);
                    }
                }
            );

            if (result.success && result.magicCode) {
                return {
                    success: true,
                    magicCode: result.magicCode,
                    paymentId: result.paymentId
                };
            } else {
                // Only show error alert if modal is not visible (for cases where Razorpay itself fails)
                if (!modalVisible) {
                    showPaymentErrorAlert(result.error || "Payment failed");
                }
                return {
                    success: false,
                    error: result.error || "Payment failed"
                };
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            // Only show error alert if modal is not visible
            if (!modalVisible) {
                showPaymentErrorAlert(error?.message || "Error processing payment.");
            }
            return {
                success: false,
                error: error?.message || "Error processing payment."
            };
        }
    };

    return {
        initiatePayment,
        modalState: {
            visible: modalVisible,
            stage: modalStage,
            magicCode,
            errorMessage,
        },
        setModalVisible,
    };
};