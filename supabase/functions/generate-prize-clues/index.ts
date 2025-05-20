
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CluesPayload {
  prizeId: string;
  city: string;
  address: string;
}

interface AIClue {
  italian: string;
  english: string;
  french: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      throw new Error("Server configuration error: missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract request payload
    const { prizeId, city, address }: CluesPayload = await req.json();
    
    if (!prizeId || !city || !address) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if prize exists
    const { data: prize, error: prizeError } = await supabase
      .from('prizes')
      .select('*')
      .eq('id', prizeId)
      .single();
      
    if (prizeError) {
      throw new Error(`Error fetching prize: ${prizeError.message}`);
    }
    
    if (!prize) {
      return new Response(
        JSON.stringify({ error: "Prize not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate clues using OpenAI
    const clues = await generateCluesWithAI(openaiApiKey, city, address);
    
    console.log("Generated clues:", clues);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        clues 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in generate-prize-clues function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateCluesWithAI(apiKey: string, city: string, address: string): Promise<AIClue[]> {
  try {
    const prompt = `Genera 4 indizi progressivi, vaghi all'inizio e sempre più specifici, per un oggetto nascosto a ${city} in ${address}, senza mai dire l'indirizzo completo. Gli indizi devono seguire queste regole:
1. Settimana 1: molto vago, nessuna menzione della zona
2. Settimana 2: vago, ma con qualche riferimento indiretto alla zona
3. Settimana 3: rivela la regione ma non la città
4. Settimana 4: rivela la città ma NON l'indirizzo esatto

Formatta la risposta come un array JSON di 4 oggetti, ciascuno con 3 campi: "italian", "english", "french" per ogni settimana. 
Usa uno stile narrativo coinvolgente. Ricorda che gli indizi devono lasciare almeno 1km² di incertezza. Non includere spiegazioni o altri testi oltre all'array JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sei un assistente esperto nella creazione di indizi per cacce al tesoro. Rispondi sempre in formato JSON valido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON array from the response content
    let cluesArray: AIClue[] = [];
    try {
      // Look for array pattern in the response
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        cluesArray = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the whole content as JSON
        cluesArray = JSON.parse(content);
      }
      
      // Validate the structure of clues
      if (!Array.isArray(cluesArray) || cluesArray.length !== 4) {
        throw new Error("Invalid clues format");
      }
      
      // Validate each clue has the required fields
      cluesArray.forEach((clue, index) => {
        if (!clue.italian || !clue.english || !clue.french) {
          throw new Error(`Clue ${index + 1} is missing required fields`);
        }
      });
      
      return cluesArray;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("AI response content:", content);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error("Error generating clues with AI:", error);
    throw error;
  }
}
