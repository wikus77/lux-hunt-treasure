
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
    
    // First check if table already exists using pg_catalog
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'prize_clues')
      .maybeSingle();
    
    if (tableCheckError) {
      console.log("Error checking if table exists via pg_catalog:", tableCheckError);
      // Continue with creation attempt as the error might be due to permissions
    } else if (tableExists) {
      console.log("Table 'prize_clues' already exists according to pg_catalog");
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
    
    // Attempt to check if table exists with SELECT
    try {
      const { data, error } = await supabase
        .from('prize_clues')
        .select('count(*)', { count: 'exact', head: true });
      
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
      } else {
        console.log("Table check error (expected if table doesn't exist):", error.message);
      }
    } catch (checkError) {
      console.log("Check table error (expected if table doesn't exist):", checkError.message);
    }
    
    // Table doesn't exist, create it directly with SQL
    console.log("Creating prize_clues table using direct SQL");
    
    try {
      // Create table using direct SQL
      const createTableSQL = `
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
      `;
      
      const { error: createError } = await supabase.rpc('exec', { query: createTableSQL });
      
      if (createError) {
        console.error("Error creating table:", createError);
        throw new Error(`Failed to create table: ${createError.message}`);
      }
      
      // Enable RLS
      const enableRlsSQL = `ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;`;
      await supabase.rpc('exec', { query: enableRlsSQL });
      
      // Add policy for admins
      const createPolicySQL = `
        CREATE POLICY "Admin users can manage prize clues"
          ON public.prize_clues
          USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
      `;
      await supabase.rpc('exec', { query: createPolicySQL });
      
      console.log("Table 'prize_clues' created successfully with RLS and policies");
      
      // Verify the table was created successfully
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('prize_clues')
          .select('count(*)', { count: 'exact', head: true });
        
        if (verifyError) {
          console.error("Table verification failed:", verifyError);
          return new Response(
            JSON.stringify({ 
              exists: false, 
              created: false, 
              error: "Table creation claimed success but verification failed", 
              details: verifyError.message
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
        
        console.log("Table 'prize_clues' created and verified successfully");
      } catch (verifyError) {
        console.error("Verification error:", verifyError);
      }
      
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
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError);
      
      return new Response(
        JSON.stringify({ 
          error: sqlError.message || "SQL execution error",
          details: sqlError
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
    
  } catch (error) {
    console.error("Error in create-prize-clues-table function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        stack: error.stack,
        details: "Controlla i log della Edge Function per maggiori informazioni"
      }),
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
