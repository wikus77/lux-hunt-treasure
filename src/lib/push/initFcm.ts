// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
export async function initFcmAndGetToken(): Promise<string | null> {
  // 1) config centralizzata da Supabase (pubblica)
  const cfg = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/fcm-config", { cache: "no-store" }).then(r => r.json());

  // 2) SDK modular - use dynamic imports with @ts-ignore
  // @ts-ignore
  const firebaseApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
  // @ts-ignore
  const firebaseMessaging = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js");
  
  // @ts-ignore - Skip TypeScript checks for Firebase CDN imports
  const { initializeApp } = firebaseApp;
  // @ts-ignore - Skip TypeScript checks for Firebase CDN imports  
  const { getMessaging, getToken, isSupported } = firebaseMessaging;
  
  if (!(await isSupported())) return null;

  // 3) assicura SW
  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;

  // 4) permessi
  if (Notification.permission !== "granted") {
    const p = await Notification.requestPermission();
    if (p !== "granted") return null;
  }

  // 5) init + token
  const app = initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    storageBucket: cfg.storageBucket,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId,
  });
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey: cfg.vapidPublicKey, serviceWorkerRegistration: reg });
  return token ?? null;
}