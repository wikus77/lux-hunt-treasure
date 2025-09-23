// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

/**
 * Cloudflare Pages Function: Stripe Webhook (raw-body + HMAC verifica)
 *
 * VINCOLI:
 * - Nessuna modifica alla catena push blindata
 * - Nessuna parte riconducibile o appartenente a Lovable
 * - Tutto PWA ready
 * - Codice completamente firmato
 */

type Verified =
  | { ok: true; event: any }
  | { ok: false; status: number; message: string };

function parseStripeSigHeader(sig: string | null): { t: string; v1s: string[] } | null {
  if (!sig) return null;
  let t = "";
  const v1s: string[] = [];
  for (const part of sig.split(",")) {
    const [k, v] = part.split("=");
    if (k === "t") t = v;
    if (k === "v1" && v) v1s.push(v);
  }
  return t && v1s.length ? { t, v1s } : null;
}

async function hmacSHA256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const bytes = new Uint8Array(sigBuf);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyStripeSignature(secret: string, header: string | null, rawBody: string): Promise<Verified> {
  const parsed = parseStripeSigHeader(header);
  if (!parsed) {
    return { ok: false, status: 400, message: "Missing or invalid Stripe-Signature header" };
  }
  const signedPayload = `${parsed.t}.${rawBody}`;
  const expected = await hmacSHA256Hex(secret, signedPayload);

  // Confronta contro TUTTI i v1 presenti
  if (!parsed.v1s.some(v => v === expected)) {
    return { ok: false, status: 400, message: "Signature mismatch" };
  }

  try {
    const event = JSON.parse(rawBody);
    return { ok: true, event };
  } catch {
    return { ok: false, status: 400, message: "Invalid JSON payload" };
  }
}

export const onRequestPost: PagesFunction<{ STRIPE_WEBHOOK_SECRET: string }> = async (ctx) => {
  try {
    const secret = ctx.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_WEBHOOK_SECRET" }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }

    // RAW body: NON usare request.json()
    const rawBody = await ctx.request.text();
    const sigHeader = ctx.request.headers.get("stripe-signature");

    const verified = await verifyStripeSignature(secret, sigHeader, rawBody);
    if (!("ok" in verified) || !verified.ok) {
      console.error("Stripe webhook verify failed:", verified.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: verified.status, headers: { "content-type": "application/json" } }
      );
    }

    const event = verified.event;

    switch (event.type) {
      case "checkout.session.completed": {
        console.log("✅ checkout.session.completed:", event.data?.object?.id);
        break;
      }
      case "payment_intent.succeeded": {
        console.log("✅ payment_intent.succeeded:", event.data?.object?.id);
        break;
      }
      default:
        console.log("ℹ️ Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err: any) {
    console.error("Stripe webhook fatal error:", err?.message || err);
    return new Response(JSON.stringify({ error: "Webhook handler error" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
};
