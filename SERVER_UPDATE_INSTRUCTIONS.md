# Update Required for create_order_razor_api.php

## Mobile App Changes
The mobile app now sends two additional parameters:
- `appLogo`: "https://printbot.cloud/assets/images/icon.png"
- `description`: "PrintBot - Instant Document Printing"

## Server-Side Update Needed

In your `create_order_razor_api.php` file, update the code as follows:

### 1. Extract the new parameters (add after existing parameter extraction):

```php
// Get app branding from mobile app
$app_logo = $_POST['appLogo'] ?? 'https://printbot.cloud/logo.png'; // fallback to existing logo
$payment_description = $_POST['description'] ?? 'Payment for PrintBot'; // fallback description
```

### 2. Update the payment options array:

Replace the existing `$paymentOptions` array with:

```php
// Prepare payment options for frontend
$paymentOptions = [
    'key' => $api_key,
    'amount' => $order->amount,
    'currency' => $order->currency,
    'name' => "PrintBot",
    'description' => $payment_description, // Use description from mobile app
    'image' => $app_logo, // Use logo URL from mobile app
    'order_id' => $razorpay_order_id,
    'prefill' => [
        'name' => $user_name,
        'email' => $user_email,
        'contact' => $user_mobile
    ],
    'theme' => [
        'color' => "#3399cc" // Your brand color
    ],
];
```

## What This Does
- The PrintBot logo will appear in the Razorpay checkout interface
- The description "PrintBot - Instant Document Printing" will be shown to users
- Provides better branding and user experience during payment

## Logo Requirements
- Make sure the logo URL is accessible from the internet
- Recommended image size: 256x256 pixels
- Supported formats: PNG, JPG
- The logo should be square for best appearance in Razorpay checkout

## Testing
After making these server changes:
1. Initiate a payment from the mobile app
2. Verify the PrintBot logo appears in the Razorpay checkout
3. Check that the description shows correctly
