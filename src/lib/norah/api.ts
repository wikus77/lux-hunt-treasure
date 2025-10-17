// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah AI API client utilities

import { supabase } from "@/integrations/supabase/client";
import { functionsBaseUrl, norahHeaders } from "@/lib/supabase/functionsBase";
import type { IngestPayload, EmbedPayload, RagQuery, NorahKPIs } from "./types";

// ============ SANDBOX ABORT FIX ============
// Lovable preview sandbox aborts concurrent fetch() → add pacing/retry
const isPreview = () => typeof window !== 'undefined' && (window.location.hostname.includes('lovable') || import.meta.env.MODE === 'development');

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for FunctionsFetchError (sandbox abort) + network errors
async function retryInvoke<T>(
  functionName: string,
  body: any,
  options: { maxRetries?: number; method?: 'POST' | 'GET'; phase?: string } = {}
): Promise<T> {
  const { maxRetries = 3, method = 'POST', phase = 'default' } = options;
  const cid = crypto.randomUUID().slice(0, 8); // Correlation ID for logs
  
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0 && import.meta.env.DEV) {
        console.debug(`[NORAH2 cid:${cid}] Retry ${attempt}/${maxRetries} for ${functionName}`);
      }
      
      // Exponential backoff: 250ms → 500ms → 800ms in preview
      if (attempt > 0 && isPreview()) {
        const backoff = [0, 250, 500, 800][attempt] || 800;
        await sleep(backoff);
      }
      
      const invokeOptions: any = method === 'GET'
        ? { headers: { 'x-norah-cid': cid } }
        : { body, headers: { 'x-norah-cid': cid } };
      const { data, error } = await supabase.functions.invoke(functionName, invokeOptions);
      
      if (error) throw error;
      
      if (import.meta.env.DEV && attempt > 0) {
        console.debug(`[NORAH2 cid:${cid}] ${functionName} succeeded after ${attempt} retries`);
      }
      
      return data as T;
    } catch (error: any) {
      lastError = error;
      
      // Retry on sandbox abort errors + network failures
      const errorMsg = error?.message?.toLowerCase() || '';
      const isFetchError = 
        error?.name === 'FunctionsFetchError' ||
        error?.name === 'FunctionsRelayError' ||
        errorMsg.includes('failed to send') ||
        errorMsg.includes('failed to fetch') ||
        errorMsg.includes('fetch failed') ||
        errorMsg.includes('networkerror') ||
        errorMsg.includes('aborterror') ||
        errorMsg.includes('operation was aborted') ||
        errorMsg.includes('network request failed');
      
      if (!isFetchError || attempt >= maxRetries) {
        if (import.meta.env.DEV) {
          console.error(`[NORAH2 cid:${cid}] ${functionName} failed after ${attempt + 1} attempts:`, error?.message || error);
        }
        throw error;
      }
      
      if (import.meta.env.DEV) {
        console.warn(`[NORAH2 cid:${cid}] ${functionName} fetch aborted (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
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
    const data = await retryInvoke<any>('norah-ingest', payload, { phase: 'ingest' });
    if (import.meta.env.DEV) console.debug('[NORAH2] norahIngest ✅', data);
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('[NORAH2] norahIngest ❌', error?.message || error);
    throw error;
  }
}

export async function norahEmbed(payload: EmbedPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahEmbed →', payload);
  }
  try {
    const data = await retryInvoke<any>('norah-embed', payload, { phase: 'embed' });
    if (import.meta.env.DEV) console.debug('[NORAH2] norahEmbed ✅', data);
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('[NORAH2] norahEmbed ❌', error?.message || error);
    throw error;
  }
}

export async function norahSearch(payload: RagQuery) {
  if (!payload.q || !payload.q.trim()) {
    if (import.meta.env.DEV) {
      console.warn('[NORAH2] norahSearch: empty query');
    }
    return { ok: false, error: 'empty-query', results: [], hits: [] };
  }

  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahSearch →', payload);
  }
  try {
    const data = await retryInvoke<any>('norah-rag-search', payload, { phase: 'search' });
    
    // Normalize results → hits for backward compatibility
    if (data.results && !data.hits) {
      data.hits = data.results;
    }
    
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
    console.debug('[NORAH2] norahKpis →');
  }
  try {
    const data = await retryInvoke<NorahKPIs>('norah-kpis', {}, { method: 'GET', phase: 'kpis' });
    if (import.meta.env.DEV) console.debug('[NORAH2] norahKpis ✅', data);
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('[NORAH2] norahKpis ❌', error?.message || error);
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
