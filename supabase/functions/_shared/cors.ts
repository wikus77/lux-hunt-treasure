// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export function corsHeaders(origin: string | null) {
  const allowed = (Deno.env.get('CORS_ALLOWED_ORIGIN') || '*')
    .split(',').map(s => s.trim());
  const ok = origin && (allowed.includes('*') || allowed.some(a => origin.endsWith(a.replace(/^\*\./, ''))));
  return {
    'Access-Control-Allow-Origin': ok ? origin! : '*',
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  } as const;
}
