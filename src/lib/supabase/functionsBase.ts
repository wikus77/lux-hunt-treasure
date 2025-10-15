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

/**
 * Helper to extract project ref from URL
 */
export function projectRefFromUrl(s: string): string {
  try {
    return new URL(s).hostname.split('.')[0];
  } catch {
    return '';
  }
}

/**
 * Construct functions base URL - always use /functions/v1/<fn> pattern
 */
export function functionsBaseUrl(fn: string): string {
  const url = import.meta.env.VITE_SUPABASE_URL!;
  const base = url.replace(/\/+$/, "");
  return `${base}/functions/v1/${fn}`;
}

export function norahHeaders() {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  return {
    "Content-Type": "application/json",
    "apikey": anon,
    "Authorization": `Bearer ${anon}`,
    "X-Client-Info": "m1ssion-norah-admin",
  } as const;
}

export async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON (${res.status}) ${text?.slice(0,200)}`);
  }
  return res.json();
}

/** Optional: REST base (used by some utilities) */
export const restBaseUrl = (() => {
  const ref = getProjectRef();
  return ref ? `https://${ref}.supabase.co/rest/v1` : '';
})();

/**
 * Verify edge function availability with HEAD/GET fallback
 */
export async function verifyEdgeFunction(fn: string) {
  const u = functionsBaseUrl(fn);
  
  // HEAD first (cheap), then OPTIONS to ensure CORS path exists
  try {
    const head = await fetch(u, { method: "HEAD" });
    if (head.ok) return { ok: true, code: head.status };
  } catch {}
  
  // fallback GET (must return JSON or 405)
  try {
    const get = await fetch(u, { method: "GET" });
    return { ok: get.ok || get.status === 405, code: get.status };
  } catch (e: any) {
    return { ok: false, code: 0, error: String(e) };
  }
}
