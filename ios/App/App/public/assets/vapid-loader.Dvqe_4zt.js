let cached = null;
async function loadVAPIDPublicKey() {
  if (cached) return cached;
  try {
    const res = await fetch("/vapid-public.txt", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cached = (await res.text()).trim();
    return cached;
  } catch {
    const fb = "BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q";
    cached = fb.trim();
    return cached;
  }
}
function urlBase64ToUint8Array(base64url) {
  const padding = "=".repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; ++i) {
    out[i] = raw.charCodeAt(i);
  }
  if (out.length !== 65 || out[0] !== 4) {
    throw new TypeError(`Invalid VAPID key: length=${out.length}, first=0x${out[0]?.toString(16)}`);
  }
  return out;
}

export { loadVAPIDPublicKey, urlBase64ToUint8Array };
