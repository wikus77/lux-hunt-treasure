/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Network Layer
 * POST via invoke, GET via fetch direto
 * NOTA: MANTIENE I LOGS BACKEND FUNZIONANTI (NON TOCCARE EDGE FUNCTIONS)
 */

import { supabase } from '@/integrations/supabase/client';
import type { IngestPayload, EmbedPayload, RagQuery, NorahKPIs } from "./types";

// === Helper comuni ===
const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('lovable');
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function cid() { 
  return crypto.randomUUID().slice(0, 8); 
}

function isRetryable(err: unknown) {
  const msg = String((err as any)?.message ?? err ?? '').toLowerCase();
  return [
    'failed to fetch',
    'failed to send',
    'networkerror',
    'aborterror',
    'operation was aborted',
    'network request failed'
  ].some(s => msg.includes(s));
}

// === POST via invoke (con retry/backoff robusto) ===
async function invokePOST<T>(fn: string, body?: any, phase?: string): Promise<T> {
  const corr = cid();
  const headers = { 'x-norah-cid': corr };
  let delay = 250;
  
  // Telemetria utile in preview
  if (isPreview && import.meta.env.DEV) {
    console.log('[NORAH2]', phase || fn, { 
      cid: corr, 
      payloadSize: JSON.stringify(body ?? {}).length 
    });
  }
  
  for (let i = 0; i < 3; i++) {
    try {
      // Pacing in preview per evitare abort della sandbox
      if (isPreview && i > 0) await sleep(150);
      
      const { data, error } = await supabase.functions.invoke<T>(fn, { body, headers });
      if (error) throw error;
      return data as T;
    } catch (e) {
      console.error(`[NORAH2 cid:${corr}] ${fn} failed (attempt ${i+1}/3):`, (e as any)?.message || e);
      if (!isRetryable(e) || i === 2) {
        console.error(`[NORAH2] ${fn} ❌`, e);
        throw e;
      }
      await sleep(delay); 
      delay = Math.min(delay * 2, 800);
    }
  }
  throw new Error(`invokePOST fellthrough: ${fn}`);
}

// === GET via fetch directo (fix 405) ===
async function getFunctionJSON<T>(path: string, phase?: string): Promise<T> {
  // Prefer dedicated Functions domain to avoid CORS header duplication
  const supaUrl: string = (import.meta as any).env?.VITE_SUPABASE_URL?.trim()?.replace(/\/+$/, '') || '';
  const functionsBase = supaUrl ? supaUrl.replace('.supabase.co', '.functions.supabase.co') : '';
  const url = `${functionsBase}/${path}`;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const corr = cid();

  // Telemetria utile in preview
  if (isPreview && import.meta.env.DEV) {
    console.log('[NORAH2]', phase || path, { cid: corr, method: 'GET', url });
  }

  let delay = 250;
  for (let i = 0; i < 3; i++) {
    try {
      if (isPreview && i > 0) await sleep(150);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'apikey': key,
          'authorization': `Bearer ${key}`,
          'x-norah-cid': corr,
          'cache-control': 'no-store',
          'pragma': 'no-cache',
        },
        keepalive: true,
        mode: 'cors',
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      
      return await res.json() as T;
    } catch (e) {
      console.error(`[NORAH2 cid:${corr}] ${path} failed (attempt ${i+1}/3):`, (e as any)?.message || e);
      if (!isRetryable(e) || i === 2) {
        console.error(`[NORAH2] ${path} ❌`, e);
        throw e;
      }
      await sleep(delay); 
      delay = Math.min(delay * 2, 800);
    }
  }
  throw new Error(`getFunctionJSON fellthrough: ${path}`);
}

// === API Exports ===

/**
 * POST: norah-ingest
 */
export async function norahIngest(payload: IngestPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahIngest →', { docsCount: payload.documents?.length || 0, dryRun: payload.dryRun });
  }
  try {
    const data = await invokePOST<any>('norah-ingest', payload, 'ingest');
    if (import.meta.env.DEV) console.debug('[NORAH2] norahIngest ✅', data);
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('[NORAH2] norahIngest ❌', error?.message || error);
    throw error;
  }
}

/**
 * POST: norah-embed
 */
export async function norahEmbed(payload: EmbedPayload) {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahEmbed →', payload);
  }
  try {
    const data = await invokePOST<any>('norah-embed', payload, 'embed');
    if (import.meta.env.DEV) console.debug('[NORAH2] norahEmbed ✅', data);
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('[NORAH2] norahEmbed ❌', error?.message || error);
    throw error;
  }
}

/**
 * POST: norah-rag-search (con compat hits/results)
 */
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
    const data = await invokePOST<any>('norah-rag-search', payload, 'rag');
    
    // Normalizza hits/results per compat
    if (data?.results && !data?.hits) data.hits = data.results;
    
    if (import.meta.env.DEV) console.debug('[NORAH2] norahSearch ✅', data);
    return data;
  } catch (error: any) {
    if (import.meta.env.DEV) console.error('[NORAH2] norahSearch ❌', error?.message || error);
    throw error;
  }
}

/**
 * GET: norah-kpis (era 405 con POST, ora fetch directo)
 */
export async function norahKpis(): Promise<NorahKPIs> {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahKpis →');
  }
  try {
    const data = await getFunctionJSON<NorahKPIs>('norah-kpis', 'kpis');
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
