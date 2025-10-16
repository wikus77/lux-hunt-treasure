// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { functionsBaseUrl, norahHeaders, safeJson } from "@/lib/supabase/functionsBase";

export async function norahIngest(source: "content-ai" | "remote" | "e2e-test" = "content-ai", docs?: any[]) {
  const url = functionsBaseUrl("norah-ingest");
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahIngest →', { url, source, docsCount: docs?.length || 0 });
  }
  const r = await fetch(url, {
    method: "POST",
    headers: norahHeaders(),
    body: JSON.stringify({ sources: source, docs: docs ?? [] })
  });
  const result = await safeJson(r);
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahIngest ✅', result);
  }
  return result;
}

export async function norahEmbed(opts?: { reembed?: boolean; batch?: number }) {
  const url = functionsBaseUrl("norah-embed");
  const payload = { reembed: !!opts?.reembed, batch: opts?.batch ?? 200 };
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahEmbed →', { url, payload });
  }
  const r = await fetch(url, {
    method: "POST",
    headers: norahHeaders(),
    body: JSON.stringify(payload)
  });
  const result = await safeJson(r);
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahEmbed ✅', result);
  }
  return result;
}

export async function norahSearch(query: string, k = 8, minScore = 0.1) {
  const url = functionsBaseUrl("norah-rag-search");
  const payload = { query, k, minScore };
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahSearch →', { url, payload });
  }
  const r = await fetch(url, {
    method: "POST",
    headers: norahHeaders(),
    body: JSON.stringify(payload)
  });
  const result = await safeJson(r);
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahSearch ✅', result);
  }
  return result;
}

export async function norahKpis() {
  const url = functionsBaseUrl("norah-kpis");
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahKpis →', { url });
  }
  const r = await fetch(url, { method: "GET", headers: norahHeaders() });
  const result = await safeJson(r);
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahKpis ✅', result);
  }
  return result;
}
