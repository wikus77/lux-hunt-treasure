// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Shared CORS utilities for Norah edge functions

const ALLOW_ORIGINS = Deno.env.get("CORS_ALLOWED_ORIGIN")
  ?.split(",").map(s => s.trim()).filter(Boolean) ?? ["*"];

function matchOrigin(origin: string, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern === origin) return true;
  
  // Wildcard matching: *.lovableproject.com matches https://xxx.lovableproject.com
  if (pattern.includes("*")) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$");
    return regex.test(origin);
  }
  
  return false;
}

export function withCors(resp: Response, origin?: string): Response {
  let allowedOrigin = "*";
  
  if (origin && ALLOW_ORIGINS.some(pattern => matchOrigin(origin, pattern))) {
    allowedOrigin = origin;
  } else if (!ALLOW_ORIGINS.includes("*")) {
    allowedOrigin = ALLOW_ORIGINS[0] ?? "*";
  }
  
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", allowedOrigin);
  h.set("Vary", "Origin");
  h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info, x-norah-cid");
  h.set("Cache-Control", "no-store");
  
  return new Response(resp.body, { 
    status: resp.status, 
    statusText: resp.statusText,
    headers: h 
  });
}

export function preflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  
  const origin = req.headers.get("Origin") ?? "*";
  const h = new Headers();
  h.set("Access-Control-Allow-Origin", origin);
  h.set("Vary", "Origin");
  h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info, x-norah-cid");
  h.set("Cache-Control", "no-store");
  return new Response(null, { status: 204, headers: h });
}

export function json(status: number, data: any, origin?: string): Response {
  const body = JSON.stringify(data);
  const resp = new Response(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
  return withCors(resp, origin);
}

export function errJSON(status: number, error: string, message?: string, origin?: string): Response {
  return json(status, { ok: false, error, message }, origin);
}
