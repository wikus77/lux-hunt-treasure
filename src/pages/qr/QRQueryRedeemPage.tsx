// © 2025 NIYVORA KFT –Joseph MULÉ – M1SSION™
import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export const QRQueryRedeemPage: React.FC = () => {
  const { user } = useAuthContext();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const [, routeParams] = useRoute('/qr/:code') || ([] as any);
    const pathCode = (routeParams && (routeParams as any).code ? String((routeParams as any).code) : undefined)?.toUpperCase();
    const raw = searchParams.get('c') ?? searchParams.get('code') ?? '';
    const queryCode = raw.trim().toUpperCase();
    const code = pathCode || queryCode;

    if (!user) {
      // Save redirect and go to login
      if (code) {
        try { localStorage.setItem('post_login_redirect', `/qr/${code}`); } catch {}
      }
      setLocation(`/login${code ? `?redirect=${encodeURIComponent(`/qr/${code}`)}` : ''}`);
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
        const { data, error } = await supabase.functions.invoke('redeem-qr', { body: { code } });
        
        if (error) {
          // Extract detailed error from Supabase Functions context
          const detail = (error as any)?.context ? JSON.stringify((error as any).context) : error.message;
          console.error('redeem-qr error', error, detail);
          setError(`Redeem fallito: ${detail}`);
          return;
        }

        console.log('redeem-qr response:', data); // Development logging
        
        const resp = (data as unknown) as { status?: string; reward_type?: string; reward_value?: number; error?: string };
        
        if (resp?.status === 'ok') {
          toast.success('🎁 Ricompensa sbloccata!');
          // Route based on reward
          if (resp.reward_type === 'buzz_credit') {
            setLocation('/buzz?free=1&reward=1');
          } else if (resp.reward_type === 'buzz_map_credit') {
            setLocation('/map?free=1&reward=1');
          } else {
            toast.message('QR riscattato');
            setLocation('/home');
          }
        } else if (resp?.status === 'already_redeemed' || resp?.status === 'already_claimed') {
          toast.info('Hai già riscattato questo QR');
          setLocation('/home');
        } else if (resp?.error === 'invalid_or_inactive_code') {
          setError('Codice QR non valido o disattivato');
        } else {
          setError('Riscatto QR non riuscito');
        }
      } catch (e: any) {
        console.error('redeem-qr error', e);
        if (e?.message === 'invalid_or_inactive_code') {
          setError('Codice QR non valido o disattivato');
        } else {
          setError(e?.message || 'Errore sconosciuto');
        }
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
