// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { NORAH_ROUTES } from "@/lib/norahApi";
import { httpJson, formatHttpError } from "@/lib/httpJson";
import type { IngestPayload, EmbedPayload, RagQuery, NorahKPIs } from "./types";

const norahHeaders = () => ({
  "Content-Type": "application/json",
});

// Generic POST helper
async function postJSON<T>(path: string, body: any): Promise<T> {
  return httpJson(path, {
    method: "POST",
    headers: norahHeaders(),
    body: JSON.stringify(body)
  });
}

// Generic GET helper
async function getJSON<T>(path: string): Promise<T> {
  return httpJson(path, {
    method: "GET",
    headers: norahHeaders()
  });
}

export async function norahIngest(payload: IngestPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahIngest →', { docsCount: payload.documents?.length || 0, dryRun: payload.dryRun });
  }
  try {
    const result = await postJSON<any>(NORAH_ROUTES.ingest, payload);
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahIngest ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahIngest ❌', formatHttpError(error));
    }
    throw error;
  }
}

export async function norahEmbed(payload: EmbedPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahEmbed →', payload);
  }
  try {
    const result = await postJSON<any>(NORAH_ROUTES.embed, payload);
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahEmbed ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahEmbed ❌', formatHttpError(error));
    }
    throw error;
  }
}

export async function norahSearch(payload: RagQuery) {
  if (!payload.q || !payload.q.trim()) {
    if (import.meta.env.DEV) {
      console.warn('[NORAH2] norahSearch: empty query');
    }
    return { ok: false, error: 'empty-query', results: [] };
  }

  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahSearch →', payload);
  }
  try {
    const result = await postJSON<any>(NORAH_ROUTES.rag, payload);
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahSearch ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahSearch ❌', formatHttpError(error));
    }
    throw error;
  }
}

export async function norahKpis(): Promise<NorahKPIs> {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahKpis → GET');
  }
  try {
    const result = await getJSON<NorahKPIs>(NORAH_ROUTES.kpis);
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahKpis ✅', result);
    }
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahKpis ❌', formatHttpError(error));
    }
    throw error;
  }
}

/**
 * Download KPIs as JSON file
 */
export async function downloadKPIs() {
  const data = await norahKpis();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `norah-kpis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
