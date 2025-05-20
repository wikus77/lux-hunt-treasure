
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuzzCluePayload {
  prizeId: string;
  isManualTrigger?: boolean;
  userId?: string;
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
    const { prizeId, isManualTrigger, userId }: BuzzCluePayload = await req.json();
    
    if (!prizeId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if prize exists and is active
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
    
    if (!prize.is_active && !isManualTrigger) {
      return new Response(
        JSON.stringify({ error: "Prize is not active" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there is already a buzz clue for this prize
    const { data: existingBuzz, error: buzzError } = await supabase
      .from('prize_clues')
      .select('*')
      .eq('prize_id', prizeId)
      .eq('clue_type', 'buzz')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (buzzError) {
      throw new Error(`Error checking existing buzz clues: ${buzzError.message}`);
    }

    let buzzClue;
    
    // If no existing buzz clue, generate a new one
    if (!existingBuzz || existingBuzz.length === 0) {
      // Generate a new buzz clue
      const { data: generatedBuzzClue, error: generateError } = await generateBuzzClue(
        openaiApiKey, 
        prize.city, 
        prize.address
      );
      
      if (generateError) {
        throw new Error(`Error generating buzz clue: ${generateError.message}`);
      }
      
      // Insert the new buzz clue
      const { data: insertedClue, error: insertError } = await supabase
        .from('prize_clues')
        .insert({
          prize_id: prizeId,
          week: 5, // Use week 5 for buzz clues (after standard weeks 1-4)
          description_it: generatedBuzzClue.italian,
          description_en: generatedBuzzClue.english,
          description_fr: generatedBuzzClue.french,
          clue_type: 'buzz'
        })
        .select()
        .single();
        
      if (insertError) {
        throw new Error(`Error inserting buzz clue: ${insertError.message}`);
      }
      
      buzzClue = insertedClue;
    } else {
      buzzClue = existingBuzz[0];
    }
    
    // If this is a manual trigger or we have a specific user
    if (isManualTrigger || userId) {
      let targetUsers = [];
      
      // For manual triggers, get admin users for testing
      if (isManualTrigger) {
        const { data: adminUsers, error: adminsError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('role', 'admin');
          
        if (adminsError) {
          throw new Error(`Error fetching admin users: ${adminsError.message}`);
        }
        
        targetUsers = adminUsers || [];
      } 
      // For specific user (e.g. after payment)
      else if (userId) {
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', userId)
          .single();
          
        if (userError) {
          throw new Error(`Error fetching user: ${userError.message}`);
        }
        
        if (user) {
          targetUsers = [user];
        }
      }
      
      // Record that these users have received the buzz clue
      if (targetUsers.length > 0 && buzzClue) {
        const userCluesData = targetUsers.map(user => ({
          user_id: user.id,
          clue_id: buzzClue.id,
          is_unlocked: true,
          unlocked_at: new Date().toISOString()
        }));
        
        const { error: userCluesError } = await supabase
          .from('user_clues')
          .upsert(userCluesData, { onConflict: 'user_id, clue_id' });
          
        if (userCluesError) {
          throw new Error(`Error recording user clues: ${userCluesError.message}`);
        }
        
        // Send push notifications via the device_tokens
        for (const user of targetUsers) {
          const { data: deviceTokens, error: tokensError } = await supabase
            .from('device_tokens')
            .select('token')
            .eq('user_id', user.id);
            
          if (tokensError) {
            console.error(`Error fetching device tokens for user ${user.id}: ${tokensError.message}`);
            continue;
          }
          
          if (deviceTokens && deviceTokens.length > 0) {
            try {
              await supabase.functions.invoke('send-push-notification', {
                body: { 
                  title: "🔥 Nuovo Indizio Buzz!",
                  message: "Sblocca l'indizio esclusivo per trovare l'auto!",
                  tokens: deviceTokens.map(t => t.token),
                  data: {
                    type: "buzz_clue",
                    prize_id: prizeId,
                    clue_id: buzzClue.id
                  }
                }
              });
            } catch (error) {
              console.error(`Error sending push notification to user ${user.id}: ${error}`);
            }
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        clue: buzzClue
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in send-buzz-clue function:", error);
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

async function generateBuzzClue(apiKey: string, city: string, address: string) {
  try {
    const prompt = `Genera un indizio speciale "Buzz" che sia più specifico degli indizi settimanali, per un oggetto nascosto a ${city} in ${address}, senza mai dire l'indirizzo completo. L'indizio deve essere dettagliato ma lasciare comunque circa 500 metri di incertezza.
    
Formatta la risposta come un oggetto JSON con 3 campi: "italian", "english", "french".

Usa uno stile narrativo coinvolgente e misterioso, questo è un indizio speciale che gli utenti ottengono dopo un pagamento.`;

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
      return { error: `OpenAI API error: ${response.status} ${errorText}` };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // Look for JSON object in the response
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return { data: JSON.parse(jsonMatch[0]) };
      } else {
        // Try parsing the whole content as JSON
        return { data: JSON.parse(content) };
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.error("AI response content:", content);
      return { error: `Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}` };
    }
  } catch (error) {
    console.error("Error generating buzz clue with AI:", error);
    return { error };
  }
}
