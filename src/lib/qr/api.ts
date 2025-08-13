// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { supabase } from '@/integrations/supabase/client';

// Helper centralizzati per QR
// validateQR usa POST tramite supabase.functions.invoke per garantire header apikey e JWT automatici
// redeemQR idem. Entrambe le Edge Functions hanno CORS dinamico.

export type ValidateResult = {
  ok: boolean;
  status: number;
  body: any;
  allow: string | null;
};

export async function validateQR(code: string): Promise<ValidateResult> {
  const { data, error } = await supabase.functions.invoke('validate-qr', {
    body: { code: code.trim().toUpperCase() },
  });
  const status = (error as any)?.status ?? (error ? 500 : 200);
  return {
    ok: !error,
    status,
    body: error ? null : data,
    allow: null,
  };
}

export async function redeemQR(code: string) {
  const { data, error } = await supabase.functions.invoke('redeem_qr', {
    body: { code },
  });
  if (error) throw error;
  return data;
}

// GET helper with explicit apikey for validate-qr (also supports POST via invoke)
export async function validateQR_GET(code: string): Promise<ValidateResult> {
  const up = code.trim().toUpperCase();
  const url = `https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/validate-qr?c=${encodeURIComponent(up)}`;
  const res = await fetch(url, {
    headers: {
      'accept': 'application/json',
      // Public anon key - safe to expose
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
    }
  });
  let body: any = null;
  try { body = await res.json(); } catch {}
  return {
    ok: res.ok,
    status: res.status,
    body,
    allow: res.headers.get('access-control-allow-origin')
  };
}
