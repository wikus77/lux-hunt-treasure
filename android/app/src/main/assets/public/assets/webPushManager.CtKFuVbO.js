import { _ as __vitePreload } from './index.CUdqZWfi.js';

async function loadKeyAndConverter() {
  const mod = await __vitePreload(() => import('./vapid-loader.Dvqe_4zt.js'),true?[]:void 0);
  return {
    loadPublicKey: mod.loadVAPIDPublicKey,
    toUint8: mod.urlBase64ToUint8Array
  };
}
function looksLikeWebPushEndpoint(url) {
  try {
    const u = new URL(url);
    return u.protocol.startsWith("http") && (u.hostname.includes("fcm") || u.pathname.toLowerCase().includes("push") || u.pathname.toLowerCase().includes("send"));
  } catch {
    return false;
  }
}
function getNotificationStatus() {
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const permission = "Notification" in window ? Notification.permission : null;
  return { supported, permission };
}
function isPushSupported() {
  return getNotificationStatus().supported;
}
async function hasActiveSubscription() {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
async function subscribeWebPushAndSave(reg) {
  const { loadPublicKey, toUint8 } = await loadKeyAndConverter();
  const publicKey = await loadPublicKey();
  const keyBytes = typeof publicKey === "string" ? toUint8(publicKey) : publicKey;
  const applicationServerKey = keyBytes;
  if (!reg?.pushManager) throw new Error("PushManager non disponibile");
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
  }
  const raw = sub.toJSON();
  if (!raw?.endpoint || !raw?.keys?.p256dh || !raw?.keys?.auth) {
    throw new Error("Subscription incompleta");
  }
  return {
    endpoint: raw.endpoint,
    keys: { p256dh: raw.keys.p256dh, auth: raw.keys.auth },
    vapidKey: typeof publicKey === "string" ? publicKey : void 0
  };
}
async function enableWebPush() {
  if (!isPushSupported()) throw new Error("Push non supportato su questo browser");
  const reg = await navigator.serviceWorker.ready;
  return subscribeWebPushAndSave(reg);
}
async function disableWebPush() {
  if (!isPushSupported()) return true;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  return true;
}
async function getCurrent() {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}
async function getStatus() {
  const { supported, permission } = getNotificationStatus();
  const sub = await getCurrent();
  return { supported, permission: permission ?? "default", enabled: !!sub, endpoint: sub?.endpoint };
}
async function enable() {
  await enableWebPush();
}
async function disable() {
  await disableWebPush();
}
async function subscribe(_userId) {
  const reg = await navigator.serviceWorker.ready;
  await subscribeWebPushAndSave(reg);
  const cur = await reg.pushManager.getSubscription();
  if (!cur) throw new Error("Subscription failed");
  return cur;
}
async function unsubscribe() {
  return disableWebPush();
}
function isSupported() {
  return isPushSupported();
}
const webPushManager = {
  isPushSupported,
  hasActiveSubscription,
  enableWebPush,
  disableWebPush,
  getNotificationStatus,
  looksLikeWebPushEndpoint,
  subscribeWebPushAndSave,
  // alias compat:
  getCurrent,
  getStatus,
  enable,
  disable,
  subscribe,
  unsubscribe,
  isSupported
};
function isWebPushSupported() {
  return isPushSupported();
}
function isPWAMode() {
  return window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
}

export { isPWAMode as a, enable as e, isWebPushSupported as i, subscribeWebPushAndSave as s, webPushManager as w };
