// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export function urlBase64ToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);

  // VAPID per PushManager deve essere 65 byte e iniziare con 0x04
  if (out.length !== 65 || out[0] !== 0x04) {
    throw new TypeError(\`Invalid VAPID key: length=\${out.length}, first=0x\${out[0]?.toString(16)}\`);
  }
  return out;
}
