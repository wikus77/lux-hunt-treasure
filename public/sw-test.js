// Service Worker per test push notifications
console.log('🔧 SW-TEST: Service Worker loaded');

self.addEventListener('push', function(event) {
  console.log('🔔 SW-TEST: Push received', event);
  
  let notificationData = {
    title: '🚀 M1SSION™ Test',
    body: 'Test notification received!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('🔔 SW-TEST: Payload received', payload);
      notificationData = { ...notificationData, ...payload };
    } catch (e) {
      console.log('🔔 SW-TEST: Text payload', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('🔔 SW-TEST: Notification clicked', event);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});