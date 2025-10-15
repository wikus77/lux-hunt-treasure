// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { functionsBaseUrl } from "@/lib/supabase/functionsBase";

/**
 * JSON-safe wrapper for POST requests that validates content-type
 */
async function postJSON(fn: string, body: any, init?: RequestInit) {
  const u = functionsBaseUrl(fn);
  const r = await fetch(u, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    ...init,
  });
  
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    // Surface server-side HTML/401 as readable error for the panel
    const text = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} ${r.statusText} — Non-JSON response\n${text.slice(0, 200)}`);
  }
  
  const json = await r.json();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText} — ${JSON.stringify(json)}`);
  return json;
}

export const norahIngest = (source?: "content-ai" | "remote", docs?: Array<{ title: string; text: string; tags?: string[]; url?: string }>) => 
  postJSON("norah-ingest", { sources: source ?? "content-ai", docs });

export const norahEmbed = (opts?: { reembed?: boolean; batch?: number }) => 
  postJSON("norah-embed", { reembed: !!opts?.reembed, batch: opts?.batch ?? 100 });

export const norahSearch = (query: string, k = 8, minScore = 0.1) => 
  postJSON("norah-rag-search", { query, top_k: k, locale: "it", minScore });

export const norahKpis = async () => {
  const u = functionsBaseUrl("norah-kpis");
  const r = await fetch(u, { method: "GET" });
  
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const t = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} — KPIs not JSON\n${t.slice(0, 200)}`);
  }
  
  return r.json();
};
