// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URL = Deno.env.get("SUPABASE_URL")!;
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED = (Deno.env.get("CORS_ALLOWED_ORIGIN") || "*")
  .split(",").map(s => s.trim());

function makeCors(origin: string | null) {
  const ok = origin && ALLOWED.some(a => a === "*" || origin.endsWith(a.replace(/^\*\./,"")));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "*",
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, X-Client-Info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };
}

const okJSON  = (d:unknown,o:string|null,s=200)=>new Response(JSON.stringify(d),{status:s,headers:makeCors(o)});
const errJSON = (m:string,o:string|null,s=400)=>okJSON({ok:false,error:m},o,s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: makeCors(req.headers.get("Origin")) });
  const admin = createClient(URL, SRV);
  try {
    const { sources="content-ai", docs=[] } = await req.json().catch(()=>({}));
    let inserted = 0;
    for (const d of docs) {
      const title = d.title ?? "Untitled";
      const text  = d.text ?? d.body ?? d.body_md ?? "";
      const tags  = Array.isArray(d.tags) ? d.tags : [];
      const { error } = await admin.from("ai_docs").insert({
        title, text, tags, source: d.source ?? sources, url: d.url ?? null
      });
      if (error) throw error;
      inserted++;
    }
    return okJSON({ ok:true, inserted }, req.headers.get("Origin"));
  } catch (e: any) {
    return errJSON(`ingest-error: ${e?.message ?? String(e)}`, req.headers.get("Origin"), 500);
  }
});
