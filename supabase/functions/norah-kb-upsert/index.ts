// supabase/functions/norah-kb-upsert/index.ts
import { preflight, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // CORS preflight
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const raw = await req.text();              // leggo raw per debug
    let body: any = null;
    try {
      body = raw ? JSON.parse(raw) : null;     // provo a parsare JSON
    } catch {
      // se arriva stringa non JSON, body resta null
    }

    // Supporta due forme: {docs:[...]} oppure direttamente [...]
    const docs =
      Array.isArray(body) ? body :
      Array.isArray(body?.docs) ? body.docs :
      null;

    if (!Array.isArray(docs)) {
      console.error("[kb-upsert] bad_body raw:", raw?.slice(0, 500));
      return json(400, { error: "bad_body", hint: "send { docs: [...] } or [...]", receivedPreview: raw?.slice(0, 200) });
    }

    // TODO: qui metti il tuo upsert reale su table/storage
    console.info("[kb-upsert] upserting docs:", docs.length);

    return json(200, { ok: true, count: docs.length });
  } catch (e) {
    console.error("[kb-upsert] server_error:", e);
    return json(500, { error: "server_error" });
  }
});
