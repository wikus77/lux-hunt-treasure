/* M1SSION SW - no auto skipWaiting */
/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED */

self.addEventListener('install', ()=>{});
self.addEventListener('activate', ()=>{ self.clients?.claim?.(); });

self.addEventListener('message', (e)=>{
  if (e?.data?.type === 'SKIP_WAITING') self.skipWaiting?.();
});

self.addEventListener('push', (e)=>{
  let data = {};
  try { data = e.data?.json?.() ?? {}; } catch {}
  const title = data.title || 'M1SSION™';
  const body  = data.body  || 'Hai un nuovo aggiornamento';
  const opts  = { body, data: data.data || {}, icon: '/favicon.ico', badge: '/favicon.ico' };
  e.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', (e)=>{
  e.notification.close();
  const url = e.notification?.data?.screen || '/';
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(list=>{
    for (const c of list) { if ('focus' in c) { c.navigate?.(url); return c.focus(); } }
    return self.clients.openWindow?.(url);
  }));
});