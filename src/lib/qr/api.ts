// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import { supabase } from '@/integrations/supabase/client';

// Use explicit values to avoid build-time env reliance
const SUPABASE_URL = "https://vkjrqirvdvjbemsfzxof.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

export async function validateQR_GET(code: string){
  const url = `${SUPABASE_URL}/functions/v1/validate-qr?c=${encodeURIComponent(code.trim().toUpperCase())}`;
  const res = await fetch(url, { headers: { 'accept':'application/json', 'apikey': ANON } });
  let body:any=null; try{ body = res.ok ? await res.json() : null; }catch{}
  return { ok:res.ok, status:res.status, body };
}

export async function redeemQR_POST(code: string){
  const { data, error } = await supabase.functions.invoke('redeem_qr', {
    body: { code: code.trim().toUpperCase() }
  });
  if (error) return { ok:false, status:(error as any).status||500, body:{ error:String(error.message||'edge_error') } };
  return { ok:true, status:200, body:data };
}
