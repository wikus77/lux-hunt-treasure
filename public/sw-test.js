// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Standalone Service Worker for Static Pages Testing */

console.log('[SW-TEST] Service worker for static pages loaded');

self.addEventListener('install', () => {
    console.log('[SW-TEST] Service worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW-TEST] Service worker activating');
    event.waitUntil(self.clients.claim());
});

// Push notification handler
self.addEventListener('push', (event) => {
    let data = {};
    const notificationId = Math.random().toString(36).substring(2, 8);
    
    try { 
        data = event.data?.json() || {}; 
    } catch (e) {
        console.warn(`[SW-TEST:${notificationId}] Failed to parse push data:`, e);
    }
    
    const title = data.title || 'M1SSION™ Test';
    const body = data.body || 'Push notification received';
    const url = (data.data && data.data.url) || '/';
    
    const options = {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        data: { url, notificationId },
        requireInteraction: false,
        vibrate: [200, 100, 200],
        tag: `m1ssion-test-${Date.now()}`
    };
    
    console.log(`[SW-TEST:${notificationId}] Showing notification:`, title, options);
    
    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => {
                console.log(`[SW-TEST:${notificationId}] Notification displayed successfully`);
            })
            .catch(error => {
                console.error(`[SW-TEST:${notificationId}] Failed to show notification:`, error);
            })
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW-TEST] Notification clicked:', event.notification);
    event.notification.close();
    
    const url = (event.notification.data && event.notification.data.url) || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            // Try to focus existing window
            for (const client of list) {
                if (client.url.includes(url) && 'focus' in client) {
                    console.log('[SW-TEST] Focusing existing client');
                    return client.focus();
                }
            }
            // Open new window
            console.log('[SW-TEST] Opening new window for URL:', url);
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});