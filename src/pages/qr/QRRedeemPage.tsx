// © 2025 M1MISSION™ NIYVORA KFT– Joseph MULÉ
import React,{useEffect,useState} from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { validateQR_GET, redeemQR_POST } from '@/lib/qr/api';
import { supabase } from '@/integrations/supabase/client';

type V = { valid:boolean; code?:string; title?:string|null; reward?:{type:string;buzz?:number}|null; message?:string|null };

export default function QRRedeemPage(){
  const [, m] = useRoute<{code:string}>('/qr/:code');
  const code = (m?.code ?? '').trim().toUpperCase();
  const [v,setV]=useState<V|null>(null);
  const [loading,setLoading]=useState(true);
  const [hasSession,setHasSession]=useState(false);

  useEffect(()=>{(async()=>{
    const { data:{ session } } = await supabase.auth.getSession();
    setHasSession(!!session);
  })();},[]);

  useEffect(()=>{(async()=>{
    if(!code){ setV({valid:false}); setLoading(false); return; }
    const r = await validateQR_GET(code);
    if (r.ok && r.body?.valid) setV(r.body as V);
    else if (r.status===404 || (r.ok && r.body?.valid===false)) { setV({valid:false}); toast.error('QR non valido'); }
    else if (r.status===401 || r.status===403) { setV({valid:false}); toast.error('Permessi insufficienti'); }
    else { setV({valid:false}); toast.error('Problema di rete'); }
    setLoading(false);
  })();},[code]);

  const redeem = async ()=>{
    if(!hasSession){ window.location.href = `/login?redirect=${encodeURIComponent('/qr/'+code)}`; return; }
    const r = await redeemQR_POST(code);
    if (r.ok) toast.success('Riscatto completato');
    else {
      const msg = String(r.body?.error||'');
      if (/409|already_redeemed/i.test(msg)) toast.info('Hai già riscattato');
      else if (/401|403/i.test(msg)) toast.error('Permessi insufficienti');
      else toast.error('Errore Edge');
    }
  };

  if (loading) return <div className="p-6 text-center">Caricamento…</div>;
  if (!v?.valid) return <div className="p-6 text-center">QR inesistente</div>;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-6 text-center border rounded-xl bg-card">
        <h1 className="text-2xl font-bold mb-2">M1SSION™ QR</h1>
        <div className="font-mono text-sm text-muted-foreground mb-4">{code}</div>
        <Button className="w-full" onClick={redeem}>🎯 Riscatta</Button>
        {v.message && <div className="mt-4 p-3 rounded bg-muted text-left">{v.message}</div>}
      </div>
    </div>
  );
}
