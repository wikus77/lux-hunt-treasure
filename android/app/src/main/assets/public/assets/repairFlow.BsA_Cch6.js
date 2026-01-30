import { _ as __vitePreload, s as supabase } from './index.CUdqZWfi.js';

async function ensureServiceWorkerReady() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker non supportato");
  }
  const regs = await navigator.serviceWorker.getRegistrations();
  const hasMain = regs.some((r) => r.active?.scriptURL.includes("/sw.js"));
  if (!hasMain) {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }
  return navigator.serviceWorker.ready;
}
async function ensurePermissionGranted() {
  if (!("Notification" in window)) {
    throw new Error("Notification API non supportata");
  }
  if (Notification.permission === "denied") {
    return false;
  }
  if (Notification.permission === "default") {
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }
  return true;
}
async function ensurePushSubscription(reg) {
  const current = await reg.pushManager.getSubscription();
  if (current) {
    return current;
  }
  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await __vitePreload(async () => { const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('./vapid-loader.Dvqe_4zt.js');return { loadVAPIDPublicKey, urlBase64ToUint8Array }},true?[]:void 0);
  const vapidKey = await loadVAPIDPublicKey();
  const applicationServerKey = typeof vapidKey === "string" ? urlBase64ToUint8Array(vapidKey) : vapidKey;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });
  return sub;
}
async function upsertBackend(sub) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Sessione scaduta: effettua il login");
  }
  const json = sub.toJSON();
  const keys = json?.keys || {};
  if (!keys.p256dh || !keys.auth) {
    throw new Error("Chiavi subscription mancanti");
  }
  const { detectPlatformSafe } = await __vitePreload(async () => { const { detectPlatformSafe } = await import('./pushPlatform.BoRsb-VW.js');return { detectPlatformSafe }},true?[]:void 0);
  const platform = detectPlatformSafe();
  const { error } = await supabase.functions.invoke("webpush-upsert", {
    body: {
      endpoint: sub.endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      provider: "webpush",
      platform,
      ua: navigator.userAgent
    }
  });
  if (error) {
    throw new Error(error.message || "Upsert fallito");
  }
}
async function subscribeFlow() {
  const t0 = performance.now();
  try {
    const reg = await ensureServiceWorkerReady();
    const hasPermission = await ensurePermissionGranted();
    if (!hasPermission) {
      return {
        ok: false,
        status: "permission_denied",
        message: "Permesso notifiche negato"
      };
    }
    const sub = await ensurePushSubscription(reg);
    await upsertBackend(sub);
    const elapsed = Math.round(performance.now() - t0);
    return {
      ok: true,
      status: "ready",
      endpoint: sub.endpoint,
      message: `Ready in ${elapsed}ms`
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - t0);
    return {
      ok: false,
      status: "error",
      error: error?.message || "Errore sconosciuto",
      message: `Failed after ${elapsed}ms`
    };
  }
}

async function runRepairFlow() {
  const t0 = performance.now();
  try {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          await existingSub.unsubscribe();
        }
      } catch (cleanupError) {
      }
    }
    const result = await subscribeFlow();
    const elapsed = Math.round(performance.now() - t0);
    if (result.ok) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return {
        ok: true,
        subscription: sub,
        endpoint: result.endpoint,
        message: `Repair completed in ${elapsed}ms`
      };
    } else {
      return {
        ok: false,
        subscription: null,
        error: result.error || "Repair failed",
        message: `Failed after ${elapsed}ms`
      };
    }
  } catch (error) {
    const elapsed = Math.round(performance.now() - t0);
    return {
      ok: false,
      subscription: null,
      error: error?.message || "Unknown error",
      message: `Error after ${elapsed}ms`
    };
  }
}

export { runRepairFlow as r, subscribeFlow as s };
