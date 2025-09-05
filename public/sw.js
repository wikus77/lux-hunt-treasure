// M1SSION™ Service Worker - Unified & Minimal
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// ATTENZIONE: file unico. Niente importScripts, niente Workbox.

self.addEventListener('install', () => { /* no-op */ });

self.addEventListener('activate', (e) => {
  // Prendi controllo senza distruggere storage
  if (self.clients && self.clients.claim) e.waitUntil(self.clients.claim());
});

// Update controllato dal main thread
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING' && self.skipWaiting) {
    self.skipWaiting();
  }
});

// Push "tick" (no payload) compatibile con Safari/APNs
self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {}
  const title = data.title || 'M1SSION™';
  const body  = data.body  || 'Hai un nuovo aggiornamento';
  const screen = (data.data && data.data.screen) || '/';
  e.waitUntil(self.registration.showNotification(title, {
    body, data: { screen }, badge: '/favicon.ico', icon: '/favicon.ico'
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.screen) || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    for (const c of clients) { if ('focus' in c) { c.navigate(url); return c.focus(); } }
    return self.clients.openWindow ? self.clients.openWindow(url) : Promise.resolve();
  }));
});