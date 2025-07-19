import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Sistema prompt personalizzato per tipo di contenuto
    const systemPrompts = {
      clue: "Sei un esperto creatore di indizi per giochi di investigazione e cacce al tesoro. Crea indizi intriganti, chiari ma non troppo ovvi, che stimolino il pensiero critico e l'esplorazione. Usa un linguaggio coinvolgente e misterioso.",
      mission: "Sei un esperto nella creazione di missioni coinvolgenti per giochi di investigazione. Crea missioni strutturate con obiettivi chiari, sfide interessanti e narrativa avvincente. Includi sempre: obiettivo principale, passi da seguire, e criteri di successo.",
      story: "Sei un narratore esperto specializzato in storie di investigazione e mistero. Crea narrazioni coinvolgenti con atmosfera giusta, personaggi interessanti e colpi di scena. Mantieni sempre il senso del mistero e dell'avventura."
    };

    const systemPrompt = systemPrompts[contentType as keyof typeof systemPrompts] || systemPrompts.clue;

    // Chiamata a OpenAI
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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
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

    // Salva il contenuto generato nel database
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
      console.error('Errore nel salvataggio:', saveError);
      // Restituisci comunque il contenuto generato anche se il salvataggio fallisce
    }

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        saved: !saveError,
        id: savedContent?.id
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