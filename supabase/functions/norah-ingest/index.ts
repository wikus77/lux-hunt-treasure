// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { withCors, json, error } from "../_shared/cors.ts";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_ORIGINS = [/\.m1ssion\.pages\.dev$/i, /^localhost$/i, /^127\.0\.0\.1$/i];

function normalizeUuid(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  let cleaned = raw.trim()
    .replace(/^"+|"+$/g, '')
    .replace(/^'+|'+$/g, '')
    .trim();
  return UUID_REGEX.test(cleaned) ? cleaned : '';
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_ORIGINS.some(r => r.test(host));
  } catch { return false; }
}

async function hash8(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hashBuf = await crypto.subtle.digest('SHA-1', buf);
  const hex = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 8);
}

Deno.serve((req: Request) => withCors(req, async () => {
  const origin = req.headers.get('origin') ?? '';
  
  // Parse body once
  const bodyData = await req.json().catch(() => ({}));
  
  // CORS origin validation - return empty origin for disallowed domains
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : '';
  if (origin && !allowedOrigin) {
    console.warn(`⚠️ norah-ingest: origin not allowlisted: ${origin}`);
  }
  
  try {
    if (req.method !== "POST") {
      return error(allowedOrigin, "Only POST allowed", 405);
    }

    const { documents = [], dryRun = false, client_id } = bodyData;

    const rawHeader = req.headers.get('x-norah-cid') || '';
    const rawBody = client_id || '';
    const candidate = rawHeader || rawBody;
    const cid = normalizeUuid(candidate);
    
    if (!cid) {
      const h = await hash8(candidate || 'empty');
      const len = String(candidate).length;
      const regexMatch = UUID_REGEX.test(String(candidate));
      console.warn(`⚠️ norah-ingest: invalid_cid h=${h} len=${len} regex=${regexMatch} origin_ok=${isOriginAllowed(origin)}`);
      return error(allowedOrigin, 'invalid x-norah-cid/client_id', 400);
    }
    
    console.log(`📥 norah-ingest: cid=${cid.slice(0, 8)}, docs=${documents.length}, dryRun=${dryRun}`);
    
    if (!Array.isArray(documents)) {
      return error(allowedOrigin, "documents must be an array", 400);
    }

    if (documents.length === 0) {
      return json(allowedOrigin, { ok: true, inserted: 0, message: "No documents provided" });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!url || !key) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return error(allowedOrigin, "Server configuration error", 500);
    }

    if (dryRun) {
      return json(allowedOrigin, { ok: true, inserted: 0, dryRun: true, wouldInsert: documents.length });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    let inserted = 0;

    for (const doc of documents) {
      if (!doc.title || !doc.text) {
        console.warn("⚠️ Skipping doc without title or text:", doc);
        continue;
      }
      
      const { data, error: rpcError } = await supabase.rpc("upsert_ai_doc", {
        p_title: doc.title,
        p_text: doc.text,
        p_tags: doc.tags || [],
        p_source: doc.source || "manual",
        p_url: doc.url || null,
      });

      if (rpcError) {
        console.error("❌ upsert_ai_doc error:", rpcError);
      } else if (data) {
        inserted++;
      }
    }

    return json(allowedOrigin, { ok: true, inserted });
  } catch (e: any) {
    console.error("❌ norah-ingest error:", e);
    return error(allowedOrigin, String(e?.message || e), 500);
  }
}));
