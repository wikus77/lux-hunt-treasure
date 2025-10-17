// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors, json, error } from "../_shared/cors.ts";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ORIGINS = [/\.m1ssion\.pages\.dev$/i, /^localhost$/i];

function normalizeUuid(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  let cleaned = raw.trim()
    .replace(/^"+|"+$/g, '')
    .replace(/^'+|'+$/g, '')
    .trim();
  return UUID_REGEX.test(cleaned) ? cleaned : '';
}

function isOriginAllowed(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_ORIGINS.some(r => r.test(host));
  } catch { return false; }
}

Deno.serve((req: Request) => withCors(req, async () => {
  const origin = req.headers.get('origin') ?? '';
  
  // CORS origin validation
  if (origin && !isOriginAllowed(origin)) {
    console.warn(`⚠️ norah-kpis: origin not allowlisted: ${origin}`);
  }
  
  // Sanitize + validate x-norah-cid (optional for KPIs GET)
  const rawCid = req.headers.get('x-norah-cid') || '';
  const cid = normalizeUuid(rawCid);
  
  if (cid) {
    console.log(`📊 norah-kpis: cid=${cid.slice(0, 8)}`);
  } else {
    console.log(`📊 norah-kpis: no cid (optional for GET)`);
  }
  
  try {
    if (req.method !== "GET") {
      return error(origin, "Only GET allowed", 405);
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!url || !key) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return error(origin, "Server configuration error", 500);
    }

    const admin = createClient(url, key, { auth: { persistSession: false } });

    // Count documents
    const { count: docs } = await admin
      .from("ai_docs")
      .select("id", { count: "exact", head: true });

    // Count embeddings
    const { count: embs } = await admin
      .from("ai_docs_embeddings")
      .select("id", { count: "exact", head: true });

    // Last embed timestamp
    const { data: last } = await admin
      .from("ai_docs_embeddings")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const body = {
      ok: true,
      documents: docs ?? 0,
      embeddings: embs ?? 0,
      last_embed_at: last?.created_at ?? "1970-01-01T00:00:00Z",
    };

    return json(origin, body);
  } catch (e: any) {
    console.error("❌ norah-kpis error:", e);
    return error(origin, String(e?.message || e), 500);
  }
}));
