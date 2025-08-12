// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type QRRow = {
  code: string;
  reward_type: 'buzz_credit' | 'custom' | string;
  title: string | null;
  message?: string | null;
  is_active: boolean;
  lat: number | null;
  lng: number | null;
};

export const QRRedeemPage: React.FC = () => {
  const [, params] = useRoute('/qr/:code');
  const code = (params?.code || '').toUpperCase();
  const [row, setRow] = useState<QRRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    (async () => {
      if (!code) return setLoading(false);
      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('code,reward_type,title,is_active,lat,lng')
          .eq('code', code)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          toast.error('QR non valido');
        }
        setRow(data as QRRow | null);
      } catch (e) {
        toast.error('QR non valido');
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const redeem = async () => {
    if (!row) return;
    try {
      const { data, error } = await supabase.functions.invoke('redeem_qr', {
        body: { code }
      });
      if (error) throw error;
      setRedeemed(true);
      toast.success('Riscatto completato!');
    } catch (e: any) {
      toast.error(e?.message || 'Errore nel riscatto');
    }
  };

  if (loading) return <div className="p-6 text-center">Caricamento…</div>;
  if (!row) return <div className="p-6 text-center">QR inesistente</div>;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center border rounded-xl bg-card">
        <h1 className="text-2xl font-bold mb-2">M1SSION™ QR</h1>
        <div className="font-mono text-sm text-muted-foreground mb-4">{code}</div>

        {redeemed ? (
          <div className="text-green-500 font-semibold">✅ Riscattato</div>
        ) : row.is_active ? (
          <Button className="w-full" onClick={redeem}>🎯 Riscatta</Button>
        ) : (
          <div className="text-yellow-500">Questo QR non è attivo</div>
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
};
export default QRRedeemPage;