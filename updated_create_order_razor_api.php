<?php
require __DIR__ . '/../../vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database credentials
$servername = "localhost";
$username = "u605263236_printbot";
$password = "Printbot@2024";
$dbname = "u605263236_masterDB";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . mysqli_connect_error()
    ]);
    exit;
}

// Get user details from POST data
$user_id = $_POST['userId'] ?? null;
$user_name = $_POST['userName'] ?? null;
$user_email = $_POST['userEmail'] ?? null;
$user_mobile = $_POST['userMobile'] ?? null;

// Validate required user fields
if (empty($user_id) || empty($user_name) || empty($user_email) || empty($user_mobile)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required user fields: userId, userName, userEmail, userMobile'
    ]);
    exit;
}

// Set transaction details
$order_id = uniqid();
$amount = $_POST['amount']; // Amount in INR
// Get branding details from mobile app (with fallbacks)
$description = $_POST['description'] ?? 'PrintBot Payment';
$app_logo = $_POST['appLogo'] ?? 'https://printbot.cloud/assets/logo.png';
$file_id = $_POST['fileId'];
$file_name = $_POST['fileName'];

// Validate required fields
if (empty($amount) || empty($file_id) || empty($file_name)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: amount, fileId, fileName'
    ]);
    exit;
}

// Initialize Razorpay with your key and secret
$api_key = 'rzp_test_3jWZKXuZq5uLMv'; // Replace with your actual key
$api_secret = 'h2XnF9psiNfQyqczety7rIS5'; // Replace with your actual secret

$api = new Razorpay\Api\Api($api_key, $api_secret);

try {
    // Create an order
    $order = $api->order->create([
        'amount' => $amount * 100, // Convert to paise
        'currency' => 'INR',
        'receipt' => $order_id,
        'payment_capture' => 1 // Auto-capture payment
    ]);
    
    // Get the order ID
    $razorpay_order_id = $order->id;
    
    // Prepare callback URL with parameters
    $callback_url = 'https://printbot.cloud/api/v1/callback_razor_api.php?userId=' . urlencode($user_id) . 
                   '&orderId=' . urlencode($order_id) . 
                   '&fileId=' . urlencode($file_id) . 
                   '&fileName=' . urlencode($file_name);
    
    // Prepare payment options for frontend (using mobile app branding)
    $paymentOptions = [
        'key' => $api_key,
        'amount' => $order->amount,
        'currency' => $order->currency,
        'name' => "PrintBot",
        'description' => $description, // Use description from mobile app
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
        // 'callback_url' => $callback_url,
        // 'redirect' => true
    ];
    
    echo json_encode([
        'success' => true,
        'message' => 'RazorPay order created successfully',
        'data' => [
            'paymentOptions' => $paymentOptions,
            'orderId' => $order_id,
            'razorpayOrderId' => $razorpay_order_id,
            'amount' => $amount,
            'code' => 'ORDER_CREATED'
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'RazorPay order creation failed: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
