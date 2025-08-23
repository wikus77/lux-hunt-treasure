// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ — FCM SW compat + fallback
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({ messagingSenderId: '21417361168' });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const n = payload?.notification || {};
    const d = payload?.data || {};
    const title = n.title || d.title || 'M1SSION™';
    const body = n.body || d.body || '';
    const icon = n.icon || d.icon || '/icon-192x192.png';
    const badge = n.badge || d.badge || '/icon-192x192.png';
    const data = d;
    return self.registration.showNotification(title, { body, icon, badge, data });
  });
  console.log('✅ FCM SW ready');
} catch (e) {
  console.error('❌ FCM SW error:', e);
}

// Fallback push event handler
self.addEventListener('push', (event) => {
  try {
    const payload = event.data ? event.data.json() : {};
    const n = payload.notification || {};
    const d = payload.data || {};
    const title = n.title || d.title || 'M1SSION™';
    const body = n.body || d.body || '';
    const icon = n.icon || d.icon || '/icon-192x192.png';
    const badge = n.badge || d.badge || '/icon-192x192.png';
    const data = d;
    event.waitUntil(self.registration.showNotification(title, { body, icon, badge, data }));
  } catch (_) {
    event.waitUntil(self.registration.showNotification('M1SSION™', { body: '' }));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification?.data?.click_action) || 'https://m1ssion.eu';
  event.waitUntil((async () => {
    const list = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (list.length) return list[0].focus();
    return clients.openWindow(url);
  })());
});
