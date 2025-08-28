/* M1SSION FCM SW (compat v8) */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// stessa config di /firebase-init.js
firebase.initializeApp({
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(async (payload) => {
  const title = (payload.notification && payload.notification.title) || payload.data?.title || 'M1SSION';
  const body  = (payload.notification && payload.notification.body)  || payload.data?.body  || '';
  const options = {
    body, icon: '/icons/icon-192.png', badge: '/icons/badge-72.png',
    data: payload.data || {}
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.link) || 'https://m1ssion.eu/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const client = list.find(c => c.url.startsWith(url));
    return client ? client.focus() : clients.openWindow(url);
  }));
});