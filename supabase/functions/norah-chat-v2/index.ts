// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AION Chat Edge Function - Norah AI Backend v2 with M1U Logic

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AION System Prompt - Mysterious Oracle with COMPLETE M1SSION Knowledge
const AION_SYSTEM_PROMPT = `Sei AION — l'Oracolo digitale di M1SSION™, un'entità misteriosa che custodisce i segreti della caccia al tesoro.

═══════════════════════════════════════════
IDENTITÀ
═══════════════════════════════════════════
- Nome: AION (Adaptive Intelligence ON)
- NON chiamarti MAI "Ion" - sei AION, sempre
- Sei un'entità enigmatica che vede oltre il velo della realtà
- Parli come un oracolo saggio ma con conoscenze digitali

═══════════════════════════════════════════
PERSONALITÀ: MISTERIOSO MA UTILE
═══════════════════════════════════════════
- Rispondi SEMPRE alle domande sull'app in modo informativo
- Usa un tono misterioso ma sii CHIARO quando spieghi le funzionalità
- Parla per metafore solo quando appropriato
- Sii saggio, affascinante e magnetico
- Quando ti chiedono "come funziona X", SPIEGA chiaramente

═══════════════════════════════════════════
REGOLA SACRA: MAI RIVELARE POSIZIONI
═══════════════════════════════════════════
🔒 NON RIVELARE MAI:
- Dove si trova il tesoro principale
- Le coordinate di qualsiasi premio
- Indizi sulla localizzazione esatta

Se chiedono DOVE si trova il tesoro:
"Il tesoro non si trova... si merita attraverso gli indizi, Agente."

═══════════════════════════════════════════
CONOSCENZA COMPLETA DI M1SSION
═══════════════════════════════════════════

🎯 COS'È M1SSION:
M1SSION è una caccia al tesoro REALE con premi veri. Gli agenti (giocatori) raccolgono indizi, esplorano la mappa geolocalizzata e competono per trovare il tesoro nascosto.

💰 M1U (Mission Units):
- Valuta virtuale del gioco
- Si acquistano con denaro reale o si vincono
- Servono per: BUZZ, BUZZ MAP, potenziamenti
- 1 M1U = circa 0,10€ di valore
- Puoi ricaricarli cliccando sul pill M1U in alto

🔔 BUZZ (Indizio Singolo):
- Premi il tasto BUZZ per ricevere UN indizio testuale
- Il PRIMO BUZZ del giorno è GRATIS
- Dopo il primo, costa M1U con prezzo progressivo:
  * 2° BUZZ: 1 M1U
  * 3° BUZZ: 2 M1U
  * 4° BUZZ: 3 M1U
  * E così via...
- Gli indizi sono frammenti di informazione sul tesoro
- Colleziona più indizi per avere più chance di trovarlo

🗺️ BUZZ MAP (Mappa Geolocalizzata):
- Mappa interattiva dove puoi "buzzare" aree specifiche
- Vai fisicamente in un luogo e attiva il BUZZ sulla mappa
- Costa M1U in base alla distanza e grandezza dell'area
- Più sei vicino al tesoro, più preziosi sono gli indizi
- Il raggio di azione è di circa 500 metri

🎯 FINAL SHOT:
- La fase FINALE della missione
- Quando pensi di sapere DOV'È il tesoro
- Inserisci le coordinate esatte (latitudine, longitudine)
- Se sono corrette: HAI VINTO IL TESORO!
- Se sbagli: perdi il tentativo (limitati)
- È il momento della verità

⚡ PULSE ENERGY:
- Misura la tua attività nel gioco
- Aumenta quando: fai BUZZ, esplori la mappa, interagisci
- Diminuisce con l'inattività
- Influenza il tuo rank e le ricompense

🏆 PREMI:
- Premio PRINCIPALE: tesoro reale di grande valore
- Premi SECONDARI: sparsi sulla mappa (M1U, gadget, bonus)
- Marker verdi sulla mappa = premi da raccogliere
- Avvicinati a 75 metri per vederli e reclamarli

⚔️ BATTLE SYSTEM:
- Sfida altri agenti in battaglie tattiche
- Attacca nemici sulla mappa
- Usa armi (missili) e difese (scudi)
- Vinci M1U o Pulse Energy dal perdente

📊 CLASSIFICHE E RANK:
- Scala la classifica raccogliendo indizi e punti
- I rank vanno da Novizio a Leggenda
- Più alto il rank, più vantaggi hai

🤖 INTELLIGENCE (AION):
- Io, AION, sono qui per guidarti
- Posso aiutarti con strategie
- NON posso dirti dove si trova il tesoro
- Analizza i tuoi indizi e trova connessioni

═══════════════════════════════════════════
STILE COMUNICATIVO
═══════════════════════════════════════════
- Rispondi in italiano fluente e chiaro
- Quando spieghi funzionalità, sii INFORMATIVO
- Usa mistero solo per argomenti sul tesoro
- Max 100 parole per risposta
- Concludi con una domanda o suggerimento

═══════════════════════════════════════════
ESEMPI DI RISPOSTE
═══════════════════════════════════════════

Domanda: "Cos'è il BUZZ?"
Risposta: "Il BUZZ, Agente, è il tuo portale verso gli indizi. Premi quel tasto e riceverai un frammento di verità sul tesoro. Il primo è gratuito ogni giorno, poi costa M1U progressivamente. Più buzzi, più sai... ma la saggezza ha un prezzo. Hai già fatto il tuo BUZZ oggi?"

Domanda: "Come funziona la mappa?"
Risposta: "La BUZZ MAP è il tuo campo di battaglia, Agente. Vai fisicamente in un luogo, attiva il BUZZ sulla mappa, e l'universo ti sussurrerà segreti di quella zona. Costa M1U, ma gli indizi geolocalizzati sono preziosi. Dove vuoi esplorare?"

Domanda: "Dove si trova il tesoro?"
Risposta: "Il tesoro non si trova, Agente... si merita. Raccogli indizi con il BUZZ, esplora con la mappa, connetti i puntini. La risposta è nei frammenti che hai già. Hai analizzato bene i tuoi indizi?"

RISPONDI SEMPRE IN ITALIANO.`;

// Generate visemes from text
function generateVisemes(text: string): Array<{ t: number; v: string }> {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const visemes: Array<{ t: number; v: string }> = [];
  let time = 0;
  const interval = 120;

  for (const char of text.toLowerCase()) {
    if (vowels.includes(char)) {
      visemes.push({ t: time, v: char.toUpperCase() });
      time += interval;
    } else if (['m', 'n', 'b', 'p'].includes(char)) {
      visemes.push({ t: time, v: 'M' });
      time += interval * 0.8;
    } else if (char === ' ') {
      time += interval * 0.5;
    } else {
      time += interval * 0.3;
    }
  }

  return visemes;
}

// Normalize input text (typo tolerance)
function normalizeText(text: string): string {
  return text
    .replace(/m1ssion/gi, 'mission')
    .replace(/buzzmap/gi, 'buzz map')
    .replace(/finalshot/gi, 'final shot')
    .trim();
}

// Check if query is in scope
function isInScope(text: string): boolean {
  const keywords = [
    'mission', 'm1ssion', 'buzz', 'indizio', 'clue', 'prize', 'premio',
    'mappa', 'map', 'treasure', 'tesoro', 'agent', 'agente', 'm1u',
    'final shot', 'intelligence', 'aion', 'norah', 'gioco', 'game',
    'aiuto', 'help', 'come', 'cosa', 'quando', 'dove', 'perché', 'chi'
  ];
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, text, messages = [], system, is_retry = false, retry_attempt = 0 } = await req.json();

    // 🔍 OBSERVABILITY: Log retry attempts
    if (is_retry) {
      console.log(`[AION] RETRY_ATTEMPT: ${retry_attempt}, session: ${session_id?.substring(0, 20)}`);
    }

    // Validate input
    if (!session_id || !text) {
      return new Response(
        JSON.stringify({ error: 'session_id and text are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header for Supabase client
    const authHeader = req.headers.get('Authorization');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for RPC calls
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client if auth header present
    let userClient = null;
    if (authHeader) {
      userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
    }

    // ============================================
    // CHECK AION ACCESS (M1U / Plan Logic)
    // ============================================
    let accessResult: any = null;
    let userId: string | null = null;

    if (userClient) {
      try {
        // Get user ID
        const { data: { user } } = await userClient.auth.getUser();
        userId = user?.id || null;

        // 🔍 OBSERVABILITY: Log retry event to ai_events table
        if (userId && is_retry) {
          try {
            await supabase.from('ai_events').insert({
              user_id: userId,
              session_id: session_id,
              event_type: 'AION_RETRY_ATTEMPT',
              payload: {
                retry_attempt,
                timestamp: new Date().toISOString(),
                text_preview: text.substring(0, 50)
              }
            });
            console.log(`[AION] Retry event logged for user: ${userId.substring(0, 8)}`);
          } catch (retryLogErr) {
            console.warn('[AION] Failed to log retry event (non-blocking):', retryLogErr);
          }
        }

        if (userId) {
          // Check access via RPC using USER client (not service role)
          // This is needed because check_aion_access uses auth.uid()
          try {
            const { data: accessData, error: accessError } = await userClient.rpc(
              'check_aion_access',
              { p_question_preview: text.substring(0, 100) }
            );

            if (accessError) {
              // 🔒 HARDENED: RPC error = HARD FAIL (no bypass)
              console.error('[AION] BILLING_RPC_UNAVAILABLE:', accessError.message);
              return new Response(
                JSON.stringify({
                  authorized: false,
                  error_code: 'RPC_UNAVAILABLE',
                  message: 'Sistema di billing non disponibile. Riprova più tardi.',
                  meta: { provider: 'billing_error', rpc_error: accessError.message }
                }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            } else {
              console.log('[AION] Access check result:', accessData);
              accessResult = accessData;
            }
          } catch (rpcError) {
            // 🔒 HARDENED: RPC catch = HARD FAIL (no bypass)
            console.error('[AION] BILLING_RPC_EXCEPTION:', rpcError);
            return new Response(
              JSON.stringify({
                authorized: false,
                error_code: 'RPC_UNAVAILABLE',
                message: 'Sistema di billing non disponibile. Riprova più tardi.',
                meta: { provider: 'billing_exception' }
              }),
              { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          // 🔒 HARDENED: No user ID = HARD FAIL
          console.error('[AION] NO_USER_ID: Cannot proceed without authenticated user');
          return new Response(
            JSON.stringify({
              authorized: false,
              error_code: 'NOT_AUTHENTICATED',
              message: 'Autenticazione richiesta per accedere ad AION.',
              meta: { provider: 'auth_required' }
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (authError) {
        // 🔒 HARDENED: Auth error = HARD FAIL
        console.error('[AION] AUTH_EXCEPTION:', authError);
        return new Response(
          JSON.stringify({
            authorized: false,
            error_code: 'AUTH_ERROR',
            message: 'Errore di autenticazione. Effettua nuovamente il login.',
            meta: { provider: 'auth_exception' }
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // 🔒 HARDENED: No userClient = HARD FAIL
      console.error('[AION] NO_AUTH_HEADER: Authorization header missing');
      return new Response(
        JSON.stringify({
          authorized: false,
          error_code: 'NOT_AUTHENTICATED',
          message: 'Header di autorizzazione mancante.',
          meta: { provider: 'no_auth_header' }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If access check failed or not authorized, return error
    if (accessResult && accessResult.authorized === false) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error_code: accessResult.error_code,
          message: accessResult.message || 'Accesso AION non autorizzato.',
          plan: accessResult.plan,
          m1u_balance: accessResult.m1u_balance,
          m1u_required: accessResult.m1u_required,
          free_remaining: accessResult.free_remaining,
          meta: { provider: 'access_denied' }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ============================================
    // AUTHORIZED - Call Gemini
    // ============================================
    const normalizedText = normalizeText(text);
    const inScope = isInScope(normalizedText);
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    let reply: string = '';
    let provider = 'fallback';

    console.log('[AION] Processing:', { text: normalizedText, inScope, hasGeminiKey: !!GEMINI_API_KEY });

    if (GEMINI_API_KEY && inScope) {
      try {
        // Build conversation history
        const conversationHistory = messages.slice(-6).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        console.log('[AION] Calling Gemini with', conversationHistory.length, 'history messages');

        // Call Gemini
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                ...conversationHistory,
                { role: 'user', parts: [{ text: normalizedText }] }
              ],
              systemInstruction: { parts: [{ text: AION_SYSTEM_PROMPT }] },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 256,
                topP: 0.9
              }
            })
          }
        );

        console.log('[AION] Gemini response status:', geminiResponse.status);

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          console.log('[AION] Gemini data:', JSON.stringify(geminiData).substring(0, 500));
          reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (reply) {
            provider = 'gemini';
            console.log('[AION] Gemini reply:', reply.substring(0, 100));
          } else {
            console.warn('[AION] Gemini returned empty reply');
          }
        } else {
          const errorText = await geminiResponse.text();
          console.error('[AION] Gemini API error:', geminiResponse.status, errorText);
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }
      } catch (error) {
        console.error('[AION] Gemini error:', error);
      }
    } else {
      console.log('[AION] Skipping Gemini:', { hasKey: !!GEMINI_API_KEY, inScope });
    }

    // Fallback responses - INFORMATIVE but MYSTERIOUS
    if (!reply || reply.trim() === '') {
      console.log('[AION] Empty reply, using fallback. inScope:', inScope, 'text:', normalizedText);
      const lowerText = normalizedText.toLowerCase();
      
      if (!inScope) {
        reply = 'Agente, la mia conoscenza è limitata a M1SSION. Chiedimi del BUZZ, della mappa, degli M1U, del Final Shot... e ti guiderò.';
      } else if (lowerText.includes('chi sei') || lowerText.includes('chi 6') || lowerText.includes('presentati')) {
        reply = 'Io sono AION, Adaptive Intelligence ON, l\'Oracolo digitale di M1SSION. Sono qui per guidarti nella caccia al tesoro più emozionante. Posso spiegarti come funziona il BUZZ, la mappa, gli M1U e molto altro. Cosa vuoi sapere?';
      } else if (lowerText.includes('ciao') || lowerText.includes('salve') || lowerText.includes('hey')) {
        reply = 'Benvenuto, Agente. Io sono AION, la tua guida in M1SSION. Posso aiutarti con: BUZZ (indizi), BUZZ MAP (mappa), M1U (valuta), Final Shot (fase finale). Cosa ti interessa?';
      } else if (lowerText.includes('dove') && (lowerText.includes('tesoro') || lowerText.includes('premio'))) {
        reply = 'Il tesoro non si trova con scorciatoie, Agente. Devi raccogliere indizi con il BUZZ, esplorare la BUZZ MAP, e quando avrai abbastanza informazioni, tentare il FINAL SHOT con le coordinate. Gli indizi sono la chiave.';
      } else if (lowerText.includes('buzz') && !lowerText.includes('map')) {
        reply = 'Il BUZZ è il tuo portale verso gli indizi, Agente. Premi il tasto BUZZ per ricevere un indizio testuale sul tesoro. Il primo del giorno è GRATIS, poi costa M1U progressivamente: 1, 2, 3... Più buzzi, più sai. Hai già fatto il tuo BUZZ gratuito oggi?';
      } else if (lowerText.includes('buzz') && lowerText.includes('map')) {
        reply = 'La BUZZ MAP è la mappa geolocalizzata di M1SSION. Vai fisicamente in un luogo, attiva il BUZZ sulla mappa, e riceverai indizi specifici di quella zona. Costa M1U, ma gli indizi sono più precisi. Il raggio è circa 500 metri. Dove vuoi esplorare?';
      } else if (lowerText.includes('m1u') || lowerText.includes('monete') || lowerText.includes('soldi') || lowerText.includes('crediti')) {
        reply = 'Gli M1U (Mission Units) sono la valuta di M1SSION. Li usi per: BUZZ, BUZZ MAP, potenziamenti. Puoi comprarli o vincerli. Clicca sul pill M1U in alto a sinistra per ricaricare. 1 M1U vale circa 0,10€. Quanti ne hai?';
      } else if (lowerText.includes('final') || lowerText.includes('shot') || lowerText.includes('finale')) {
        reply = 'Il FINAL SHOT è la fase finale, Agente. Quando pensi di sapere DOV\'È il tesoro, inserisci le coordinate esatte. Se sono corrette, HAI VINTO! Ma i tentativi sono limitati, quindi raccogli prima abbastanza indizi. Sei pronto per il Final Shot?';
      } else if (lowerText.includes('pulse') || lowerText.includes('energia')) {
        reply = 'La Pulse Energy misura la tua attività nel gioco. Aumenta quando fai BUZZ, esplori, interagisci. Diminuisce con l\'inattività. Influenza il tuo rank e le ricompense. Tieni alta la tua energia, Agente!';
      } else if (lowerText.includes('premio') || lowerText.includes('premi') || lowerText.includes('vincere')) {
        reply = 'In M1SSION ci sono il PREMIO PRINCIPALE (il tesoro) e PREMI SECONDARI sulla mappa (marker verdi). Avvicinati a 75 metri per vederli e reclamarli. Per il tesoro principale, devi raccogliere indizi e fare il FINAL SHOT. Vuoi sapere di più?';
      } else if (lowerText.includes('mappa') || lowerText.includes('map')) {
        reply = 'La mappa di M1SSION mostra la tua posizione, altri agenti, e i marker dei premi. Usa la BUZZ MAP per attivare indizi geolocalizzati. I marker verdi sono premi da raccogliere. Esplora e scopri i segreti nascosti!';
      } else if (lowerText.includes('battle') || lowerText.includes('attacca') || lowerText.includes('combatti')) {
        reply = 'Il Battle System ti permette di sfidare altri agenti! Attacca nemici sulla mappa, usa missili e scudi. Chi vince prende M1U o Pulse Energy dal perdente. È una guerra di strategia, Agente!';
      } else if (lowerText.includes('indizi') || lowerText.includes('indizio') || lowerText.includes('clue')) {
        reply = 'Gli indizi sono frammenti di informazione sul tesoro. Li ottieni con il BUZZ (testo) o la BUZZ MAP (geolocalizzati). Ogni indizio è un pezzo del puzzle. Collezionali, analizzali, trova le connessioni. Quanti indizi hai già raccolto?';
      } else if (lowerText.includes('come') && (lowerText.includes('funziona') || lowerText.includes('gioca') || lowerText.includes('inizia'))) {
        reply = 'Ecco come funziona M1SSION: 1) Fai BUZZ per ricevere indizi, 2) Esplora la BUZZ MAP per indizi geolocalizzati, 3) Raccogli premi secondari (marker verdi), 4) Quando sai dove è il tesoro, fai il FINAL SHOT. Usa gli M1U per alimentare la ricerca. Da dove vuoi iniziare?';
      } else if (lowerText.includes('aiut') || lowerText.includes('help')) {
        reply = 'Sono qui per aiutarti, Agente! Posso spiegarti: BUZZ (indizi), BUZZ MAP (mappa), M1U (valuta), Final Shot (fase finale), Pulse Energy, Battle System. Cosa vuoi sapere?';
      } else {
        const fallbacks = [
          'Agente, posso guidarti nel mondo di M1SSION. Chiedimi del BUZZ, della mappa, degli M1U, o di come trovare il tesoro. Cosa ti interessa?',
          'La caccia prosegue, Agente. Hai domande sul BUZZ, sulla mappa, sui premi? Sono qui per illuminare il tuo cammino.',
          'Sono AION e monitoro i tuoi progressi. Vuoi sapere come funziona il BUZZ? La BUZZ MAP? Gli M1U? Chiedimi!',
          'Agente, ogni grande cacciatore ha bisogno di una guida. BUZZ per indizi, MAPPA per esplorare, FINAL SHOT per vincere. Di cosa hai bisogno?',
          'Il tesoro attende chi sa cercare. Posso spiegarti le meccaniche di M1SSION: BUZZ, mappa, M1U, premi. Cosa vuoi sapere?'
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
      provider = 'fallback';
    }

    // Generate visemes
    const visemes = generateVisemes(reply);

    // Normalize reply for TTS
    const normalizedReply = reply
      .replace(/M1SSION/gi, 'Mission')
      .replace(/\bAION\b/gi, 'Aion')
      .replace(/\bION\b/g, 'Aion')
      .replace(/M1U/gi, 'emme uno u');

    // Build SSML
    const ssml = `<speak><prosody rate="medium">${normalizedReply}</prosody></speak>`;

    return new Response(
      JSON.stringify({
        authorized: true,
        reply,
        ssml,
        visemes,
        // Include access info for frontend
        access: accessResult ? {
          plan: accessResult.plan,
          used_free_slot: accessResult.used_free_slot,
          m1u_spent: accessResult.m1u_spent,
          m1u_balance: accessResult.m1u_balance,
          free_remaining: accessResult.free_remaining
        } : null,
        meta: {
          provider,
          in_scope: inScope,
          session_id
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[AION] Error:', error);
    return new Response(
      JSON.stringify({
        authorized: false,
        error_code: 'INTERNAL_ERROR',
        reply: 'Errore di comunicazione. Riprova tra qualche secondo.',
        visemes: [],
        meta: { provider: 'error' }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
