// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ


export async function enableWebPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push API non supportata');
  }

  // 1) Ensure SW registration (iOS PWA can race without controller)
  try {
    if (!navigator.serviceWorker.controller) {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  } catch {
    // Keep going, ready will still resolve if already registered
  }

  // 2) Permission
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Permesso notifiche negato');

  // 3) Ensure session/token ready (iOS PWA race-safe)
  const { supabase } = await import('@/integrations/supabase/client');
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    await new Promise<void>((resolve) => {
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        if (s) {
          sub.subscription?.unsubscribe();
          resolve();
        }
      });
      // Fallback timeout to avoid hanging forever
      setTimeout(() => {
        sub.subscription?.unsubscribe();
        resolve();
      }, 3000);
    });
    session = (await supabase.auth.getSession()).data.session;
  }
  const token = session?.access_token;
  if (!token) throw new Error('User non autenticato (JWT mancante)');

  // 4) Get active registration and subscription
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  
  if (sub) {
    // @ts-ignore - not all implementations expose options
    const curKey = (sub?.options as any)?.applicationServerKey as ArrayBuffer | undefined;

// Confronto sicuro tra applicationServerKey richiesta e quella della subscription esistente
function buffersEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) if (a[i] !== b[i]) return false;
  return true;
}
const sameKey = !!(applicationServerKey && curKey && buffersEqual(applicationServerKey, new Uint8Array(curKey)));
if (!sameKey) {
      try { await sub.unsubscribe(); } catch {}
      sub = null;
    }
  }

  let createdNew = false;
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
    });
    createdNew = true;
  }

  // 5) Invoke webpush-upsert with explicit Authorization header
  const raw = sub.toJSON();
  
  // Determine platform
  const platform = (navigator as any).userAgentData?.platform || 
                   navigator.platform || 
                   'web';
  
  // Helper to convert ArrayBuffer to base64url
  const arrayBufferToBase64Url = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  
  const body = {
    user_id: session!.user.id,
    provider: 'webpush',
    endpoint: raw.endpoint,
    keys: {
      p256dh: arrayBufferToBase64Url(sub.getKey('p256dh')),
      auth: arrayBufferToBase64Url(sub.getKey('auth'))
    },
    device_info: {
      ua: navigator.userAgent,
      platform
    }
  };

  const { data, error } = await supabase.functions.invoke('webpush-upsert', {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('[ENABLE-WEBPUSH] webpush-upsert response:', { data, error });
  
  if (error || (data && data.error)) {
    console.error('[ENABLE-WEBPUSH] webpush-upsert failed:', { error, data });
    if (createdNew) {
      try { await sub.unsubscribe(); } catch {}
    }
    const errMsg = error?.message || data?.error || 'Unknown error';
    throw new Error(`webpush-upsert failed: ${errMsg}`);
  }

  return sub;
}
