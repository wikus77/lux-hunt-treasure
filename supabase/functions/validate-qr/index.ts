// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
const OK=(o:string|null)=> allow(o)?o:'https://www.m1ssion.eu';
function allow(o:string|null){ if(!o) return false; try{ const {hostname}=new URL(o); return [
  'www.m1ssion.eu','m1ssion.eu','m1ssion.pages.dev','localhost','127.0.0.1'
].includes(hostname) || hostname.endsWith('lovable.dev') || hostname.endsWith('lovableproject.com'); }catch{ return false; } }
const C=(o:string|null)=>({'Access-Control-Allow-Origin':OK(o),'Vary':'Origin','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Max-Age':'86400'});

Deno.serve(async(req)=>{
  const origin=req.headers.get('origin'); console.log(JSON.stringify({tag:'M1QR',fn:'validate-qr',method:req.method,origin}));
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers:C(origin)});
  try{
    let up=''; if(req.method==='POST'){ const j=await req.json().catch(()=>({})); up=String(j?.code||'').toUpperCase().trim(); }
    else { const u=new URL(req.url); up=String(u.searchParams.get('c')||'').toUpperCase().trim(); }
    if(!up) return new Response(JSON.stringify({valid:false}),{status:404,headers:{...C(origin),'content-type':'application/json'}});
    const url=Deno.env.get('SUPABASE_URL')!, key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const q=new URL(`${url}/rest/v1/qr_codes`); q.searchParams.set('select','code,title,lat,lng,is_active,expires_at,buzz'); q.searchParams.set('code',`eq.${up}`);
    const r=await fetch(q.toString(),{headers:{apikey:key,authorization:`Bearer ${key}`}}); const arr=await r.json().catch(()=>[]) as any[];
    const row=Array.isArray(arr)?arr[0]:null; const active=!!row?.is_active && (!row?.expires_at || new Date(row.expires_at)>new Date());
    if(!row||!active) return new Response(JSON.stringify({valid:false}),{status:404,headers:{...C(origin),'content-type':'application/json'}});
    return new Response(JSON.stringify({valid:true,code:row.code,title:row.title??null,lat:row.lat??null,lng:row.lng??null,reward:{type:'buzz_credit',buzz:row.buzz??null},one_time:true}),{status:200,headers:{...C(origin),'content-type':'application/json'}});
  }catch(e){
    console.log(JSON.stringify({tag:'M1QR',fn:'validate-qr',err:String(e)}));
    return new Response(JSON.stringify({valid:false,error:'server_error'}),{status:500,headers:{...C(origin),'content-type':'application/json'}});
  }
});
