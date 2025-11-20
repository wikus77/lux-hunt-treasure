// @ts-nocheck
/**
 * © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Network Layer
 * POST via invoke, GET via fetch direto
 * NOTA: MANTIENE I LOGS BACKEND FUNZIONANTI (NON TOCCARE EDGE FUNCTIONS)
 */

import { supabase } from '@/integrations/supabase/client';
import type { IngestPayload, EmbedPayload, RagQuery, NorahKPIs } from "./types";
import { normalizeUuid, generateNormalizedUuid } from './normalizeUuid';
import { assertAllowedOrHint, getCurrentOrigin, isOriginAllowed } from './originGuard';

// === Helper comuni ===
const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('lovable');
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Origin hygiene check
function checkOrigin() {
  if (typeof window === 'undefined') return;
  const origin = getCurrentOrigin();
  if (!isOriginAllowed(origin)) {
    assertAllowedOrHint(origin);
    throw new Error('Origin not allowed for Norah Functions. Please use *.m1ssion.pages.dev');
  }
}

function getClientId(): string {
  // Stable, valid UUID persisted in localStorage
  try {
    const key = 'norah_cid';
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const valid = normalizeUuid(stored || '');
    if (valid) return valid;
    const fresh = generateNormalizedUuid();
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    // Fallback to a fresh UUID if localStorage is unavailable
    return generateNormalizedUuid();
  }
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
  // Origin hygiene check
  checkOrigin();
  
  const corr = getClientId();
  const cleanCid = normalizeUuid(corr) || corr;
  
  // Fail-fast: invalid UUID
  if (!cleanCid) {
    console.warn('[NORAH2] Invalid client_id (UUID), cannot call', fn);
    throw new Error('Invalid client_id (UUID)');
  }
  
  // Ensure UUID is always sent clean (no quotes)
  const headers = { 'x-norah-cid': cleanCid };
  
  // Fallback: include client_id in body as well
  const enrichedBody = { ...(body || {}), client_id: cleanCid };
  
  let delay = 250;
  
  // Debug mode logging
  if (typeof localStorage !== 'undefined' && localStorage.NORAH_DEBUG === '1') {
    console.debug('[NORAH] invokePOST call', {
      fn,
      phase,
      origin: window.location.origin,
      cid_raw: corr,
      cid_norm: cleanCid,
      bodyKeys: Object.keys(enrichedBody)
    });
  }
  
  // Telemetria utile in preview
  if (isPreview && import.meta.env.DEV) {
    console.log('[NORAH2]', phase || fn, { 
      cid: corr.slice(0, 8), 
      payloadSize: JSON.stringify(enrichedBody).length 
    });
  }
  
  for (let i = 0; i < 3; i++) {
    try {
      // Pacing in preview per evitare abort della sandbox
      if (isPreview && i > 0) await sleep(400);
      
      const { data, error } = await supabase.functions.invoke<T>(fn, { 
        body: enrichedBody, 
        headers 
      });
      if (error) throw error;
      
      // Debug mode response logging
      if (typeof localStorage !== 'undefined' && localStorage.NORAH_DEBUG === '1') {
        console.debug('[NORAH] invokePOST response', {
          fn,
          status: 'ok',
          preview: JSON.stringify(data).slice(0, 200)
        });
      }
      
      return data as T;
    } catch (e) {
      console.error(`[NORAH2 cid:${corr.slice(0, 8)}] ${fn} failed (attempt ${i+1}/3):`, (e as any)?.message || e);
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
  // Origin hygiene check
  checkOrigin();
  
  // Use centralized Supabase config
  const { functionsUrl, anonKey } = await import('@/lib/supabase/config').then(m => m.SUPABASE_CONFIG);
  const url = `${functionsUrl}/${path}`;
  const key = anonKey;
  const corr = getClientId();
  const cleanCid = normalizeUuid(corr) || corr;

  // Debug mode logging
  if (typeof localStorage !== 'undefined' && localStorage.NORAH_DEBUG === '1') {
    console.debug('[NORAH] getFunctionJSON call', {
      path,
      phase,
      base: functionsBase,
      origin: window.location.origin,
      cid_raw: corr,
      cid_norm: cleanCid
    });
  }

  // Telemetria utile in preview
  if (isPreview && import.meta.env.DEV) {
    console.log('[NORAH2]', phase || path, { cid: corr.slice(0, 8), method: 'GET', url });
  }

  let delay = 250;
  for (let i = 0; i < 3; i++) {
    try {
      if (isPreview && i > 0) await sleep(400);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'apikey': key,
          'authorization': `Bearer ${key}`,
          // Ensure UUID is always sent clean (no quotes)
          'x-norah-cid': cleanCid,
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
      
      const data = await res.json() as T;
      
      // Debug mode response logging
      if (typeof localStorage !== 'undefined' && localStorage.NORAH_DEBUG === '1') {
        console.debug('[NORAH] getFunctionJSON response', {
          path,
          status: res.status,
          preview: JSON.stringify(data).slice(0, 200)
        });
      }
      
      return data;
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
 * GET: norah-kpis (via fetch direto, baseline-compatible)
 */
export async function norahKpis(): Promise<NorahKPIs> {
  if (import.meta.env.DEV) {
    console.debug('[NORAH2] norahKpis → (GET via Functions domain)');
  }
  try {
    const data = await getFunctionJSON<NorahKPIs>('norah-kpis', 'kpi');
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
