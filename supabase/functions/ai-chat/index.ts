
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, unlockedClues } = await req.json()
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    const systemPrompt = `Sei un assistente AI esperto nella caccia al tesoro ProjectX.
    L'utente ha attualmente sbloccato ${unlockedClues || 0} indizi.
    Il tuo compito è aiutare l'utente a:
    - Interpretare gli indizi che ha trovato
    - Suggerire dove cercare nuovi indizi
    - Dare consigli strategici sulla caccia al tesoro
    - Mantenere alta la motivazione dell'utente

    Rispondi sempre in italiano in modo conciso, amichevole e incoraggiante.
    Non rivelare mai informazioni su indizi che l'utente non ha ancora sbloccato.`

    console.log(`Processing chat request with ${messages.length} messages and ${unlockedClues} unlocked clues`)

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
          ...messages
        ],
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('OpenAI API error:', data)
      throw new Error(data.error?.message || 'Error contacting OpenAI API')
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
