
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
    console.log("Create prize_clues table function called");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the table exists
    const { data, error } = await supabase
      .from('prize_clues')
      .select('count(*)', { count: 'exact', head: true });
    
    // If no error, table exists
    if (!error) {
      console.log("Table 'prize_clues' already exists");
      return new Response(
        JSON.stringify({ exists: true, message: "Table 'prize_clues' already exists" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    if (!error.message.includes("relation") && !error.message.includes("does not exist")) {
      // Some other error occurred
      console.error("Error checking table:", error);
      return new Response(
        JSON.stringify({ exists: false, error: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Table doesn't exist, create it
    console.log("Table 'prize_clues' doesn't exist, creating it...");
    
    // Create the table using SQL
    const { error: createError } = await supabase.rpc(
      'exec',
      {
        query: `
          CREATE TABLE IF NOT EXISTS public.prize_clues (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            prize_id UUID REFERENCES public.prizes(id) NOT NULL,
            week INTEGER NOT NULL,
            clue_type TEXT NOT NULL DEFAULT 'regular',
            title_it TEXT NOT NULL,
            title_en TEXT,
            title_fr TEXT,
            description_it TEXT NOT NULL,
            description_en TEXT,
            description_fr TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          
          ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Admin users can manage prize clues"
            ON public.prize_clues
            USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
        `
      }
    );
    
    if (createError) {
      console.error("Error creating table:", createError);
      return new Response(
        JSON.stringify({ 
          exists: false, 
          created: false, 
          error: createError.message,
          message: "Failed to create table 'prize_clues'"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    console.log("Table 'prize_clues' created successfully");
    
    return new Response(
      JSON.stringify({ 
        exists: false, 
        created: true, 
        message: "Table 'prize_clues' created successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
    
  } catch (error) {
    console.error("Error in create-prize-clues-table function:", error);
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
