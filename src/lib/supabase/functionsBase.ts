// Guard-safe. Niente modifiche a Push/Guard/SW.
// Costruisce la base URL delle Edge Functions e fornisce header + parser JSON sicuro.

const cached: { ref?: string } = {};

export function getProjectRef(): string | null {
  if (cached.ref) return cached.ref;
  
  const explicit = import.meta.env.VITE_SUPABASE_PROJECT_REF as string | undefined;
  if (explicit && /^[a-z0-9]{20,}$/.test(explicit)) {
    cached.ref = explicit;
    return cached.ref;
  }
  
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

export function functionsBaseUrl(fn: string) {
  const url = import.meta.env.VITE_SUPABASE_URL!;
  return `${url.replace(/\/+$/, '')}/functions/v1/${fn}`;
}

export function norahHeaders() {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  return {
    'Content-Type': 'application/json',
    'apikey': anon,
    'Authorization': `Bearer ${anon}`,
    'X-Client-Info': 'norah-admin',
  } as const;
}

export async function safeJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Non-JSON (${res.status}) ${text.slice(0,200)}`);
  }
  return res.json();
}

export async function verifyEdgeFunction(fn: string) {
  const u = functionsBaseUrl(fn);
  
  try {
    const head = await fetch(u, { method: "HEAD" });
    if (head.ok) return { ok: true, code: head.status };
  } catch {}
  
  try {
    const get = await fetch(u, { method: "GET" });
    return { ok: get.ok || get.status === 405, code: get.status };
  } catch (e: any) {
    return { ok: false, code: 0, error: String(e) };
  }
}
