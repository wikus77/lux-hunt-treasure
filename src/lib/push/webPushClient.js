// Client function for subscribing to push notifications
export async function subscribeAndSendToServer(vapidPublic) {
  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported');
    }
    
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
    
    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    
    // Subscribe to push manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublic
    });
    
    // Extract subscription details
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64Url(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64Url(subscription.getKey('auth'))
      },
      ua: navigator.userAgent,
      userId: getCurrentUserId() // You'll need to implement this based on your auth system
    };
    
    // Send subscription to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to subscribe');
    }
    
    const result = await response.json();
    console.log('Push subscription successful:', result);
    
    return {
      success: true,
      subscription: subscriptionData
    };
    
  } catch (error) {
    console.error('Push subscription failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper function to get current user ID - implement based on your auth system
function getCurrentUserId() {
  // Example implementation - replace with your actual auth logic
  try {
    const user = JSON.parse(localStorage.getItem('supabase.auth.token'));
    return user?.user?.id || null;
  } catch {
    return null;
  }
}

// Function to test sending a notification (for testing purposes)
export async function sendTestNotification(endpoint, p256dh, auth, payload) {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth,
        payload: payload || {
          title: 'M1SSION™ Test',
          body: 'Test notification from client',
          link: 'https://m1ssion.eu/'
        }
      })
    });
    
    const result = await response.json();
    console.log('Test notification result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Test notification failed:', error);
    return { ok: false, error: error.message };
  }
}