// © 2025 Joseph MULÉ – M1SSION™- ALL RIGHTS RESERVED - NIYVORA KFT
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1ssion-sig',
};

const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52'

// Utility function to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  return '0.0.0.0'
}

// Utility function to calculate SHA-256
async function calculateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Security validation function
async function validateSecurity(req: Request, supabase: any): Promise<{ success: boolean, error?: string, user?: any, ipAddress: string }> {
  const ipAddress = getClientIP(req)
  const authHeader = req.headers.get('authorization')

  console.log(`🔒 Security validation for AI generator from IP: ${ipAddress}`)

  // Check if IP is blocked
  const { data: isBlocked } = await supabase.rpc('is_ip_blocked', { ip_addr: ipAddress })
  if (isBlocked) {
    console.log(`🚫 IP ${ipAddress} is blocked`)
    return { success: false, error: 'IP_BLOCKED', ipAddress }
  }

  // Check rate limit
  const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
    ip_addr: ipAddress,
    api_endpoint: 'ai-content-generator',
    max_requests: 3,
    window_minutes: 1
  })

  if (!rateLimitOk) {
    console.log(`⏱️ Rate limit exceeded for IP ${ipAddress}`)
    await supabase.rpc('block_ip', {
      ip_addr: ipAddress,
      block_duration_minutes: 30,
      block_reason: 'rate_limit_exceeded_ai_generator'
    })
    return { success: false, error: 'RATE_LIMIT_EXCEEDED', ipAddress }
  }

  // Verify JWT token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔐 Missing or invalid authorization header')
    return { success: false, error: 'MISSING_AUTH_TOKEN', ipAddress }
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user || !user.email) {
    console.log('🔐 Invalid JWT token or no email:', authError?.message)
    return { success: false, error: 'INVALID_TOKEN', ipAddress }
  }

  // Verify email hash
  const emailHash = await calculateSHA256(user.email)
  if (emailHash !== AUTHORIZED_EMAIL_HASH) {
    console.log(`🔐 Unauthorized email hash. Expected: ${AUTHORIZED_EMAIL_HASH}, Got: ${emailHash}`)
    return { success: false, error: 'UNAUTHORIZED_EMAIL', ipAddress }
  }

  console.log(`✅ Security validation passed for user ${user.email}`)
  return { success: true, user, ipAddress }
}

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

  const startTime = Date.now();
  let ipAddress = '0.0.0.0';
  
  try {
    console.log('🚀 AI Content Generator started');
    ipAddress = getClientIP(req);
    console.log(`📡 Request from IP: ${ipAddress}`);
    console.log(`🔧 Request method: ${req.method}`);
    console.log(`📋 Request headers:`, Object.fromEntries(req.headers.entries()));
    
    // Parse request body with error handling and logging
    let requestBody: any = null;
    
    try {
      const bodyText = await req.text();
      console.log(`📦 Raw request body text: "${bodyText}"`);
      console.log(`📦 Body length: ${bodyText.length}`);
      
      if (!bodyText || bodyText.trim() === '') {
        console.log('❌ Empty request body received');
        return new Response(
          JSON.stringify({ error: 'Request body is empty. Expected JSON with prompt, contentType, and missionId.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      requestBody = JSON.parse(bodyText);
      console.log(`✅ Parsed request body:`, requestBody);
      
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError.message);
      console.log('❌ Parse error details:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          details: parseError.message,
          receivedContent: await req.text().catch(() => 'Could not read body')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase for security validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Perform security validation first
    const validation = await validateSecurity(req, supabase)
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Log access attempt
    await supabase.from('admin_logs').insert({
      event_type: validation.success ? 'ai_generator_access_granted' : 'ai_generator_access_denied',
      user_id: validation.user?.id || null,
      context: 'AI Content Generator access',
      note: validation.error || 'success',
      device: userAgent,
      ip_address: validation.ipAddress,
      route: 'ai-content-generator',
      status_code: validation.success ? 200 : 403,
      reason: validation.error || 'authorized_access'
    })

    if (!validation.success) {
      console.log(`🚫 Access denied: ${validation.error}`)
      return new Response(
        JSON.stringify({ 
          error: validation.error,
          message: 'Access denied'
        }),
        { 
          status: validation.error === 'RATE_LIMIT_EXCEEDED' ? 429 : 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Security validation passed for user', validation.user?.email)

    // Parse della richiesta (già fatto sopra per logging)
    const { prompt, contentType, missionId } = requestBody;
    
    console.log(`🔍 Processing request - Prompt: "${prompt?.substring(0, 50)}...", Type: ${contentType}`);
    
    if (!prompt?.trim()) {
      console.log('❌ Missing prompt in request');
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
        model: 'gpt-4o-mini',
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

    // Use the already validated user from security check
    const user = validation.user;

    // Ottieni il piano utente e la settimana corrente per il sistema dinamico
    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();
    
    const userPlan = profileData?.subscription_tier || 'free';
    const currentWeekNum = getCurrentWeekNumber();

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
      week_number: currentWeekNum,
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
          p_week_number: currentWeekNum
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
        weekNumber: currentWeekNum
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Errore in ai-content-generator:', error);
    console.error(`🕐 Duration: ${duration}ms`);
    console.error(`📡 IP: ${ipAddress}`);
    
    // Log dell'errore dettagliato nel database per debugging
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Determina il tipo di errore
      let statusCode = 500;
      let reason = 'runtime_error';
      
      if (error.message?.includes('JWT')) {
        statusCode = 401;
        reason = 'jwt_invalid';
      } else if (error.message?.includes('JSON')) {
        statusCode = 400;
        reason = 'invalid_json';
      } else if (error.message?.includes('unauthorized')) {
        statusCode = 403;
        reason = 'unauthorized_access';
      }
      
      await supabase.from('admin_logs').insert({
        event_type: 'ai_generator_failure',
        context: 'AI Content Generator detailed error',
        note: error.message || 'Unknown error',
        ip_address: ipAddress,
        route: 'ai-content-generator',
        status_code: statusCode,
        reason: reason,
        user_agent: req.headers.get('user-agent') || 'unknown',
        payload: JSON.stringify({
          error_type: error.name,
          error_stack: error.stack,
          timestamp: new Date().toISOString()
        })
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});