addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // ---- firebase-messaging-sw.js (compat v8) ----
  if (url.pathname === '/firebase-messaging-sw.js') {
    const sw = `/* M1SSION SW (compat v8) */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  try {
    const n = (payload && payload.notification) || {};
    const d = (payload && payload.data) || {};
    const title = n.title || d.title || 'M1SSION';
    const body  = n.body  || d.body  || '';
    const link  = (payload && payload.fcmOptions && payload.fcmOptions.link) || d.link || 'https://m1ssion.eu/';
    const options = { body, icon: '/icons/icon-192.png', badge: '/icons/badge-72.png', data: { link } };
    return self.registration.showNotification(title, options);
  } catch (e) {}
});

self.addEventListener('notificationclick', function(event) {
  const url = (event.notification && event.notification.data && event.notification.data.link) || 'https://m1ssion.eu/';
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if (c.url === url && 'focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});`;
    return new Response(sw, {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'origin-when-cross-origin'
      }
    });
  }

  // ---- firebase-init.js (IIFE + self.__FIREBASE_CFG__) ----
  if (url.pathname === '/firebase-init.js') {
    const js = `/* M1SSION™ AG-X0197 */
(function(){ try {
  var config = {
    apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
    authDomain: "m1ssion-app.firebaseapp.com",
    projectId: "m1ssion-app",
    storageBucket: "m1ssion-app.firebasestorage.app",
    messagingSenderId: "21417361168",
    appId: "1:21417361168:web:58841299455ee4bcc7af95",
    vapidKey: "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o"
  };
  self.__FIREBASE_CFG__ = config;
  console.log('[M1SSION FCM] Config initialized for project:', config.projectId);
} catch(e) {
  console.error('[M1SSION FCM] Config init error:', e);
  self.__FIREBASE_CFG__ = null;
}})();`;
    return new Response(js, {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-store, must-revalidate',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'origin-when-cross-origin'
      }
    });
  }

  // ---- badge PNG (content-type corretto) ----
  if (url.pathname === '/icons/badge-72.png') {
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAp0wQy0AAAAASUVORK5CYII=";
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return new Response(bin, {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'no-store, must-revalidate',
        'x-content-type-options': 'nosniff'
      }
    });
  }

  return fetch(request);
}