// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { functionsBaseUrl, norahHeaders, safeJson } from '@/lib/supabase/functionsBase';

export async function norahIngest(
  source: 'content-ai' | 'remote' = 'content-ai',
  docs?: Array<{ title: string; text?: string; body?: string; body_md?: string; tags?: string[]; url?: string }>
) {
  const url = functionsBaseUrl('norah-ingest');
  const r = await fetch(url, {
    method: 'POST',
    headers: norahHeaders(),
    body: JSON.stringify({ sources: source, docs: docs ?? [] }),
  });
  return safeJson(r);
}

export async function norahEmbed(opts?: { reembed?: boolean; batch?: number }) {
  const url = functionsBaseUrl('norah-embed');
  const r = await fetch(url, {
    method: 'POST',
    headers: norahHeaders(),
    body: JSON.stringify({ reembed: !!opts?.reembed, batch: opts?.batch ?? 200 }),
  });
  return safeJson(r);
}

export async function norahSearch(query: string, k = 8, minScore = 0.1) {
  const url = functionsBaseUrl('norah-rag-search');
  const r = await fetch(url, {
    method: 'POST',
    headers: norahHeaders(),
    body: JSON.stringify({ query, k, minScore }),
  });
  return safeJson(r);
}

export async function norahKpis() {
  const url = functionsBaseUrl('norah-kpis');
  const r = await fetch(url, { method: 'GET', headers: norahHeaders() });
  return safeJson(r);
}
