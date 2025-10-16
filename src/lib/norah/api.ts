// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { supabase } from "@/integrations/supabase/client";
import type { IngestPayload, EmbedPayload, RagQuery, NorahKPIs } from "./types";

export async function norahIngest(payload: IngestPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahIngest →', { docsCount: payload.documents?.length || 0, dryRun: payload.dryRun });
  }
  try {
    const { data, error } = await supabase.functions.invoke('norah-ingest', { body: payload });
    if (error) throw error;
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahIngest ✅', data);
    }
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahIngest ❌', error?.message || error);
    }
    throw error;
  }
}

export async function norahEmbed(payload: EmbedPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahEmbed →', payload);
  }
  try {
    const { data, error } = await supabase.functions.invoke('norah-embed', { body: payload });
    if (error) throw error;
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahEmbed ✅', data);
    }
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahEmbed ❌', error?.message || error);
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
    const { data, error } = await supabase.functions.invoke('norah-rag-search', { body: payload });
    if (error) throw error;
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahSearch ✅', data);
    }
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahSearch ❌', error?.message || error);
    }
    throw error;
  }
}

export async function norahKpis(): Promise<NorahKPIs> {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahKpis → GET');
  }
  try {
    const { data, error } = await supabase.functions.invoke('norah-kpis');
    if (error) throw error;
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahKpis ✅', data);
    }
    return data as NorahKPIs;
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[NORAH2] norahKpis ❌', error?.message || error);
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
