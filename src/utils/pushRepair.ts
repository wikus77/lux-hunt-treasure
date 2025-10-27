// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Guard-safe Push Repair utilities - now uses unified pipeline
import { runRepairFlow } from '@/lib/push/repairFlow';
import { functionsBaseUrl } from '@/lib/supabase/functionsBase';
import { supabase } from '@/integrations/supabase/client';

export type PushStatus = {
  supported: boolean;
  permission: NotificationPermission | null;
  hasSubscription: boolean;
  endpoint?: string | null;
};

export async function getPushStatus(): Promise<PushStatus> {
  const supported =
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  let hasSubscription = false;
  let endpoint: string | null = null;
  const permission: NotificationPermission | null = 'Notification' in window ? Notification.permission : null;

  if (supported) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      hasSubscription = !!sub;
      endpoint = sub?.endpoint ?? null;
    } catch {
      // ignora, mantieni default
    }
  }

  return { supported, permission, hasSubscription, endpoint };
}

/**
 * Prova a “riparare” la push:
 * - se esiste una subscription, la annulla
 * - poi richiama l'abilitazione unificata tramite il facade guardato
 */
export async function repairPush(): Promise<PushStatus> {
  const status = await getPushStatus();

  if (!status.supported) {
    return status;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
    }
  } catch {
    // anche se fallisce l'unsubscribe, proviamo a ripartire
  }

  // Use unified repair flow (includes cleanup + subscribe + upsert)
  const result = await runRepairFlow();

  return {
    supported: true,
    permission: Notification.permission,
    hasSubscription: result.ok && !!result.subscription,
    endpoint: result.endpoint ?? null
  };
}

/**
 * Invia un self-test al backend (se configurato).
 * Usa functionsBaseUrl e, se disponibile, include un bearer token Supabase.
 */
export async function sendSelfTest(payload: Record<string, any> = {}) {
  const url = `${functionsBaseUrl}/webpush-send`;
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };

  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // nessun token disponibile: il backend potrebbe comunque accettare anon se configurato
  }

  const body = {
    kind: 'self-test',
    timestamp: new Date().toISOString(),
    ...payload,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const ok = res.ok;
  let info: any = null;
  try { info = await res.json(); } catch { /* best effort */ }

  return { ok, status: res.status, info };
}
