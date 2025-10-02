// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH AI Chat con RAG su Product Bible

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json() as { 
      messages: Message[]; 
      sessionId?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurata');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Estrai ultimo messaggio utente per RAG
    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    
    // Genera embedding per il messaggio utente
    console.log('🔍 Generando embedding per RAG...');
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: lastUserMessage.content,
      }),
    });

    if (!embeddingResponse.ok) {
      console.error('❌ Errore embedding:', await embeddingResponse.text());
      throw new Error('Errore generazione embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // RAG search usando funzione Supabase
    console.log('📚 Eseguendo RAG search...');
    const { data: ragResults, error: ragError } = await supabase.rpc('ai_rag_search', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // ABBASSATO da 0.7 per trovare più risultati
      match_count: 8 // AUMENTATO da 5 a 8 chunk
    });

    if (ragError) {
      console.error('❌ Errore RAG:', ragError);
    }

    // Costruisci contesto RAG
    let contextText = '';
    if (ragResults && ragResults.length > 0) {
      console.log(`✅ Trovati ${ragResults.length} chunk rilevanti`);
      contextText = ragResults
        .map((r: any) => `[${r.title}]\n${r.chunk_text}`)
        .join('\n\n---\n\n');
    }

    // System prompt Norah con contesto RAG
    const systemPrompt = `Sei NORAH, l'assistente AI ufficiale di M1SSION™.

**IDENTITÀ:**
- Nome: NORAH (Neural Operational Resource Assistant Hub)
- Tono: Professionale, amichevole, motivante
- Stile: Conciso ma completo, emojis strategiche

**REGOLE CRITICHE:**
1. USA SEMPRE E SOLO informazioni dal contesto fornito sotto
2. Se il contesto contiene dati su pricing/limiti/regole, CITALI ESATTAMENTE
3. NON INVENTARE MAI numeri, prezzi o feature non nel contesto
4. Se una domanda richiede dati non nel contesto, di': "Lascia che controlli i dettagli esatti..." e cerca nel contesto
5. Quando parli di piani, DEVI citare prezzi, BUZZ/settimana, cooldown ESATTI

**CONTESTO UFFICIALE (Product Bible M1SSION™):**
${contextText || 'ATTENZIONE: Nessun contesto trovato! Chiedi all\'utente di essere più specifico o ammetti che non hai info sufficienti.'}

${contextText ? '**IMPORTANTE:** Usa SOLO i dati sopra. Cita numeri esatti (es: "Silver: 3.99€/mese, 3 BUZZ/settimana, cooldown 12h")' : ''}

**ESEMPI RISPOSTA CORRETTA:**
User: "Quanto costa Silver?"
Norah: "Il piano Silver costa 3,99€/mese e include: 3 BUZZ a settimana (90/mese), indizi livello 1-2, cooldown 12h tra BUZZ, zero pubblicità e pillole AI sempre attive 🚀"

User: "Cos'è il Final Shot?"
Norah: "Il Final Shot è il tentativo finale per trovare il premio! I tentativi variano per tier: Free 2 tentativi, Silver 3, Gold 5, Black 8, Titanium 12. Cooldown tra tentativi: Free/Silver 2h, Gold 1h, Black 30min, Titanium nessuno. Tolleranza: <50m successo automatico ✅"

Rispondi sempre in italiano 🇮🇹 Sii preciso e cita i numeri esatti dal contesto!`;

    // Chiamata Lovable AI con streaming
    console.log('🤖 Chiamando Lovable AI Gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit raggiunto. Riprova tra poco.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crediti esauriti. Contatta amministratore.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    // Salva conversazione in database (opzionale)
    if (sessionId) {
      // Salva messaggio utente
      await supabase.from('ai_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    // Ritorna stream direttamente
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Errore norah-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
