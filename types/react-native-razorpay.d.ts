declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency?: string;
    name: string;
    description?: string;
    image?: string;
    order_id?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    handler?: (response: RazorpayResponse) => void;
    modal?: {
      ondismiss?: () => void;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  interface RazorpayError {
    code: number;
    description: string;
    source: string;
    step: string;
    reason: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}
