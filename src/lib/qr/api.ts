// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
const TRACE='M1QR-TRACE';
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

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
  const status=(error as any)?.status|| (data?200:500);
  console.debug(TRACE,{op:'redeem:end', status, error: (error as any)?.message});
  return error ? { ok:false, status, body:{ error:String((error as any).message||'edge_error') } } as const
               : { ok:true, status:200, body:data } as const;
}
