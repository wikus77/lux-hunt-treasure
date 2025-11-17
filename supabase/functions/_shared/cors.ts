// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info,x-m1-debug',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
};

export function preflight(req: Request): Response {
  const h = new Headers(corsHeaders);
  const origin = req.headers.get('Origin');
  const reqAllowed = req.headers.get('Access-Control-Request-Headers');
  if (origin) h.set('Access-Control-Allow-Origin', origin);
  if (reqAllowed) h.set('Access-Control-Allow-Headers', reqAllowed);
  return new Response(null, { status: 204, headers: h });
}
