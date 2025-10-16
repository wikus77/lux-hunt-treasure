// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { NORAH_ROUTES } from "@/lib/norahApi";
import { httpJson, formatHttpError } from "@/lib/httpJson";

const norahHeaders = () => ({
  "Content-Type": "application/json",
});

export async function norahIngest(source: "content-ai" | "remote" | "e2e-test" = "content-ai", docs?: any[]) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahIngest →', { source, docsCount: docs?.length || 0 });
  }
  try {
    const result = await httpJson(NORAH_ROUTES.ingest, {
      method: "POST",
      headers: norahHeaders(),
      body: JSON.stringify({ documents: docs ?? [], dryRun: false })
    });
    if (import.meta.env.DEV) {
      console.debug('[NORAH API] norahIngest ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH API] norahIngest ❌', formatHttpError(error));
    }
    throw error;
  }
}

export async function norahEmbed(opts?: { reembed?: boolean; batch?: number }) {
  const payload = { reembed: !!opts?.reembed, batch: opts?.batch ?? 200 };
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahEmbed →', payload);
  }
  try {
    const result = await httpJson(NORAH_ROUTES.embed, {
      method: "POST",
      headers: norahHeaders(),
      body: JSON.stringify(payload)
    });
    if (import.meta.env.DEV) {
      console.debug('[NORAH API] norahEmbed ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH API] norahEmbed ❌', formatHttpError(error));
    }
    throw error;
  }
}

export async function norahSearch(query: string) {
  // Validate non-empty query client-side
  if (!query || !query.trim()) {
    if (import.meta.env.DEV) {
      console.warn('[NORAH API] norahSearch: empty query, skipping call');
    }
    return { ok: false, error: 'empty-query', results: [] };
  }

  const payload = { q: query.trim() };
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahSearch →', payload);
  }
  try {
    const result = await httpJson(NORAH_ROUTES.rag, {
      method: "POST",
      headers: norahHeaders(),
      body: JSON.stringify(payload)
    });
    if (import.meta.env.DEV) {
      console.debug('[NORAH API] norahSearch ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH API] norahSearch ❌', formatHttpError(error));
    }
    throw error;
  }
}

export async function norahKpis() {
  if (import.meta.env.DEV) {
    console.debug('[NORAH API] norahKpis → GET');
  }
  try {
    const result = await httpJson(NORAH_ROUTES.kpis, {
      method: "GET",
      headers: norahHeaders()
    });
    if (import.meta.env.DEV) {
      console.debug('[NORAH API] norahKpis ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH API] norahKpis ❌', formatHttpError(error));
    }
    throw error;
  }
}
