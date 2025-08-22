// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ — FCM SW (minimal)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({ messagingSenderId: '21417361168' });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? 'M1SSION™';
    const options = {
      body: payload.notification?.body ?? '',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: payload.data || {}
    };
    return self.registration.showNotification(title, options);
  });
  console.log('✅ FCM SW ready');
} catch (e) {
  console.error('❌ FCM SW error:', e);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.click_action || '/';
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (clientsList.length) return clientsList[0].focus();
    return clients.openWindow(url);
  })());
});
