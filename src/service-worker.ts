// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™  
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🔔 M1SSION', {
      body: data.body || 'Hai una nuova notifica.',
      icon: '/icon-192.png',
      badge: '/icon-72.png'
    })
  );
});
