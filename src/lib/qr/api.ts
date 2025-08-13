// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { supabase } from '@/integrations/supabase/client';
const TRACE='M1QR-TRACE';
const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

function assertEnv(){
  if(!BASE || !ANON){
    console.error(TRACE,{step:'env:missing', BASE:!!BASE, ANON:!!ANON});
    throw new Error('missing_env');
  }
}

export async function validateQR(code:string){
  assertEnv();
  const c = code.trim().toUpperCase();
  const url = `${BASE}/functions/v1/validate-qr?c=${encodeURIComponent(c)}`;
  try{
    console.debug(TRACE,{op:'validate:get:start', url, c});
    const res = await fetch(url,{ headers:{ 'accept':'application/json','apikey': ANON! }});
    const body = res.ok ? await res.json().catch(()=>null) : null;
    console.debug(TRACE,{op:'validate:get:end', status: res.status, ok: res.ok, acao: res.headers.get('access-control-allow-origin')});
    return { ok: res.ok, status: res.status, body } as const;
  }catch(err){
    console.warn(TRACE,{op:'validate:get:error', err: String(err)});
    // Fallback: POST via gateway (garantisce log Supabase anche se il GET è bloccato)
    const { data, error } = await supabase.functions.invoke('validate-qr',{ body:{ code:c }});
    const status = (error as any)?.status ?? (data?200:500);
    console.debug(TRACE,{op:'validate:post:end', status, hasData: !!data, error: (error as any)?.message});
    return error ? { ok:false, status, body:{ error:String((error as any).message||'edge_error') } } as const
                 : { ok:true, status:200, body:data } as const;
  }
}

export async function redeemQR(code:string){
  assertEnv();
  const c = code.trim().toUpperCase();
  console.debug(TRACE,{op:'redeem:start', c});
  const { data, error } = await supabase.functions.invoke('redeem_qr',{ body:{ code:c }});
  const status=(error as any)?.status|| (data?200:500);
  console.debug(TRACE,{op:'redeem:end', status, error: (error as any)?.message});
  return error ? { ok:false, status, body:{ error:String((error as any).message||'edge_error') } } as const
               : { ok:true, status:200, body:data } as const;
}
