
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Add detailed logging for environment variables
console.log("Edge function environment check:");
console.log(`SUPABASE_URL defined: ${Boolean(supabaseUrl)}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY defined: ${Boolean(supabaseServiceKey)}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("⚠️ Missing required environment variables:");
  if (!supabaseUrl) console.error("- SUPABASE_URL is not defined");
  if (!supabaseServiceKey) console.error("- SUPABASE_SERVICE_ROLE_KEY is not defined");
}

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
    
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    
    // Create authenticated Supabase client with service role key
    console.log("Creating Supabase client with service role...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection with a simple query
    try {
      console.log("Testing database connection...");
      const { data, error } = await supabase
        .from('prizes')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error("Database connection test failed:", error);
        throw new Error(`Database connection test failed: ${error.message}`);
      }
      
      console.log("Database connection test successful");
    } catch (connError) {
      console.error("Test diagnostico fallito: problema con SUPABASE_SERVICE_ROLE_KEY o rete", connError);
      throw new Error(`Connection test failed: ${connError.message}`);
    }
    
    // Create the table directly using the service role client
    try {
      console.log("Attempting direct table creation with SQL...");
      
      // Define the SQL query to create the table if it doesn't exist
      const createTableQuery = `
        -- Create the prize_clues table
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
        DO $$
        BEGIN
          -- Check if policy already exists to avoid error
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'prize_clues'
            AND policyname = 'Admin users can manage prize clues'
          ) THEN
            EXECUTE 'CREATE POLICY "Admin users can manage prize clues" ON public.prize_clues USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = ''admin'')';
          END IF;
        END
        $$;
      `;
      
      // Now check if prize_clues table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('_rpc')
        .select('check_table_exists')
        .eq('table_name', 'prize_clues')
        .single();
      
      if (tableError) {
        console.log("Table check error, trying another method:", tableError);
        
        // Try alternative method to check if table exists
        const { data: tables, error: schemaError } = await supabase
          .rpc('check_table_exists', { table_name: 'prize_clues' });
        
        if (schemaError) {
          console.log("Alternative table check also failed:", schemaError);
        } else {
          console.log("Table existence check result (alternative method):", tables);
          
          if (tables === true) {
            console.log("Table 'prize_clues' already exists");
            return new Response(
              JSON.stringify({ 
                exists: true, 
                message: "Table 'prize_clues' already exists" 
              }),
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders
                }
              }
            );
          }
        }
      } else {
        console.log("Table existence check result:", tableExists);
        
        if (tableExists === true) {
          console.log("Table 'prize_clues' already exists");
          return new Response(
            JSON.stringify({ 
              exists: true, 
              message: "Table 'prize_clues' already exists" 
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            }
          );
        }
      }
      
      // Execute the SQL directly since RPC method might not be working
      console.log("Executing SQL directly...");
      const { data: result, error: sqlError } = await supabase
        .rpc('query', { query_text: createTableQuery });
      
      if (sqlError) {
        console.error("Error executing SQL:", sqlError);
        throw new Error(`SQL execution error: ${sqlError.message}`);
      }
      
      console.log("SQL executed successfully, verifying table...");
      
      // Verify the table was created successfully
      try {
        // Wait a moment for the table to be created
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: verifyData, error: verifyError } = await supabase
          .from('prize_clues')
          .select('count(*)', { count: 'exact', head: true });
        
        if (verifyError) {
          console.error("Verification failed after creation:", verifyError);
          throw new Error(`Verification failed: ${verifyError.message}`);
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
        console.error("Verification error after creation attempt:", verifyError);
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
      
      // Provide SQL for manual execution
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
        details: "Test diagnostico fallito: problema con SUPABASE_SERVICE_ROLE_KEY o rete",
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
