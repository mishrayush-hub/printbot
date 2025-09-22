# 🖨️ PrintBot - A Fast, Smart Printing Solution

Welcome to PrintBot, your one-stop digital printing solution. With the PrintBot app, you can upload your documents, pay online, and get a unique OTP to retrieve your printouts directly from a PrintBot vending machine. No waiting, no queues—just smart printing on the go!

## 🚀 Key Features

- 📤 **Instant File Upload** (PDF/JPEG)
- 💸 **Automatic Price Calculation** 
- 🔐 **Unique OTP Generation** for secure print pickup
- 🧾 **Order Summary and Checkout**
- 🤝 Seamless integration with **PrintBot vending machines**
- 🌐 Web version available at [www.printbot.navstream.in](https://www.printbot.navstream.in)

## 📱 Built With

- **React Native + Expo** – for cross-platform mobile development
- **Tailwind CSS (via NativeWind)** – for consistent, responsive UI
- **Expo Router** – for file-based routing in the app

## Biometric Login (Face ID / Fingerprint)

This app supports biometric login using Expo Local Authentication. Install the dependency and rebuild the native app to enable this feature:

```
expo install expo-local-authentication
```

The app also uses secure credential storage so biometrics can re-run login when no valid token exists. Install Secure Store with:

```
expo install expo-secure-store
```

Note: Biometrics require a real device or an emulator with biometric support.

🔐 OTP Printing Flow
Upload file via mobile app.

Pay based on file type and page count.

Receive a 6-digit OTP.

Enter OTP on a PrintBot vending machine.

🎉 Collect your print!

✨ Future Enhancements
Payment gateway integration (UPI, cards, etc.)

User profile and print history

Admin dashboard for managing orders and machines

NFC/QR support for print retrieval

🙌 Made With ❤️ by Navstream Innovations LLP
Visit us at www.navstream.in
Product Page: www.printbot.navstream.in

