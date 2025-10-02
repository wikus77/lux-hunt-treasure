// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Popola knowledge base con Product Bible + genera embeddings

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurata');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('📚 Inizio popolamento knowledge base...');

    // Documenti Product Bible da caricare
    const documents = [
      {
        title: 'Subscription Tiers',
        category: 'product',
        file_path: 'ai_docs/product/subscriptions.md',
      },
      {
        title: 'BUZZ & BUZZ Map',
        category: 'product',
        file_path: 'ai_docs/product/buzz-and-map.md',
      },
      {
        title: 'Final Shot Rules',
        category: 'product',
        file_path: 'ai_docs/product/final-shot.md',
      },
      {
        title: 'Policies',
        category: 'product',
        file_path: 'ai_docs/product/policies.md',
      },
      {
        title: 'Engagement Nudges',
        category: 'engagement',
        file_path: 'ai_docs/engagement/nudges.yml',
      },
    ];

    let processedDocs = 0;
    let processedChunks = 0;

    for (const doc of documents) {
      console.log(`📄 Processing: ${doc.title}`);
      
      // Inserisci o aggiorna documento
      const { data: existingDoc } = await supabase
        .from('ai_docs')
        .select('id')
        .eq('title', doc.title)
        .maybeSingle();

      let docId: string;

      if (existingDoc) {
        docId = existingDoc.id;
        await supabase
          .from('ai_docs')
          .update({ category: doc.category, updated_at: new Date().toISOString() })
          .eq('id', docId);
        console.log(`  ♻️ Aggiornato documento esistente`);
      } else {
        const { data: newDoc, error: insertError } = await supabase
          .from('ai_docs')
          .insert({ title: doc.title, category: doc.category })
          .select('id')
          .single();
        
        if (insertError || !newDoc) {
          console.error(`  ❌ Errore insert documento:`, insertError);
          continue;
        }
        docId = newDoc.id;
        console.log(`  ✅ Creato nuovo documento`);
      }

      // Genera chunks basati sul contenuto compilato
      const chunks = generateChunksForDoc(doc);

      // Cancella vecchi embeddings
      await supabase
        .from('ai_docs_embeddings')
        .delete()
        .eq('doc_id', docId);

      // Genera embeddings per ogni chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        console.log(`  🔍 Generando embedding chunk ${i + 1}/${chunks.length}...`);
        
        const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: chunk,
          }),
        });

        if (!embeddingResponse.ok) {
          console.error(`  ❌ Errore embedding chunk ${i + 1}`);
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Inserisci embedding
        const { error: embError } = await supabase
          .from('ai_docs_embeddings')
          .insert({
            doc_id: docId,
            chunk_text: chunk,
            chunk_index: i,
            embedding: embedding,
          });

        if (embError) {
          console.error(`  ❌ Errore insert embedding:`, embError);
        } else {
          processedChunks++;
        }
      }

      processedDocs++;
      console.log(`  ✅ Processato documento con ${chunks.length} chunks`);
    }

    console.log(`\n✅ COMPLETATO: ${processedDocs} documenti, ${processedChunks} chunks`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentsProcessed: processedDocs,
        chunksProcessed: processedChunks 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Errore populate-knowledge-base:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper per generare chunks da documento
function generateChunksForDoc(doc: any): string[] {
  if (doc.title === 'Subscription Tiers') {
    return [
      `M1SSION™ offre 5 tier di abbonamento:\n\nFREE (0€): 1 BUZZ/settimana (30/mese), nessun BUZZ Map, solo indizi livello 1, pubblicità attive, cooldown 24h.\n\nSILVER (3.99€/mese): 3 BUZZ/settimana (90/mese), indizi livello 1-2, cooldown 12h, zero pubblicità, pillole AI Norah.\n\nGOLD (6.99€/mese): 4 BUZZ/settimana (150/mese), Final Shot a metà missione, indizi livello 1-3, cooldown 8h, memoria AI breve.\n\nBLACK (9.99€/mese): 5 BUZZ/settimana (200/mese), 1 BUZZ Map/mese, Final Shot sempre disponibile, indizi livello 1-4, cooldown 4h, memoria AI completa, mappe quasi real-time.\n\nTITANIUM (29.99€/mese): 7 BUZZ/settimana senza cooldown, 2 BUZZ Map/mese, Final Shot potenziato AI, indizi completi 1-5, memoria AI predittiva, mappe real-time, concierge 24/7.`,
      
      `CONFRONTO RAPIDO PIANI:\n- Prezzo: Free 0€ | Silver 3.99€ | Gold 6.99€ | Black 9.99€ | Titanium 29.99€\n- BUZZ/settimana: 1 | 3 | 4 | 5 | 7\n- BUZZ Map/mese: 0 | 0 | 0 | 1 | 2\n- Cooldown: 24h | 12h | 8h | 4h | Nessuno\n- Indizi: Lv1 | Lv1-2 | Lv1-3 | Lv1-4 | Lv1-5\n- Memoria AI: No | No | Breve | Completa | Predittiva\n- Supporto: FAQ | Email | Live chat | Chat priority | Concierge 24/7`,
      
      `UPGRADE PATHS:\nFree→Silver: Trigger quando utente esaurisce BUZZ settimanali o vede troppe pubblicità. Messaggio: "3 BUZZ/settimana + zero pubblicità + pillole AI per 3.99€/mese".\n\nSilver→Gold: Trigger quando power user usa tutti i 3 BUZZ. Messaggio: "4 BUZZ/settimana + Final Shot a metà missione per 6.99€/mese".\n\nGold→Black: Trigger quando utente vuole BUZZ Map. Messaggio: "5 BUZZ + 1 BUZZ Map/mese + memoria AI completa per 9.99€/mese".\n\nBlack→Titanium: Trigger dopo uso BUZZ Map o 60+ giorni daily active. Messaggio: "7 BUZZ senza cooldown + 2 BUZZ Map + AI predittiva per 29.99€/mese".`,
    ];
  }

  if (doc.title === 'BUZZ & BUZZ Map') {
    return [
      `BUZZ è un'azione attiva geolocalizzata che sblocca indizi e aree. Gratuito incluso nel piano. Raggio scansione: 2 km standard. Cooldown varia per tier: Free 24h, Silver 12h, Gold 8h, Black 4h, Titanium nessuno. GPS obbligatorio con tolerance 100m. Rate limiting: max 7 BUZZ/settimana (Titanium). Rilevamento GPS fake attivo con ban progressivo.`,
      
      `BUZZ MAP è azione contestuale dalla mappa con visualizzazione immediata aree/premi sbloccati. Disponibile SOLO per Black (1/mese) e Titanium (2/mese). Primo BUZZ Map: 500 km raggio a €4.99 fisso. Progressione: raggio = 500 - (N_buzz_map × 50) con minimo 50 km. Esempi: 1° BUZZ Map 500km, 2° 450km, 3° 400km... 10° 50km (poi resta 50km). Cooldown: Black 30 giorni, Titanium 15 giorni tra BUZZ Map.`,
      
      `ANTI-ABUSO: Rate limiting per tier (Free 1/sett, Silver 3/sett, Gold 4/sett, Black 5/sett, Titanium 7/sett). GPS verification obbligatoria tolerance 100m. Mock GPS detection attivo via accuracy check. Sanzioni progressive: 1° warning, 2° ban 24h, 3° ban 7gg, 4° ban permanente. Location jump >100 km in <1 min = suspicious. BUZZ frequency >7/settimana = blocked.`,
    ];
  }

  if (doc.title === 'Final Shot Rules') {
    return [
      `FINAL SHOT è il tentativo finale di claim premio. Requisiti: minimo 1 indizio sbloccato, GPS attivo. Disponibilità per tier: Free/Silver sempre disponibile, Gold da metà missione, Black/Titanium sempre. Tentativi per missione: Free 2, Silver 3, Gold 5, Black 8, Titanium 12. Cooldown tra tentativi: Free/Silver 2h, Gold 1h, Black 30min, Titanium nessuno. Gratuito incluso nel piano.`,
      
      `VERIFICA SUCCESSO: Distanza da coordinate esatte premio. Tolleranza: <50m successo automatico, 50-100m review manuale admin. GPS accuracy <20m richiesta. Calcolo distanza via Haversine formula. Failed se >50m con feedback distanza esatta + direzione cardinale (N/S/E/O). Titanium riceve suggerimenti AI Norah dopo failed: "Prova a spostarti verso [direzione] di circa [distanza]".`,
      
      `ANTI-FRODE: GPS mock detection obbligatorio. Pattern suspicious: location jump >100 km in <5 min, tentativi simultanei da device diversi, pattern bot (>3 tentativi <1 minuto). Sanzioni progressive: 1° warning, 2° ban 24h, 3° ban 7gg, 4° ban permanente con review manuale. Movimento fisico required (no teleport). Coordinate history check per pattern realistici.`,
    ];
  }

  if (doc.title === 'Policies') {
    return [
      `REFUND POLICY: Diritto recesso UE 14 giorni. Rimborso possibile solo se servizio non consumato (nessun BUZZ/BUZZ Map/Final Shot). Rimborsi ammessi: errore tecnico, addebito duplicato, cancellazione entro 48h senza utilizzo. Rimborsi NON ammessi: dopo utilizzo feature premium, cambio idea post-utilizzo. Procedura: contatto support@m1ssion.com, verifica utilizzo, decisione entro 5 giorni lavorativi, rimborso via Stripe in 7-14 giorni.`,
      
      `FAIR PLAY POLICY: Comportamenti proibiti con sanzioni progressive. GPS spoofing: detection via pattern analysis + device fingerprinting, sanzioni 1° warning, 2° ban 7gg, 3° ban permanente. Multi-accounting: detection via device fingerprint/IP/payment, sanzioni chiusura account secondari + warning principale. Bot automation: detection via timing inumani + API abuse, sanzioni ban immediato 30gg. Exploit bug: ban temporaneo + rollback progressi. Appeal possibile via appeals@m1ssion.com entro 10 giorni lavorativi.`,
      
      `PRIVACY GDPR: Dati raccolti: email, user_id, device_id, GPS (solo con consenso attivo), cronologia BUZZ/Final Shot, abbonamento/pagamenti, analytics tempo in app. Geolocalizzazione: utilizzo solo per feature attive, coordinate aggregate, mai condivise con terze parti, retention 90 giorni poi cancellazione. Conversazioni AI: anonimizzate per QA, retention 90 giorni, opt-out possibile, usate per training (anonimizzate). Pagamenti: Stripe PCI-DSS Level 1, M1SSION non memorizza dati carta. Diritti: accesso dati, cancellazione (GDPR right to be forgotten), rettifica, portabilità.`,
    ];
  }

  return [`Documento: ${doc.title}\nCategoria: ${doc.category}`];
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
