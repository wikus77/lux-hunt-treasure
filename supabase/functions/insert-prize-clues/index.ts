
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    console.log("Prize clues insertion function called");
    const { clues_data } = await req.json();
    
    if (!clues_data || !Array.isArray(clues_data) || clues_data.length === 0) {
      console.error("Invalid clues data:", clues_data);
      return new Response(
        JSON.stringify({ error: "Invalid or missing clues data" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          }
        }
      );
    }
    
    console.log(`Attempting to insert ${clues_data.length} clues`);
    console.log("First clue sample:", clues_data[0]);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Insert clues
    const { data, error } = await supabase
      .from('prize_clues')
      .insert(clues_data);
    
    if (error) {
      console.error("Error inserting clues:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          }
        }
      );
    }
    
    console.log("Clues inserted successfully");
    
    return new Response(
      JSON.stringify({ success: true, message: "Clues inserted successfully", count: clues_data.length }),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        }
      }
    );
    
  } catch (error) {
    console.error("Error in insert-prize-clues function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json", 
          ...corsHeaders,
        }
      }
    );
  }
});
