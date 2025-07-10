import React from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
} from "react-native";

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text
            className={`text-base mb-6 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            PrintBot ("we," "our," or "us") is a document printing service operated by
            MadhuSons Group. We are committed to protecting your privacy and ensuring the
            security of your personal information. This comprehensive Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you use our
            website (printbot.cloud), mobile application, and related services.
          </Text>

          {/* Section 1: Information We Collect */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            1. Information We Collect
          </Text>

          <Text
            className={`text-base font-semibold mb-2 ${
              isDark ? "text-gray-100" : "text-gray-700"
            }`}
          >
            1.1 Personal Information You Provide
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            We collect personal information that you voluntarily provide when you:
            {"\n"}• Create an account: Name, email address, phone number
            {"\n"}• Place orders: Billing information, delivery address, payment details
            {"\n"}• Upload documents: PDF files, images, and other printable documents
            {"\n"}• Contact support: Name, email, message content, inquiry type
            {"\n"}• Subscribe to communications: Email address for newsletters and updates
          </Text>

          <Text
            className={`text-base font-semibold mb-2 ${
              isDark ? "text-gray-100" : "text-gray-700"
            }`}
          >
            1.2 Mobile Application Permissions & Data
          </Text>

          <Text
            className={`text-base font-medium mb-2 ${
              isDark ? "text-blue-300" : "text-blue-600"
            }`}
          >
            📄 Storage/File Access Permission
          </Text>
          <Text
            className={`text-base mb-3 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Purpose: To access documents and photos you want to print
            {"\n"}What we access: Only files you explicitly select for printing
            {"\n"}What we don't access: We don't scan or access your entire device storage
            {"\n"}Data handling: Selected files are temporarily uploaded to our secure servers, processed for printing, and automatically deleted within 7 days
          </Text>

          <Text
            className={`text-base font-medium mb-2 ${
              isDark ? "text-blue-300" : "text-blue-600"
            }`}
          >
            📷 Camera Permission
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Purpose: To scan documents directly within the app
            {"\n"}When requested: Only when you choose the "Scan Document" feature
            {"\n"}What we access: Camera feed only during document scanning sessions
            {"\n"}What we don't access: We don't access your camera without explicit user action or record video
          </Text>

          {/* Section 2: How We Use Your Information */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            2. How We Use Your Information
          </Text>

          <Text
            className={`text-base font-semibold mb-2 ${
              isDark ? "text-gray-100" : "text-gray-700"
            }`}
          >
            2.1 Primary Service Purposes
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • Order processing: Process and fulfill your document printing requests
            {"\n"}• Account management: Create and maintain your user account
            {"\n"}• Payment processing: Process payments through our secure payment gateway
            {"\n"}• Order communication: Send order confirmations and status updates
            {"\n"}• Customer support: Respond to your inquiries and resolve issues
            {"\n"}• Service delivery: Coordinate document printing and pickup/delivery
          </Text>

          {/* Section 3: Payment Processing */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            3. Payment Processing & Financial Data
          </Text>

          <Text
            className={`text-base font-medium mb-2 ${
              isDark ? "text-green-300" : "text-green-600"
            }`}
          >
            🔒 Secure Payment Processing
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            We use Razorpay, a leading and trusted payment gateway in India, to process all transactions securely. We do not store or have access to your payment card details.
            {"\n\n"}All payment transactions are processed directly through PhonePe's PCI-DSS compliant infrastructure. We only store the transaction reference number, order amount, and payment status.
          </Text>

          {/* Section 4: Data Security */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            4. Data Security and Protection
          </Text>

          <Text
            className={`text-base font-medium mb-2 ${
              isDark ? "text-red-300" : "text-red-600"
            }`}
          >
            🔐 Encryption & Security
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • AES-256 encryption for data at rest
            {"\n"}• TLS 1.3 encryption for data in transit
            {"\n"}• End-to-end encryption for document uploads
            {"\n"}• Enterprise-grade firewalls and intrusion detection
            {"\n"}• 24/7 security monitoring and threat detection
          </Text>

          {/* Section 5: Data Retention */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            5. Data Retention and Deletion
          </Text>

          <Text
            className={`text-base font-medium mb-2 ${
              isDark ? "text-yellow-300" : "text-yellow-600"
            }`}
          >
            📄 Automatic Document Deletion
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            Your documents are automatically deleted from our servers to protect your privacy:
            {"\n"}• Documents are stored only during order processing (1-3 days)
            {"\n"}• Automatic deletion occurs 7 days after order completion
            {"\n"}• Failed orders are deleted immediately
            {"\n"}• Cancelled orders are deleted within 24 hours
          </Text>

          {/* Section 6: Your Rights */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            6. Your Privacy Rights and Choices
          </Text>

          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            You have significant control over your personal information:
            {"\n"}• Right to Access: Request a copy of all personal information we hold
            {"\n"}• Right to Rectification: Request correction of inaccurate information
            {"\n"}• Right to Erasure: Request deletion of your personal data
            {"\n"}• Right to Data Portability: Request your data in a portable format
            {"\n\n"}To exercise these rights, email us at support@printbot.cloud
          </Text>

          {/* Section 7: Contact Information */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            7. Contact Information
          </Text>

          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            For privacy-related inquiries:
            {"\n"}💼 Business Name: MadhuSons Group
            {"\n"}📧 Email: support@printbot.cloud
            {"\n"}📞 Phone: +91 9999273367
            {"\n"}🏢 Address: C-336, Greater Noida, Uttar Pradesh, 201310, India
            {"\n\n"}Response Time: We respond to privacy inquiries within 72 hours
          </Text>

          {/* Acknowledgment */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            8. Acknowledgment and Consent
          </Text>

          <Text
            className={`text-base mb-8 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            By using PrintBot's services, you acknowledge that you have read and understood this Privacy Policy in its entirety and agree to the collection, use, and disclosure of your information as described.
          </Text>

          <View className="h-10" />
        </View>
      </ScrollView>
    </View>
  );
}
