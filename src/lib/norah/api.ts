// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { functionsBaseUrl } from "@/lib/supabase/functionsBase";

export async function norahIngest(source: "content-ai" | "remote" = "content-ai", docs?: Array<{ title: string; text: string; tags?: string[]; url?: string }>) {
  const url = `${functionsBaseUrl}/norah-ingest`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources: source, docs }),
  });
  if (!r.ok) throw new Error(`Ingest failed: ${r.status}`);
  return r.json();
}

export async function norahEmbed(opts?: { reembed?: boolean; batch?: number }) {
  const url = `${functionsBaseUrl}/norah-embed`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reembed: !!opts?.reembed, batch: opts?.batch ?? 100 }),
  });
  if (!r.ok) throw new Error(`Embed failed: ${r.status}`);
  return r.json();
}

export async function norahSearch(query: string, k = 8, minScore = 0.1) {
  const url = `${functionsBaseUrl}/norah-rag-search`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: k, locale: "it" }),
  });
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json();
}

export async function norahKpis() {
  const url = `${functionsBaseUrl}/norah-kpis`;
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) throw new Error(`KPIs failed: ${r.status}`);
  return r.json();
}
