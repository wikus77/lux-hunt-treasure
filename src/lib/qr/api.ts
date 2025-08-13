// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { supabase } from '@/integrations/supabase/client';

const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const TRACE = 'M1QR-TRACE';

function assertEnv() {
  if (!BASE || !ANON) {
    console.error(TRACE, { step: 'env:missing', BASE: !!BASE, ANON: !!ANON });
    throw new Error('missing_env');
  }
}

export async function validateQR(code: string) {
  assertEnv();
  const c = code.trim().toUpperCase();
  const url = `${BASE}/functions/v1/validate-qr?c=${encodeURIComponent(c)}`;
  try {
    console.debug(TRACE, { step: 'validate:get:start', url, c });
    const res = await fetch(url, { headers: { accept: 'application/json', apikey: ANON! } });
    const body = res.ok ? await res.json().catch(() => null) : null;
    console.debug(TRACE, { step: 'validate:get:end', status: res.status, ok: res.ok });
    return { ok: res.ok, status: res.status, body } as const;
  } catch (e) {
    // Fallback via invoke POST (passa gateway, apikey e JWT se presente)
    console.warn(TRACE, { step: 'validate:get:error', err: String(e) });
    const { data, error } = await supabase.functions.invoke('validate-qr', { body: { code: c } });
    const status = (error as any)?.status ?? (data ? 200 : 500);
    console.debug(TRACE, { step: 'validate:post:end', status, hasData: !!data });
    if (error) return { ok: false, status, body: { error: String(error.message || 'edge_error') } } as const;
    return { ok: true, status: 200, body: data } as const;
  }
}

export async function redeemQR(code: string) {
  assertEnv();
  const c = code.trim().toUpperCase();
  console.debug(TRACE, { step: 'redeem:start', c });
  const { data, error } = await supabase.functions.invoke('redeem_qr', { body: { code: c } });
  if (error)
    return {
      ok: false,
      status: (error as any).status || 500,
      body: { error: String((error as any).message || 'edge_error') },
    } as const;
  return { ok: true, status: 200, body: data } as const;
}
