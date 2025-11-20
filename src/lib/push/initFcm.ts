// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { SUPABASE_CONFIG } from '@/lib/supabase/config';

export async function initFcmAndGetToken(): Promise<string | null> {
  // 1) config centralizzata da Supabase (pubblica)
  const cfg = await fetch(`${SUPABASE_CONFIG.functionsUrl}/fcm-config`, { cache: "no-store" }).then(r => r.json());

  // 2) SDK compat - use dynamic imports with @ts-ignore
  // @ts-ignore
  await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
  // @ts-ignore
  await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
  
  // @ts-ignore - Use global firebase object
  if (!window.firebase) {
    console.error('Firebase compat SDK not loaded');
    return null;
  }
  
  // Check messaging support
  // @ts-ignore
  if (!firebase.messaging.isSupported()) return null;

  // 3) assicura SW (should be /firebase-messaging-sw.js for m1ssion.eu)
  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;

  // 4) permessi
  if (Notification.permission !== "granted") {
    const p = await Notification.requestPermission();
    if (p !== "granted") return null;
  }

  // 5) init + token using compat SDK
  // @ts-ignore
  const app = firebase.initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    storageBucket: cfg.storageBucket,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId,
  });
  
  // @ts-ignore
  const messaging = firebase.messaging();
  // @ts-ignore
  const token = await messaging.getToken({ 
    vapidKey: cfg.vapidPublicKey, 
    serviceWorkerRegistration: reg 
  });
  
  return token ?? null;
}