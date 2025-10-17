import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { cfEmbed } from "../_shared/cfEmbed.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const CF_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
const CF_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN");
const LOVABLE_CHAT_MODEL = Deno.env.get("LOVABLE_CHAT_MODEL") || "google/gemini-2.5-flash";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Req = { query: string; locale?: string; top_k?: number };

serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const { query, locale = "it", top_k = 3 } = (await req.json()) as Req;
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Embedding query using Cloudflare Workers AI (768d)
    const embedding = await cfEmbed(query);

    // 2) RAG search
    const { data: hits, error: rpcError } = await supabaseAdmin.rpc("ai_rag_search_vec", {
      query_embedding: embedding,
      match_count: top_k,
      in_locale: locale,
    });

    if (rpcError) throw new Error(`ai_rag_search_vec failed: ${rpcError.message}`);

    // Check if we have useful hits
    const usefulHits = (hits || []).filter((h: any) => h.distance < 0.8); // distance threshold
    
    if (usefulHits.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "Non trovo contenuti pertinenti nei documenti interni. Prova a riformulare o ad aggiungere materiale alla KB.",
          sources: [],
          provider: "none",
          rag_used: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3) Build context from chunks
    const contextChunks = usefulHits.slice(0, 5).map((h: any, i: number) => 
      `- ${h.title}#${h.chunk_idx}: "${h.chunk_text}"`
    ).join("\n");

    // 4) LLM prompt
    const systemPrompt = `Sei Norah AI, l'assistente intelligente di M1SSION.
Rispondi in italiano, in modo sintetico e operativo.
Usa SOLO il contesto fornito. Se le informazioni non sono presenti nel contesto, dillo chiaramente.
Concludi SEMPRE con 3 bullet points "Cosa fare ora" con azioni concrete.`;

    const userPrompt = `Contesto dai documenti interni:
${contextChunks}

Domanda dell'utente: ${query}

Rispondi in modo sintetico (150-250 parole), usando solo il contesto sopra.`;

    // 5) Call LLM (Lovable → Cloudflare fallback)
    let answer = "";
    let provider = "none";

    if (LOVABLE_API_KEY) {
      try {
        const lovableResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: LOVABLE_CHAT_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 400,
          }),
        });

        if (!lovableResp.ok) {
          const errText = await lovableResp.text();
          console.error("Lovable API error:", lovableResp.status, errText);
          throw new Error(`Lovable API failed: ${lovableResp.status}`);
        }

        const lovableData = await lovableResp.json();
        answer = lovableData.choices?.[0]?.message?.content || "";
        provider = "lovable";
      } catch (e) {
        console.error("Lovable fallback error:", e);
        // Fallback to Cloudflare
      }
    }

    // Cloudflare fallback
    if (!answer && CF_ACCOUNT_ID && CF_API_TOKEN) {
      try {
        const cfEndpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
        const cfResp = await fetch(cfEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 400,
          }),
        });

        if (!cfResp.ok) {
          const errText = await cfResp.text();
          console.error("Cloudflare API error:", cfResp.status, errText);
          throw new Error(`Cloudflare API failed: ${cfResp.status}`);
        }

        const cfData = await cfResp.json();
        answer = cfData.result?.response || "";
        provider = "cloudflare";
      } catch (e) {
        console.error("Cloudflare error:", e);
      }
    }

    if (!answer) {
      return new Response(
        JSON.stringify({
          answer: "Provider LLM non configurato. Configura LOVABLE_API_KEY o CLOUDFLARE credentials.",
          sources: [],
          provider: "none",
          rag_used: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6) Build sources
    const sources = usefulHits.slice(0, top_k).map((h: any) => ({
      title: h.title,
      doc_id: h.doc_id,
      chunk_idx: h.chunk_idx,
      snippet: h.chunk_text.slice(0, 160),
    }));

    // 7) Log to norah_events (best-effort)
    try {
      await supabaseAdmin.from("norah_events").insert([{
        event_type: "rag_answer",
        payload: {
          q: query,
          locale,
          top_k,
          hits: usefulHits.map((h: any) => ({ title: h.title, doc_id: h.doc_id, chunk_idx: h.chunk_idx })),
          provider,
        },
      }]);
    } catch (logErr) {
      console.warn("norah_events log error:", logErr);
    }

    return new Response(
      JSON.stringify({
        answer,
        sources,
        provider,
        rag_used: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("norah-answer error:", e);
    return new Response(
      JSON.stringify({ error: String(e?.message ?? e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
