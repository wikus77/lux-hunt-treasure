// © 2025 NIYVORA KFT –Joseph MULÉ – M1SSION™
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export const QRQueryRedeemPage: React.FC = () => {
  const { user } = useAuthContext();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code')?.toUpperCase();

    if (!user) {
      // Save redirect and go to login
      if (code) {
        try { localStorage.setItem('post_login_redirect', `/qr?code=${code}`); } catch {}
      }
      setLocation(`/login${code ? `?redirect=${encodeURIComponent(`/qr?code=${code}`)}` : ''}`);
      return;
    }

    if (!code) {
      setError('Nessun codice QR trovato');
      setLoading(false);
      return;
    }

    const redeem = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('qr_redeem', { code });
        if (error) throw error;

        const resp = (data as unknown) as { status?: string; reward_type?: string; reward_value?: number };
        // resp: { status, reward_type, reward_value }
        if (resp?.status === 'ok') {
          toast.success('🎁 Ricompensa sbloccata!');
          // Route based on reward
          if (resp.reward_type === 'buzz_credit') {
            // navigate to buzz with free flag
            setLocation('/buzz?free=1&reward=1');
          } else if (resp.reward_type === 'buzz_map_credit') {
            setLocation('/map?free=1&reward=1');
          } else {
            toast.message('QR riscattato');
            setLocation('/home');
          }
        } else if (resp?.status === 'already_claimed') {
          toast.info('Hai già riscattato questo QR');
          setLocation('/home');
        } else {
          setError('Riscatto QR non riuscito');
        }
      } catch (e: any) {
        console.error('qr_redeem error', e);
        setError(e?.message || 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    redeem();
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {loading ? (
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="opacity-80">Riscatto QR in corso…</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">{error}</p>
          <button className="underline" onClick={() => setLocation('/home')}>Torna alla Home</button>
        </div>
      ) : null}
    </div>
  );
};
