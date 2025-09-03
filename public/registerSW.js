// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Service Worker Registration for M1SSION PWA */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('[SW] Registration successful:', registration.scope);
      
      // Check for SW updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New content available, refresh to update');
            }
          });
        }
      });
    })
    .catch((error) => {
      console.log('[SW] Registration failed:', error);
    });

  // Listen for SW messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
  });
}