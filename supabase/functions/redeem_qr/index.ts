// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const OK=(o:string|null)=> allow(o)?o:'https://www.m1ssion.eu';
function allow(o:string|null){ if(!o) return false; try{ const {hostname}=new URL(o); return [
  'www.m1ssion.eu','m1ssion.eu','m1ssion.pages.dev','localhost','127.0.0.1'
].includes(hostname) || hostname.endsWith('lovable.dev') || hostname.endsWith('lovableproject.com'); }catch{ return false; } }
const C=(o:string|null)=>({'Access-Control-Allow-Origin':OK(o),'Vary':'Origin','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Max-Age':'86400'});
const sub=(h:string|null)=>{ const m=h?.match(/^Bearer\s+(.+)$/i); if(!m) return null; try{ return JSON.parse(atob(m[1].split('.')[1]||''))?.sub||null; }catch{return null;} };

Deno.serve(async(req)=>{
  const origin=req.headers.get('origin'); try{ console.log(JSON.stringify({tag:'M1QR',fn:'redeem_qr',method:req.method,origin})) }catch{}
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers:C(origin)});

  const s=sub(req.headers.get('authorization'));
  if(!s) return new Response(JSON.stringify({error:'unauthorized'}),{status:401,headers:{...C(origin),'content-type':'application/json'}});

  try{
    const {code}=await req.json().catch(()=>({})); const up=String(code||'').toUpperCase().trim();
    if(!up) return new Response(JSON.stringify({error:'invalid_code'}),{status:400,headers:{...C(origin),'content-type':'application/json'}});

    const url=Deno.env.get('SUPABASE_URL')!, key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Idempotenza via tabella qr_redemptions (unique code)
    const chk=new URL(`${url}/rest/v1/qr_redemptions`); chk.searchParams.set('select','id'); chk.searchParams.set('code',`eq.${up}`);
    const cr=await fetch(chk.toString(),{headers:{apikey:key,authorization:`Bearer ${key}`}});
    const cj=await cr.json().catch(()=>[]) as any[];
    if(Array.isArray(cj)&&cj.length>0) return new Response(JSON.stringify({status:'already_redeemed'}),{status:409,headers:{...C(origin),'content-type':'application/json'}});

    const ins=await fetch(`${url}/rest/v1/qr_redemptions`,{ method:'POST', headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'}, body:JSON.stringify({ code:up, user_id:s, meta:{} }) });
    if(!ins.ok){ const txt=await ins.text(); return new Response(JSON.stringify({error:'insert_failed',detail:txt}),{status:500,headers:{...C(origin),'content-type':'application/json'}}); }

    return new Response(JSON.stringify({status:'ok'}),{status:200,headers:{...C(origin),'content-type':'application/json'}});
  }catch(e){
    try{ console.log(JSON.stringify({tag:'M1QR',fn:'redeem_qr',err:String(e)})) }catch{}
    return new Response(JSON.stringify({error:'server_error'}),{status:500,headers:{...C(origin),'content-type':'application/json'}});
  }
});