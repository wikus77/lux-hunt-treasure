import { functionsBaseUrl } from '@/lib/supabase/functionsBase';
import { getProjectRef, functionsBaseUrl } from '@/lib/supabase/functionsBase';

// © 2025 Joseph MULÉ – M1SSION™ – Push Center API Helpers

const SUPABASE_URL = `https://${getProjectRef()}.supabase.co`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export interface PushSendRequest {
  audience?: 'all' | { user_id: string } | { endpoint: string };
  payload: {
    title: string;
    body: string;
    url?: string;
    image?: string;
  };
}

export interface PushSendResponse {
  success?: boolean;
  mode?: string;
  total?: number;
  sent?: number;
  failed?: number;
  message?: string;
  error?: string;
  details?: string;
}

export async function sendPushNotification(
  request: PushSendRequest,
  options: {
    adminToken?: string;
    userJWT?: string;
  }
): Promise<{ status: number; data: PushSendResponse; responseTime: number }> {
  const startTime = performance.now();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };

  if (options.adminToken) {
    headers['x-admin-token'] = options.adminToken;
  } else if (options.userJWT) {
    headers['Authorization'] = `Bearer ${options.userJWT}`;
  }

  const response = await fetch(`${functionsBaseUrl}/webpush-send`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  const data = await response.json();
  const responseTime = Math.round(performance.now() - startTime);

  return {
    status: response.status,
    data,
    responseTime,
  };
}

export async function upsertWebPushSubscription(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    platform?: string;
    ua?: string;
  },
  userJWT: string
): Promise<{ status: number; data: any; error?: string }> {
  const response = await fetch(`${functionsBaseUrl}/webpush-upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userJWT}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(subscription),
  });

  const data = await response.json();

  return {
    status: response.status,
    data,
    error: data.error || data.reason,
  };
}

export async function fetchWebPushSubscriptions(
  serviceRoleKey: string,
  limit: number = 50
): Promise<any[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/webpush_subscriptions?select=id,user_id,endpoint,is_active,created_at,last_used_at&order=created_at.desc&limit=${limit}`,
    {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
  }

  return response.json();
}

export function getSuggestion(error?: string, status?: number): string {
  if (!error && status === 200) return '✅ Success!';
  
  if (status === 401) {
    if (error?.includes('invalid_admin_token')) {
      return '⚠️ Token admin errato. Verifica PUSH_ADMIN_TOKEN.';
    }
    if (error?.includes('missing_authorization')) {
      return '⚠️ Authorization header mancante. Esegui il login o usa admin token.';
    }
    if (error?.includes('missing') || error?.includes('invalid_jwt')) {
      return '⚠️ JWT mancante o non valido. Esegui il login per ottenere un token valido.';
    }
    return '⚠️ Non autorizzato. Verifica le credenziali.';
  }

  if (status === 400) {
    if (error?.includes('endpoint')) {
      return '⚠️ Endpoint mancante o non valido. Verifica il formato.';
    }
    if (error?.includes('keys') || error?.includes('p256dh') || error?.includes('auth')) {
      return '⚠️ Chiavi push mancanti (p256dh/auth). Riesegui la subscription.';
    }
    return '⚠️ Richiesta non valida. Controlla i parametri.';
  }

  if (status === 500) {
    if (error?.includes('PUSH_ADMIN_TOKEN')) {
      return '⚠️ Configura PUSH_ADMIN_TOKEN nei secrets di Supabase.';
    }
    if (error?.includes('VAPID')) {
      return '⚠️ VAPID keys non configurate. Verifica VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT.';
    }
    return '⚠️ Errore interno del server. Controlla i logs delle Edge Functions.';
  }

  if (error?.includes('No active subscriptions')) {
    return '⚠️ Nessuna subscription attiva trovata. Esegui (Re)Subscribe prima di inviare.';
  }

  return error || 'Errore sconosciuto';
}
