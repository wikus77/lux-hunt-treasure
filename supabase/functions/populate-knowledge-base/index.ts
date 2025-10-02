// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: populate-knowledge-base
// Popola automaticamente la knowledge base con i documenti della Product Bible

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Document {
  slug: string;
  title: string;
  body: string;
  tags: string[];
  doc_type: string;
}

// Product Bible documents to populate
const DOCUMENTS: Document[] = [
  {
    slug: 'buzz-and-map',
    title: 'BUZZ & BUZZ Map — Specifiche Ufficiali',
    body: `# BUZZ & BUZZ Map

BUZZ è un'azione attiva che esegue una scansione geolocalizzata e sblocca indizi/aree secondo regole dinamiche.

BUZZ Map è la stessa logica contestualizzata alla mappa con overlay e visualizzazione immediata.

## Primo BUZZ Map Speciale
- Raggio: 500 km
- Prezzo: €4,99
- Condizione: Primo BUZZ Map mai eseguito dall'utente

## Differenze Chiave
- BUZZ: attivabile ovunque, notifica/toast
- BUZZ Map: richiede mappa aperta, visualizzazione aree immediate

## Anti-Abuso
- Rate limiting per tier
- Cooldown tra azioni
- Verifica GPS obbligatoria
- Detection GPS spoofing`,
    tags: ['buzz', 'buzz-map', 'core-feature', 'pricing'],
    doc_type: 'product'
  },
  {
    slug: 'final-shot',
    title: 'Final Shot — Regole Ufficiali',
    body: `# Final Shot

Il Final Shot è il tentativo finale di claim del premio M1SSION™.

## Caratteristiche
- Richiede GPS attivo
- Limiti per tier (tentativi giornalieri)
- Verifica distanza da coordinate target
- Cooldown tra tentativi

## Limiti per Tier
- Free: 1 tentativo/giorno
- Silver: 2 tentativi/giorno
- Gold: 5 tentativi/giorno
- Black: 10 tentativi/giorno

## Anti-Frode
- GPS mock detection
- Pattern analysis movimenti
- Verifica coordinate history`,
    tags: ['final-shot', 'core-feature', 'rules'],
    doc_type: 'product'
  },
  {
    slug: 'subscriptions',
    title: 'Subscription Tiers M1SSION™',
    body: `# Subscription Tiers

## Free Tier
- 10 BUZZ/mese
- 2 BUZZ Map/mese
- 1 Final Shot/giorno
- Cooldown standard

## Silver Tier
- 50 BUZZ/mese
- 10 BUZZ Map/mese
- 2 Final Shot/giorno
- Cooldown ridotto 50%
- Early access 2h

## Gold Tier
- 150 BUZZ/mese
- 30 BUZZ Map/mese
- 5 Final Shot/giorno
- Cooldown ridotto 75%
- Early access 24h

## Black Tier (VIP)
- BUZZ illimitati
- BUZZ Map illimitati
- 10 Final Shot/giorno
- Zero cooldown
- Early access 48h`,
    tags: ['subscriptions', 'pricing', 'tiers', 'monetization'],
    doc_type: 'product'
  },
  {
    slug: 'policies',
    title: 'Policies M1SSION™',
    body: `# Policies

## Refund Policy
- Diritto recesso UE: 14 giorni
- Rimborso ammesso: errori tecnici, addebiti duplicati
- Rimborso NON ammesso: servizio già utilizzato

## Fair Play Policy
- Proibito: GPS spoofing, multi-accounting, bot, exploit
- Sanzioni: warning → ban temporaneo → ban permanente

## Privacy Policy
- Dati raccolti: email, GPS (con consenso), cronologia BUZZ
- Diritti GDPR: accesso, cancellazione, portabilità
- No condivisione dati con terze parti`,
    tags: ['policies', 'refund', 'fair-play', 'privacy', 'gdpr'],
    doc_type: 'policy'
  },
  {
    slug: 'faq-general',
    title: 'FAQ Generali M1SSION™',
    body: `# FAQ Generali

## Cos'è M1SSION?
M1SSION è un'app di caccia al tesoro geolocalizzata dove sblocchi indizi per trovare premi reali.

## Come funziona BUZZ?
BUZZ scansiona l'area intorno a te e sblocca indizi. Il primo BUZZ Map costa €4,99 per raggio 500 km.

## Serve il GPS?
Sì, GPS obbligatorio per BUZZ, BUZZ Map e Final Shot.

## Posso giocare gratis?
Sì, tier Free include 10 BUZZ/mese e accesso base a tutte le feature.

## Come funziona Final Shot?
È il tentativo finale per claim del premio. Devi essere vicino alle coordinate esatte.`,
    tags: ['faq', 'general', 'onboarding'],
    doc_type: 'faq'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get action from request
    const { action = 'populate' } = await req.json();

    if (action === 'populate') {
      // Insert/update documents in ai_docs
      const results = [];
      
      for (const doc of DOCUMENTS) {
        const { data, error } = await supabaseClient
          .from('ai_docs')
          .upsert({
            slug: doc.slug,
            title: doc.title,
            body: doc.body,
            tags: doc.tags,
            doc_type: doc.doc_type,
            locale: 'it',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'slug'
          })
          .select()
          .single();

        if (error) {
          console.error(`[populate-kb] Error upserting doc ${doc.slug}:`, error);
          results.push({ slug: doc.slug, status: 'error', error: error.message });
        } else {
          console.log(`[populate-kb] Upserted doc ${doc.slug}`);
          results.push({ slug: doc.slug, status: 'success', id: data.id });
        }
      }

      return new Response(
        JSON.stringify({ 
          action: 'populate',
          documents_processed: results.length,
          results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      // List all documents in knowledge base
      const { data, error } = await supabaseClient
        .from('ai_docs')
        .select('slug, title, doc_type, tags, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          action: 'list',
          count: data?.length || 0,
          documents: data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: populate or list' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[populate-kb] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
