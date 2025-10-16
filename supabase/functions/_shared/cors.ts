// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Shared CORS utilities for Norah edge functions

const ALLOW_ORIGINS = Deno.env.get("CORS_ALLOWED_ORIGIN")
  ?.split(",").map(s => s.trim()).filter(Boolean) ?? ["*"];

export function withCors(resp: Response, origin?: string): Response {
  const o = (origin && ALLOW_ORIGINS.includes(origin)) 
    ? origin 
    : (ALLOW_ORIGINS.includes("*") ? "*" : ALLOW_ORIGINS[0] ?? "*");
  
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", o);
  h.set("Vary", "Origin");
  h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info");
  
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
  h.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info");
  
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
