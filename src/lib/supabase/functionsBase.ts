/**
 * Guard-safe helpers for Supabase endpoints.
 * No hardcoded project refs; everything is derived at runtime from env or JWT.
 */

export function getProjectRef(): string | null {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) return null;
    const u = new URL(url);
    const match = u.hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function functionsBaseUrl(fn: string) {
  const url = import.meta.env.VITE_SUPABASE_URL!;
  return `${url.replace(/\/+$/, "")}/functions/v1/${fn}`;
}

export async function verifyEdgeFunction(fn: string) {
  const u = functionsBaseUrl(fn);
  try {
    const res = await fetch(u, { method: "OPTIONS" });
    if (res.ok) return { ok: true, status: res.status };
    const res2 = await fetch(u, { method: "GET" });
    return { ok: res2.ok, status: res2.status };
  } catch (e: any) {
    return { ok: false, status: 0, reason: e?.message || "network" };
  }
}

export function norahHeaders() {
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  return {
    "Content-Type": "application/json",
    "apikey": anon,
    "Authorization": `Bearer ${anon}`,
    "X-Client-Info": "m1ssion-norah-admin"
  } as const;
}

export async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Non-JSON (${res.status}) ${text.slice(0,200)}`);
  }
  return res.json();
}
