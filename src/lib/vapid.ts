// Shim compat: usa SOLO il loader canonico
export { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';

// Blocco uso di costanti legacy: se qualcuno le importa a runtime, è undefined.
// (compile ok, ma impedisce hardcode)
export const VAPID_PUBLIC_KEY: never = undefined as never;
