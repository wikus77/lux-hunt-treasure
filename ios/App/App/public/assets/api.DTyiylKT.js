import { bg as getSupabaseAnonKey, bh as getSupabaseUrl, aG as functionsBaseUrl } from './index.BEQCqgv7.js';

getSupabaseUrl();
const SUPABASE_ANON_KEY = getSupabaseAnonKey();
async function sendPushNotification(request, options) {
  const startTime = performance.now();
  let endpoint = "";
  let requestBody = { payload: request.payload };
  if (request.audience === "all") {
    endpoint = `${functionsBaseUrl}/webpush-send`;
    requestBody.audience = "all";
  } else if (request.audience === "list" && request.filters?.ids) {
    endpoint = `${functionsBaseUrl}/webpush-targeted-send`;
    requestBody.user_ids = request.filters.ids;
  } else if (typeof request.audience === "object" && "user_id" in request.audience) {
    endpoint = `${functionsBaseUrl}/webpush-targeted-send`;
    requestBody.user_ids = [request.audience.user_id];
  } else {
    endpoint = `${functionsBaseUrl}/webpush-send`;
    requestBody.audience = "all";
  }
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY
  };
  if (options.adminToken) {
    headers["x-admin-token"] = options.adminToken;
  } else if (options.userJWT) {
    headers["Authorization"] = `Bearer ${options.userJWT}`;
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody)
  });
  const data = await response.json();
  const responseTime = Math.round(performance.now() - startTime);
  return {
    status: response.status,
    data,
    responseTime
  };
}
function getSuggestion(error, status) {
  if (!error && status === 200) return "✅ Success!";
  if (status === 401) {
    if (error?.includes("invalid_admin_token")) {
      return "⚠️ Token admin errato. Verifica PUSH_ADMIN_TOKEN.";
    }
    if (error?.includes("missing_authorization")) {
      return "⚠️ Authorization header mancante. Esegui il login o usa admin token.";
    }
    if (error?.includes("missing") || error?.includes("invalid_jwt")) {
      return "⚠️ JWT mancante o non valido. Esegui il login per ottenere un token valido.";
    }
    return "⚠️ Non autorizzato. Verifica le credenziali.";
  }
  if (status === 400) {
    if (error?.includes("endpoint")) {
      return "⚠️ Endpoint mancante o non valido. Verifica il formato.";
    }
    if (error?.includes("keys") || error?.includes("p256dh") || error?.includes("auth")) {
      return "⚠️ Chiavi push mancanti (p256dh/auth). Riesegui la subscription.";
    }
    return "⚠️ Richiesta non valida. Controlla i parametri.";
  }
  if (status === 500) {
    if (error?.includes("PUSH_ADMIN_TOKEN")) {
      return "⚠️ Configura PUSH_ADMIN_TOKEN nei secrets di Supabase.";
    }
    if (error?.includes("VAPID")) {
      return "⚠️ VAPID keys non configurate. Verifica VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT.";
    }
    return "⚠️ Errore interno del server. Controlla i logs delle Edge Functions.";
  }
  if (error?.includes("No active subscriptions")) {
    return "⚠️ Nessuna subscription attiva trovata. Esegui (Re)Subscribe prima di inviare.";
  }
  return error || "Errore sconosciuto";
}

export { getSuggestion as g, sendPushNotification as s };
