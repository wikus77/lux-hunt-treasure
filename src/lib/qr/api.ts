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
