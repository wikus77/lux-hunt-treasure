/**
 * Guard-safe helpers for Supabase endpoints.
 * No hardcoded project refs; everything is derived at runtime from env or JWT.
 */
function tryParseRefFromUrl(u: string | undefined): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    const host = url.hostname; // <ref>.supabase.co or <ref>.functions.supabase.co
    const parts = host.split('.');
    // handle "ref.supabase.co" and "ref.functions.supabase.co"
    const ref = parts[0] || '';
    return ref || null;
  } catch {
    return null;
  }
}

function base64urlToJson(b64: string): any | null {
  try {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const str = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(str);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Exported: used across the app */
export function getProjectRef(): string {
  // 1) From VITE_SUPABASE_URL (preferred)
  const viteUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
  const fromViteUrl = tryParseRefFromUrl(viteUrl);
  if (fromViteUrl) return fromViteUrl;

  // 2) From VITE_SUPABASE_ANON_KEY (iss claim)
  const anon = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (anon && anon.includes('.')) {
    const parts = anon.split('.');
    if (parts.length >= 2) {
      const payload = base64urlToJson(parts[1]);
      const iss = payload?.iss as string | undefined; // e.g., https://<ref>.supabase.co
      const fromIss = tryParseRefFromUrl(iss);
      if (fromIss) return fromIss;
    }
  }

  // 3) From a global (legacy) window var, if present
  if (typeof window !== 'undefined') {
    const maybe = (window as any)?.SUPABASE_URL as string | undefined;
    const fromWin = tryParseRefFromUrl(maybe);
    if (fromWin) return fromWin;
  }

  // 4) Last resort: empty string (call sites should handle gracefully)
  return '';
}

const _ref = getProjectRef();

/** Canonical Functions base URL (empty string if ref is unknown at runtime) */
export const functionsBaseUrl = _ref ? `https://${_ref}.supabase.co/functions/v1` : '';

/** Optional: REST base (used by some utilities) */
export const restBaseUrl = _ref ? `https://${_ref}.supabase.co/rest/v1` : '';
