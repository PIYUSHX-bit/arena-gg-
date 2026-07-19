// Loads Razorpay's Checkout script once and exposes a typed helper to open it.
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "handler"> & {
    onSuccess: (response: RazorpaySuccessResponse) => void;
    onDismiss?: () => void;
  }
): Promise<void> {
  await loadRazorpayScript();

  const { onSuccess, onDismiss, ...rest } = options;

  const rzp = new window.Razorpay({
    ...rest,
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  });

  rzp.open();
}
