// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { KEY as POST_LOGIN_KEY } from '@/utils/postLoginRedirectFixed';
import { validateQR, redeemQR } from '@/lib/qr/api';

const TRACE_ID = 'M1QR-TRACE';
const FUNCTIONS_BASE = 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1';

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
  const [, p1] = useRoute<{ code: string }>('/qr/:code');
  const [, p2] = useRoute<{ code: string }>('/qr/redeem/:code');
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const raw = (p1?.code ?? p2?.code ?? search.get('c') ?? '').trim();
  const code = raw.toUpperCase();
const [row, setRow] = useState<QRRow | null>(null);
const [loading, setLoading] = useState(true);
const [done, setDone] = useState(false);
const [hasSession, setHasSession] = useState<boolean>(false);
const [authLoading, setAuthLoading] = useState<boolean>(true);

useEffect(() => {
  (async () => {
    if (!code) { setLoading(false); return; }
    try {
      if (import.meta.env.DEV) {
        console.debug(TRACE_ID, { tag:'M1QR', step:'validate:start', code, ts: Date.now() });
      }
      const r = await validateQR(code);
      if (import.meta.env.DEV) {
        console.debug(TRACE_ID, { tag:'M1QR', step:'validate:end', code, status: r.status, ok: r.ok, allow_origin: r.allow, ts: Date.now() });
      }
      const j: any = r.body;
      if (r.ok && j?.valid === true) {
        setRow({
          code,
          reward_type: j?.reward?.type || 'buzz_credit',
          title: j?.title ?? null,
          is_active: true,
          lat: j?.lat ?? null,
          lng: j?.lng ?? null,
          message: j?.message ?? null,
        });
      } else if (r.status === 404 || (r.ok && j && j.valid === false)) {
        setRow(null); toast.error('QR non valido');
      } else if (r.status === 401 || r.status === 403) {
        setRow(null); toast.error('Permessi insufficienti');
      } else {
        setRow(null); toast.error('Problema di rete o permessi');
      }
    } catch (e) {
      setRow(null); toast.error('Problema di rete o permessi');
      if (import.meta.env.DEV) console.debug(TRACE_ID, { tag:'M1QR', step:'validate:error', code, error: String((e as any)?.message || e) });
    } finally { setLoading(false); }
  })();
}, [code]);

useEffect(() => {
  (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      if (import.meta.env.DEV) console.debug(TRACE_ID, { tag:'M1QR', step:'auth:session', hasSession: !!session, ts: Date.now() });
    } finally { setAuthLoading(false); }
  })();
}, []);

const goToLogin = () => {
  const target = `/qr/${encodeURIComponent(code)}`;
  try { localStorage.setItem(POST_LOGIN_KEY, target); } catch {}
  const loginUrl = `/login?redirect=${encodeURIComponent(target)}`;
  window.location.href = loginUrl;
};

const redeem = async () => {
  const redeemUrl = `${FUNCTIONS_BASE}/redeem_qr`;
  if (import.meta.env.DEV) {
    console.debug(TRACE_ID, { tag:'M1QR', step:'redeem:start', code, url: redeemUrl, ts: Date.now() });
  }
  let tries = 0; const delays = [250, 500, 1000];
  while (tries < 3) {
    try {
      await redeemQR(code);
      toast.success('Riscatto completato!');
      setDone(true);
      if (import.meta.env.DEV) console.debug(TRACE_ID, { tag:'M1QR', step:'redeem:end', code, status: 200, ts: Date.now() });
      return;
    } catch (e:any) {
      const msg = String(e?.message || 'Errore Edge Function');
      const statusHint = (/409/.test(msg) || /already_redeemed/i.test(msg)) ? 409 : (/403|401/.test(msg) ? 403 : (/5\d\d/.test(msg) ? 500 : 0));
      if (++tries >= 3 || !/(429|5\d\d)/.test(msg)) {
        if (/already_redeemed/i.test(msg) || /409/.test(msg)) toast.info('Hai già riscattato questo QR');
        else if (/forbidden|401|403/i.test(msg)) toast.error('Permessi insufficienti');
        else toast.error('Errore Edge Function');
        if (import.meta.env.DEV) console.debug(TRACE_ID, { tag:'M1QR', step:'redeem:end', code, status: statusHint, error: msg, ts: Date.now() });
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
          hasSession ? (
            <Button className="w-full" onClick={redeem}>🎯 Riscatta</Button>
          ) : (
            !authLoading && <Button className="w-full" variant="secondary" onClick={goToLogin}>🔐 Accedi per riscattare</Button>
          )
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
