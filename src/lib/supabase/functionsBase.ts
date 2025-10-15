// Guard-safe. Niente modifiche a Push/Guard/SW.
// Costruisce la base URL delle Edge Functions e fornisce header + parser JSON sicuro.

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
