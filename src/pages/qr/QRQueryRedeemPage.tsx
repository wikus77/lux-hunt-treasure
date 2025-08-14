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

  // Move useRoute to top-level (fix Rules of Hooks violation)
  const [match, params] = useRoute('/qr/:code');
  
  // Calculate code from path and query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const pathCode = match ? String((params as any).code || '').toUpperCase() : undefined;
  const queryCode = (searchParams.get('c') ?? searchParams.get('code') ?? '').trim().toUpperCase();
  const code = (pathCode || queryCode || '').toUpperCase();

  useEffect(() => {
    if (!user) {
      // Save redirect and go to login
      if (code) {
        try { localStorage.setItem('post_login_redirect', `/qr/${code}`); } catch {}
      }
      setLocation(`/login?redirect=${encodeURIComponent(`/qr/${code}`)}`);
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
          setError(`Redeem fallito: ${error.message || 'Edge error'}`);
          return;
        }

        const resp = (data || {}) as { status?: string; error?: string; reward_type?: string; reward_value?: string };

        if (resp.status === 'ok') {
          toast.success('🎁 Ricompensa sbloccata!');
          setLocation('/buzz?free=1&reward=1');
          return;
        }

        if (resp.status === 'already_claimed') {
          toast.info('Hai già riscattato questo QR');
          setLocation('/home');
          return;
        }

        if (resp.error === 'invalid_or_inactive_code') {
          setError('Codice QR non valido o disattivato');
          return;
        }

        setError(`Redeem fallito: ${resp.error ?? 'unknown'}`);
      } catch (e: any) {
        setError(e?.message || 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    redeem();
  }, [user, code]);

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
