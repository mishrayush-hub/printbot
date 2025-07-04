import React from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
} from "react-native";

export default function TermsAndConditionsScreen() {
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
            Welcome to PrintBot! By using our document printing services and website, you
            agree to the following terms and conditions. Please read them carefully.
          </Text>

          {/* Section 1: Service Description */}
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            1. Service Description
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • PrintBot provides document printing services for PDF files uploaded through our platform
            {"\n"}• We offer various printing options including different paper sizes, quality settings, and quantities
            {"\n"}• All documents are printed in a secure environment and handled with confidentiality
          </Text>

          {/* Section 2: User Accounts */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            2. User Accounts and Registration
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • You must create an account to use our printing services
            {"\n"}• You are responsible for maintaining the security of your account credentials
            {"\n"}• You must provide accurate and current information during registration
            {"\n"}• You must be at least 18 years old to use our services
          </Text>

          {/* Section 3: Document Upload */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            3. Document Upload and Content
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • You may only upload documents that you own or have permission to print
            {"\n"}• Prohibited content includes illegal, copyrighted, offensive, or malicious materials
            {"\n"}• We reserve the right to refuse printing any document that violates these terms
            {"\n"}• Maximum file size and page limits apply as specified on our platform
          </Text>

          {/* Section 4: Payment */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            4. Payment and Pricing
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • Payment is required before printing begins
            {"\n"}• Prices are clearly displayed and may vary based on document specifications
            {"\n"}• All payments are processed securely through our payment gateway partners
            {"\n"}• You will receive a magic code upon successful payment for document collection
          </Text>

          {/* Section 5: Document Collection */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            5. Document Collection
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • Documents must be collected within 7 days of printing
            {"\n"}• You must present your magic code to collect printed documents
            {"\n"}• Uncollected documents may be disposed of after the collection period
            {"\n"}• Collection is available during our operating hours
          </Text>

          {/* Section 6: Privacy */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            6. Privacy and Data Security
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • We implement security measures to protect your documents and personal information
            {"\n"}• Uploaded documents are automatically deleted from our servers after collection
            {"\n"}• We do not access, read, or store the content of your documents
            {"\n"}• Please refer to our Privacy Policy for detailed information handling practices
          </Text>

          {/* Section 7: Quality */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            7. Quality and Accuracy
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • We strive to maintain high printing quality standards
            {"\n"}• Print quality depends on the quality of the uploaded document
            {"\n"}• We are not responsible for formatting issues present in the original document
            {"\n"}• Reprinting may be provided for quality issues caused by our equipment
          </Text>

          {/* Section 8: Refunds */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            8. Refunds and Cancellations
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • Refunds may be issued for technical issues preventing document printing
            {"\n"}• Cancellations are not allowed once printing has begun
            {"\n"}• Refund requests must be submitted within 24 hours of payment
            {"\n"}• Refunds will be processed to the original payment method within 5-7 business days
          </Text>

          {/* Section 9: Liability */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            9. Limitation of Liability
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            PrintBot's liability is limited to the amount paid for the specific printing service. We are not liable for indirect, consequential, or incidental damages.
          </Text>

          {/* Section 10: Service Availability */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            10. Service Availability
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • We strive to maintain 99% service uptime but cannot guarantee uninterrupted service
            {"\n"}• Scheduled maintenance will be announced in advance when possible
            {"\n"}• We reserve the right to modify or discontinue services with reasonable notice
          </Text>

          {/* Section 11: Intellectual Property */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            11. Intellectual Property
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            • You retain all rights to your uploaded documents
            {"\n"}• PrintBot's website, logo, and branding are protected by intellectual property laws
            {"\n"}• You may not reproduce or distribute our platform without permission
          </Text>

          {/* Section 12: Changes */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            12. Changes to Terms
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            We may update these terms and conditions periodically. Continued use of our services constitutes acceptance of any changes. We will notify users of significant changes via email or platform notifications.
          </Text>

          {/* Section 13: Contact */}
          <Text
            className={`text-lg font-bold mb-3 mt-6 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            13. Contact Information
          </Text>
          <Text
            className={`text-base mb-4 leading-6 text-justify ${
              isDark ? "text-gray-100" : "text-gray-600"
            }`}
          >
            For questions about these terms and conditions:
            {"\n"}📧 Email: support@printbot.cloud
            {"\n"}📞 Phone: +91 9999273367
            {"\n"}🏢 Address: C-336, Greater Noida, Uttar Pradesh, 201310, India
          </Text>

          {/* Acknowledgment */}
          <View className={`p-4 rounded-lg mb-8 ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
            <Text
              className={`text-base font-medium leading-6 text-justify ${
                isDark ? "text-blue-100" : "text-blue-800"
              }`}
            >
              By using PrintBot's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </Text>
          </View>

          <View className="h-10" />
        </View>
      </ScrollView>
    </View>
  );
}
