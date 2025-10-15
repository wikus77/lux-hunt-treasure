/**
 * Guard-safe helpers for Supabase endpoints.
 * No hardcoded project refs; everything is derived at runtime from env or JWT.
 */
const cached: { ref?: string; fbase?: string } = {};

export function getProjectRef(): string | null {
  if (cached.ref) return cached.ref;
  
  // 1) Override diretto (opzionale)
  const explicit = import.meta.env.VITE_SUPABASE_PROJECT_REF as string | undefined;
  if (explicit && /^[a-z0-9]{20,}$/.test(explicit)) {
    cached.ref = explicit;
    return cached.ref;
  }
  
  // 2) Parsare da VITE_SUPABASE_URL: https://<ref>.supabase.co
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  try {
    if (url) {
      const u = new URL(url);
      const m = u.hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i);
      if (m && m[1]) {
        cached.ref = m[1];
        return cached.ref;
      }
    }
  } catch {}
  
  return null;
}

export function functionsBaseUrl(fn?: string): string {
  if (cached.fbase) return fn ? `${cached.fbase}/${fn}` : cached.fbase;
  
  // 1) Override esplicito (se presente)
  const explicit = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined;
  if (explicit) {
    const base = explicit.replace(/\/+$/,'');
    cached.fbase = base;
    return fn ? `${base}/${fn}` : base;
  }
  
  // 2) Costruzione da project ref
  const ref = getProjectRef();
  if (!ref) {
    // lascio stringa segnaposto: il chiamante mostrerà "No project ref"
    return fn ? `__NO_PROJECT_REF__/${fn}` : `__NO_PROJECT_REF__`;
  }
  
  const base = `https://${ref}.functions.supabase.co`;
  cached.fbase = base;
  return fn ? `${base}/${fn}` : base;
}

/** Optional: REST base (used by some utilities) */
export const restBaseUrl = (() => {
  const ref = getProjectRef();
  return ref ? `https://${ref}.supabase.co/rest/v1` : '';
})();

/**
 * Ping di salute: ritorna {ok,status} e ragione testuale per 404/403/CORS
 */
export async function verifyEdgeFunction(name: string) {
  const url = functionsBaseUrl(name);
  
  try {
    const r = await fetch(url, { method: 'OPTIONS' }).catch(() => null);
    if (r && r.ok) return { ok: true, status: r.status };
    
    // Prova GET/HEAD se OPTIONS non supportato
    const r2 = await fetch(url, { method: 'GET' }).catch(() => null);
    if (!r2) return { ok: false, status: 0, reason: 'network' };
    if (r2.status === 404) return { ok: false, status: 404, reason: 'not-deployed' };
    if (r2.status === 403 || r2.status === 401) return { ok: false, status: r2.status, reason: 'auth-or-cors' };
    
    return { ok: r2.ok, status: r2.status };
  } catch (e: any) {
    return { ok: false, status: 0, reason: e?.message || 'error' };
  }
}
