// Helper function to convert base64url to Uint8Array
const b64uToU8 = (str) => {
  const padding = '==='.slice(0, (4 - str.length % 4) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
};

// Helper function to convert Uint8Array to base64url
const u8ToB64u = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Main subscription function
export async function subscribeAndSave(vapidPublic, supabaseUserIdOrNull) {
  // Get service worker registration
  const reg = await navigator.serviceWorker.ready;
  
  // Check permission
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission denied');
    }
  }
  
  // Unsubscribe existing subscription if any
  const oldSub = await reg.pushManager.getSubscription().catch(() => null);
  if (oldSub) await oldSub.unsubscribe().catch(() => {});
  
  // Create new subscription
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64uToU8(vapidPublic)
  });
  
  // Prepare data for server
  const body = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: u8ToB64u(sub.getKey('p256dh')),
      auth: u8ToB64u(sub.getKey('auth'))
    },
    ua: navigator.userAgent,
    user_id: supabaseUserIdOrNull ?? null
  };
  
  // Send to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return body;
}

// Test notification function
export async function sendTestToThisDevice(payload = { title: 'M1SSION™', body: 'Test', link: 'https://m1ssion.eu/' }) {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  
  if (!sub) {
    throw new Error('No active push subscription found');
  }
  
  const body = {
    endpoint: sub.endpoint,
    p256dh: u8ToB64u(sub.getKey('p256dh')),
    auth: u8ToB64u(sub.getKey('auth')),
    payload
  };
  
  const res = await fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return res.json();
}