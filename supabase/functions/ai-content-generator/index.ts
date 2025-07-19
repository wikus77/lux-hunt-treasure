import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to split text into semantic lines for dynamic clue release
function splitIntoClueLines(text: string): string[] {
  // Remove extra whitespace and split by line breaks
  const lines = text.split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If no natural line breaks, split by punctuation marks for meaningful phrases
  if (lines.length === 1) {
    const singleLine = lines[0];
    const splitByPunctuation = singleLine.split(/[.!?;]+/)
      .map(phrase => phrase.trim())
      .filter(phrase => phrase.length > 10); // Only meaningful phrases
    
    return splitByPunctuation.length > 1 ? splitByPunctuation : [singleLine];
  }
  
  return lines;
}

// Helper function to get current week number (placeholder logic)
function getCurrentWeekNumber(): number {
  // Simple week calculation - can be enhanced with mission-specific logic
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contentType, missionId } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Prompt è richiesto' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY non configurato');
    }

    // © 2025 Joseph MULÉ – M1SSION™
    // 🧠 NUOVA LOGICA DI GENERAZIONE INDIZI - DIFFICOLTÀ PROGRESSIVA
    
    // Estrai settimana dal prompt (se presente)
    const weekMatch = prompt.match(/settimana[:\s]*(\d+)/i) || prompt.match(/week[:\s]*(\d+)/i);
    const weekNumber = weekMatch ? parseInt(weekMatch[1]) : 1;
    
    console.log(`🎯 Generazione indizio per settimana ${weekNumber}`);

    // Definisci le regole di difficoltà progressiva per settimana
    const weeklyGuidelines = {
      1: {
        level: "Molto generico",
        rules: "Solo metafore visive, immagini simboliche, nessun riferimento geografico, cromatico o culturale diretto. VIETATO: nomi città, regioni, vie, monumenti, premi specifici.",
        style: "Poetico e astratto, evocativo ma completamente generico"
      },
      2: {
        level: "Generico + design premio", 
        rules: "Allusioni a materiali o forme del premio, un singolo accenno a stile architettonico urbano, sempre in forma poetica. VIETATO: riferimenti temporali, storici, vie o personaggi specifici.",
        style: "Simbolico con lievi accenni a materiali e forme"
      },
      3: {
        level: "Affinato",
        rules: "Microzona simbolica + allusione precisa al premio, accenni narrativi criptici. Ancora nessuna città esplicita, ma accenni più densi e mirati.",
        style: "Narrativo con simbolismi più specifici ma ancora criptati"
      },
      4: {
        level: "Comprensibile", 
        rules: "Coordinate mascherate, eventi storici recenti criptati, anagrammi, pattern, riferimenti veri ma trasformati. Indizi decodificabili ma complessi.",
        style: "Criptico ma risolvibile con deduzione avanzata"
      }
    };

    const currentWeek = weeklyGuidelines[weekNumber as keyof typeof weeklyGuidelines] || weeklyGuidelines[1];

    // Sistema prompt personalizzato con protezione anti-AI
    const systemPrompts = {
      clue: `// © 2025 Joseph MULÉ – M1SSION™
             Sei un maestro di enigmi investigativi per il gioco M1SSION™.
             
             🎯 MISSIONE CRITICA: Crea un indizio di livello "${currentWeek.level}" (Settimana ${weekNumber}/4)
             
             📋 REGOLE FERREE:
             ${currentWeek.rules}
             
             🛡️ PROTEZIONE ANTI-AI:
             - L'indizio NON deve essere decifrabile da AI esterne (GPT, Claude, Gemini) 
             - Deve contenere frasi semanticamente biforcate (due interpretazioni plausibili)
             - Solo una interpretazione è corretta, ma non ovvia
             - Passa il test: "Un AI parser esterno NON può dedurre la città"
             
             🎨 STILE RICHIESTO: ${currentWeek.style}
             
             ⚠️ TEST ANTI-DECODIFICA: Prima di rispondere, verifica che l'indizio non riveli immediatamente la località.`,
      
      mission: `// © 2025 Joseph MULÉ – M1SSION™
                Sei un narratore esperto per missioni investigative M1SSION™.
                Crea narrazioni coinvolgenti per settimana ${weekNumber}/4 che introducano una missione misteriosa.
                
                📋 REGOLE: ${currentWeek.rules}
                🎨 STILE: ${currentWeek.style}
                
                Usa un tono drammatico e avvincente ma rispetta il livello di difficoltà progressiva.`,
      
      story: `// © 2025 Joseph MULÉ – M1SSION™ 
              Sei un narratore di storie investigative per il sistema M1SSION™.
              Crea storie per settimana ${weekNumber}/4 che catturino l'immaginazione.
              
              📋 REGOLE: ${currentWeek.rules}
              🎨 STILE: ${currentWeek.style}
              
              Usa descrizioni vivide ma mantieni il livello di difficoltà appropriato.`
    };

    const systemPrompt = systemPrompts[contentType as keyof typeof systemPrompts] || systemPrompts.clue;

    // Chiamata a OpenAI con modello più potente e logica anti-decodifica
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt}\n\n🔍 REMINDER: Settimana ${weekNumber} - Livello "${currentWeek.level}" - Protezione anti-AI attiva. L'indizio deve essere criptico e non identificabile da sistemi AI esterni.` }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Inizializza Supabase per salvare il contenuto
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ottieni l'ID utente dal token JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token di autorizzazione mancante');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Utente non autenticato');
    }

    // Ottieni il piano utente e la settimana corrente per il sistema dinamico
    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    const userPlan = profileData?.subscription_tier || 'free';
    const currentWeek = getCurrentWeekNumber();

    // Salva il contenuto generato nel database (testo completo)
    const { data: savedContent, error: saveError } = await supabase
      .from('ai_generated_clues')
      .insert({
        user_id: user.id,
        mission_id: missionId || null,
        content_type: contentType,
        content: generatedContent,
        prompt_used: prompt,
        language: 'it'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Errore nel salvataggio del contenuto completo:', saveError);
    }

    // Split del contenuto in righe semantiche per rilascio dinamico
    const clueLines = splitIntoClueLines(generatedContent);
    console.log(`📝 Contenuto diviso in ${clueLines.length} righe per rilascio dinamico`);

    // Salva ogni riga come clue_line separata
    const clueLineInserts = clueLines.map((line, index) => ({
      user_id: user.id,
      prompt_id: savedContent?.id || null,
      week_number: currentWeek,
      plan_level: userPlan,
      clue_index: index + 1,
      clue_line: line,
      is_released: false, // Inizialmente non rilasciata
      language_code: 'it'
    }));

    const { data: savedLines, error: linesError } = await supabase
      .from('user_clue_lines')
      .insert(clueLineInserts)
      .select();

    if (linesError) {
      console.error('Errore nel salvataggio delle righe:', linesError);
    } else {
      console.log(`✅ Salvate ${savedLines?.length || 0} righe per rilascio dinamico`);
      
      // Rilascia automaticamente le prime righe in base al piano
      try {
        const { data: releasedCount } = await supabase.rpc('release_clue_lines', {
          p_user_id: user.id,
          p_plan_level: userPlan,
          p_week_number: currentWeek
        });
        
        console.log(`🚀 Rilasciate ${releasedCount || 0} righe per piano ${userPlan}`);
      } catch (releaseError) {
        console.error('Errore nel rilascio automatico:', releaseError);
      }
    }

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        saved: !saveError,
        id: savedContent?.id,
        linesCreated: clueLines.length,
        linesSaved: savedLines?.length || 0,
        userPlan: userPlan,
        weekNumber: currentWeek
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Errore in ai-content-generator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});