import { supabase } from "./supabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

// Push subscription keys arrive base64url-encoded; the browser's
// PushManager API wants a raw Uint8Array.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

// Registers the service worker, asks for notification permission, and
// saves the resulting push subscription so the send-push Edge Function
// can reach this device later. Safe to call every session — re-saving
// the same endpoint just upserts.
export async function enablePushNotifications(
  userId: string
): Promise<{ error: string | null }> {
  if (!isPushSupported()) {
    return { error: "Push notifications aren't supported on this browser." };
  }
  if (!VAPID_PUBLIC_KEY) {
    return { error: "Push notifications aren't configured yet." };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { error: "Notification permission was not granted." };
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    const json = subscription.toJSON();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      },
      { onConflict: "endpoint" }
    );

    return { error: error?.message ?? null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not enable push notifications.",
    };
  }
}
