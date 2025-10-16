// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { supabase } from "@/integrations/supabase/client";
import type { IngestPayload, EmbedPayload, RagQuery, NorahKPIs } from "./types";

// ============ SANDBOX ABORT FIX ============
// Lovable preview sandbox aborts concurrent fetch() → add pacing/retry
const isPreview = () => typeof window !== 'undefined' && window.location.hostname.includes('lovable');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for FunctionsFetchError (sandbox abort)
async function retryInvoke<T>(
  functionName: string,
  body: any,
  options: { maxRetries?: number; delay?: number; phase?: string } = {}
): Promise<T> {
  const { maxRetries = 3, delay = isPreview() ? 150 : 0, phase = 'default' } = options;
  
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0 && import.meta.env.DEV) {
        console.debug(`[NORAH2] Retry ${attempt}/${maxRetries} for ${functionName}`);
      }
      
      // Pacing between calls in preview to avoid sandbox abort
      if (delay > 0 && attempt > 0) {
        await sleep(delay * attempt); // exponential backoff
      }
      
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      if (error) throw error;
      return data as T;
    } catch (error: any) {
      lastError = error;
      
      // Only retry on FunctionsFetchError (sandbox abort)
      const isFetchError = error?.name === 'FunctionsFetchError' || error?.message?.includes('Failed to send');
      if (!isFetchError || attempt >= maxRetries) {
        throw error;
      }
      
      if (import.meta.env.DEV) {
        console.warn(`[NORAH2] ${functionName} fetch aborted (attempt ${attempt + 1}), retrying...`);
      }
    }
  }
  
  throw lastError;
}

export async function norahIngest(payload: IngestPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahIngest →', { docsCount: payload.documents?.length || 0, dryRun: payload.dryRun });
  }
  try {
    const data = await retryInvoke<any>('norah-ingest', payload, { phase: 'ingest', delay: isPreview() ? 150 : 0 });
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
    const data = await retryInvoke<any>('norah-embed', payload, { phase: 'embed', delay: isPreview() ? 300 : 0 });
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
    const data = await retryInvoke<any>('norah-rag-search', payload, { phase: 'search', delay: isPreview() ? 150 : 0 });
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
    const data = await retryInvoke<NorahKPIs>('norah-kpis', undefined, { phase: 'kpis', delay: isPreview() ? 100 : 0 });
    if (import.meta.env.DEV) {
      console.debug('[NORAH2] norahKpis ✅', data);
    }
    return data;
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
