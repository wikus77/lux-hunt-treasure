
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
    
    // First check if table already exists by attempting a count query
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
    
    // Table doesn't exist, create it using the public.query function we've created
    console.log("Creating prize_clues table using public.query function");
    
    try {
      // Create the table SQL
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
      
      // Run SQL to create table using our custom query function
      const { error: createTableError } = await supabase.rpc(
        'query',
        { query_text: createTableSQL }
      );
      
      if (createTableError) {
        console.error("Error creating table:", createTableError);
        
        // Try direct SQL as a fallback approach
        try {
          // Call custom function to execute SQL directly
          console.log("Attempting to create table using direct SQL via execute_sql function");
          
          const { error: directSqlError } = await supabase.rpc(
            'execute_sql',
            { sql: createTableSQL }
          );
          
          if (directSqlError) {
            throw new Error(`Direct SQL execution failed: ${directSqlError.message}`);
          }
        } catch (directError) {
          console.error("Direct SQL execution error:", directError);
          throw directError;
        }
      }
      
      // Enable RLS
      const enableRlsSQL = `ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;`;
      await supabase.rpc('query', { query_text: enableRlsSQL }).catch(e => {
        console.log("Enable RLS error (continuing):", e.message);
      });
      
      // Add policy for admins if it doesn't exist
      const createPolicySQL = `
        CREATE POLICY IF NOT EXISTS "Admin users can manage prize clues"
          ON public.prize_clues
          USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
      `;
      
      await supabase.rpc('query', { query_text: createPolicySQL }).catch(e => {
        console.log("Create policy error (continuing):", e.message);
      });
      
      console.log("Table 'prize_clues' creation attempted successfully");
      
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
              error: "Table creation attempted but verification failed", 
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
      } catch (verifyError) {
        console.error("Verification error:", verifyError);
        return new Response(
          JSON.stringify({ 
            error: verifyError.message || "Verification error",
            details: "Table creation was attempted but could not be verified"
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
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError);
      
      return new Response(
        JSON.stringify({ 
          error: sqlError.message || "SQL execution error",
          details: "È necessario creare la tabella manualmente tramite SQL Editor",
          sql: `
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

-- Enable RLS
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;

-- Add policy for admins
CREATE POLICY IF NOT EXISTS "Admin users can manage prize clues"
  ON public.prize_clues
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
`
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
  } catch (error) {
    console.error("Error in create-prize-clues-table function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        stack: error.stack,
        details: "Controlla i log della Edge Function per maggiori informazioni",
        manual_sql: `
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

-- Enable RLS
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;

-- Add policy for admins
CREATE POLICY IF NOT EXISTS "Admin users can manage prize clues"
  ON public.prize_clues
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
`
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
