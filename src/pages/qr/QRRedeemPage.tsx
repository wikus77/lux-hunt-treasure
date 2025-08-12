// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type QRRow = {
  code: string;
  reward_type: string;
  title: string | null;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
  message?: string | null;
};

export default function QRRedeemPage() {
  const [, params] = useRoute<{ code: string }>('/qr/:code');
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const raw = (params?.code ?? search.get('c') ?? '').trim();
  const code = raw.toUpperCase();
  const [row, setRow] = useState<QRRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      if (!code) { setLoading(false); return; }
      try {
        const envBase = (import.meta as any).env?.VITE_QR_VALIDATE_URL as string | undefined;
        const base = envBase || 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/validate-qr';
        const res = await fetch(`${base}?c=${encodeURIComponent(code)}`, { method: 'GET' });
        if (!res.ok) throw new Error('validate_failed');
        const j = await res.json();
        if (j?.valid) {
          setRow({
            code,
            reward_type: j?.reward?.type || 'buzz_credit',
            title: j?.title ?? null,
            is_active: true,
            lat: j?.lat ?? null,
            lng: j?.lng ?? null,
            message: j?.message ?? null,
          });
        } else {
          setRow(null); toast.error('QR non valido');
        }
      } catch {
        setRow(null); toast.error('QR non valido');
      } finally { setLoading(false); }
    })();
  }, [code]);

  const redeem = async () => {
    if (!code) return;
    const attempt = async () => {
      const { error } = await supabase.functions.invoke('redeem_qr', { body: { code } });
      if (error) throw error;
    };
    let tries = 0; const delays = [250, 500, 1000];
    while (tries < 3) {
      try {
        await attempt();
        toast.success('Riscatto completato!');
        setDone(true);
        return;
      } catch (e:any) {
        const msg = String(e?.message || 'Errore Edge Function');
        if (++tries >= 3 || !/(429|5\d\d)/.test(msg)) {
          if (/already_redeemed/i.test(msg)) toast.info('Hai già riscattato questo QR');
          else if (/forbidden|401|403/i.test(msg)) toast.error('Permessi insufficienti');
          else toast.error(msg);
          break;
        }
        await new Promise(r => setTimeout(r, delays[tries-1]));
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Caricamento…</div>;
  if (!row) return <div className="p-6 text-center">QR inesistente</div>;

  const active = row.is_active && !done;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center border rounded-xl bg-card">
        <h1 className="text-2xl font-bold mb-2">M1SSION™ QR</h1>
        <div className="font-mono text-sm text-muted-foreground mb-4">{code}</div>

        {active ? (
          <Button className="w-full" onClick={redeem}>🎯 Riscatta</Button>
        ) : (
          <div className="text-green-500 font-semibold">✅ Già riscattato</div>
        )}

        {row.reward_type === 'custom' && row.message && (
          <div className="mt-4 p-3 rounded bg-muted text-left">
            <div className="text-sm opacity-70 mb-1">Messaggio</div>
            <div>{row.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
