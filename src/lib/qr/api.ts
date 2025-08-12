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
  // Invoca la funzione come POST con payload { c }
  const { data, error } = await supabase.functions.invoke('validate-qr', {
    body: { c: code },
  });
  // Lo SDK lancia error solo su status !2xx: ma ci serve anche lo status.
  // Purtroppo supabase-js non espone direttamente lo status, quindi facciamo fallback:
  // - se error.message contiene il codice, proviamo a decodificarlo
  // - altrimenti consideriamo 200 se nessun error
  const hinted = String((error as any)?.message || '');
  const statusMatch = hinted.match(/(\d{3})/);
  const status = error ? Number(statusMatch?.[1] || 500) : 200;
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
