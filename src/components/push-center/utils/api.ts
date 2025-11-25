// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Push Center API Helpers - UNIFIED LOGIC (aligned with SendTab pipeline)

import { getProjectRef, functionsBaseUrl } from '@/lib/supabase/functionsBase';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/clientUtils';

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();

export interface PushSendRequest {
  audience?: 'all' | 'list' | { user_id: string } | { endpoint: string };
  filters?: {
    ids?: string[];
  };
  payload: {
    title: string;
    body: string;
    url?: string;
    image?: string;
    data?: any;
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

  // ✅ UNIFIED LOGIC: Map request to same endpoints as SendTab (Push Center)
  let endpoint = '';
  let requestBody: any = { payload: request.payload };
  
  if (request.audience === 'all') {
    // Broadcast to all subscriptions (requires admin token)
    endpoint = `${functionsBaseUrl}/webpush-send`;
    requestBody.audience = 'all';
  } else if (request.audience === 'list' && request.filters?.ids) {
    // Targeted send to specific user_ids (Push Control Panel / Sender)
    endpoint = `${functionsBaseUrl}/webpush-targeted-send`;
    requestBody.user_ids = request.filters.ids;
  } else if (typeof request.audience === 'object' && 'user_id' in request.audience) {
    // Single user_id (legacy format support)
    endpoint = `${functionsBaseUrl}/webpush-targeted-send`;
    requestBody.user_ids = [request.audience.user_id];
  } else {
    // Default: broadcast (fallback)
    endpoint = `${functionsBaseUrl}/webpush-send`;
    requestBody.audience = 'all';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };

  if (options.adminToken) {
    headers['x-admin-token'] = options.adminToken;
  } else if (options.userJWT) {
    headers['Authorization'] = `Bearer ${options.userJWT}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
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
