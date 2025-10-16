// supabase/functions/_shared/cors.ts
export const ALLOW_ORIGINS = [
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/m1ssion\.eu$/,
  /^http:\/\/localhost:\d+$/,
];

export function corsHeaders(origin: string | null) {
  const allowed =
    origin && ALLOW_ORIGINS.some(rx => rx.test(origin)) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function handleOptions(req: Request) {
  const origin = req.headers.get("Origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export function jsonResponse(req: Request, body: unknown, init?: ResponseInit) {
  const origin = req.headers.get("Origin");
  const headers = {
    "Content-Type": "application/json",
    ...corsHeaders(origin),
    ...(init?.headers || {}),
  };
  return new Response(JSON.stringify(body), { ...(init || {}), headers });
}
