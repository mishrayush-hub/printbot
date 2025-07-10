import React from 'react';
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { CheckCircle, Clock } from 'lucide-react-native';

interface PaymentProcessingModalProps {
  visible: boolean;
  stage: 'processing' | 'success' | 'error';
  magicCode?: string;
  errorMessage?: string;
}

export default function PaymentProcessingModal({
  visible,
  stage,
  magicCode,
  errorMessage,
}: PaymentProcessingModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStageContent = () => {
    switch (stage) {
      case 'processing':
        return {
          icon: <Clock size={48} color={isDark ? '#60a5fa' : '#3b82f6'} />,
          title: 'Processing Payment',
          subtitle: 'Please wait while we verify your payment and generate your magic code...',
          showSpinner: true,
        };
      case 'success':
        return {
          icon: <CheckCircle size={48} color={isDark ? '#4ade80' : '#22c55e'} />,
          title: 'Payment Successful! 🎉',
          subtitle: magicCode 
            ? `Your magic code is: ${magicCode}\n\nPlease save this code - you'll need it to collect your printed documents!`
            : 'Payment completed successfully!',
          showSpinner: false,
        };
      case 'error':
        return {
          icon: <Clock size={48} color={isDark ? '#f87171' : '#ef4444'} />,
          title: 'Payment Processing Failed',
          subtitle: errorMessage || 'There was an error processing your payment. Please try again.',
          showSpinner: false,
        };
      default:
        return {
          icon: <Clock size={48} color={isDark ? '#60a5fa' : '#3b82f6'} />,
          title: 'Processing...',
          subtitle: 'Please wait...',
          showSpinner: true,
        };
    }
  };

  const content = getStageContent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl`}>
          {/* Icon */}
          <View className="items-center mb-6">
            <View className={`${isDark ? (stage === 'success' ? 'bg-green-900' : stage === 'error' ? 'bg-red-900' : 'bg-blue-900') : (stage === 'success' ? 'bg-green-100' : stage === 'error' ? 'bg-red-100' : 'bg-blue-100')} p-4 rounded-full mb-4`}>
              {content.icon}
            </View>
            
            {/* Spinner for processing state */}
            {content.showSpinner && (
              <View className="mb-4">
                <ActivityIndicator 
                  size="large" 
                  color={isDark ? '#60a5fa' : '#3b82f6'} 
                />
              </View>
            )}
            
            {/* Title */}
            <Text className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'} leading-6 mb-3`}>
              {content.title}
            </Text>
            
            {/* Subtitle */}
            <Text className={`text-sm text-center leading-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {content.subtitle}
            </Text>
          </View>

          {/* Magic Code Display (for success state) */}
          {stage === 'success' && magicCode && (
            <View className={`${isDark ? 'bg-green-900' : 'bg-green-100'} p-4 rounded-lg border-l-4 ${isDark ? 'border-green-400' : 'border-green-500'} mb-4`}>
              <Text className={`text-center font-mono text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-800'} tracking-wider`}>
                {magicCode}
              </Text>
            </View>
          )}

          {/* Processing Steps (for processing state) */}
          {stage === 'processing' && (
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'} mr-3`} />
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Payment received ✓
                </Text>
              </View>
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={isDark ? '#60a5fa' : '#3b82f6'} />
                <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} ml-2`}>
                  Verifying payment...
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mr-3`} />
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Generating magic code...
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mr-3`} />
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sending confirmation email...
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
