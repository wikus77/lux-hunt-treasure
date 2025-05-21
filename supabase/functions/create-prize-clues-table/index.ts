
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
        .from('profiles')
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
    
    // Now check if prize_clues table exists
    const { data: tableExists, error: tableError } = await supabase
      .rpc('check_table_exists', { table_name: 'prize_clues' })
      .single();
    
    if (tableError) {
      // If RPC function doesn't exist, we'll need to create it
      console.log("Table check error:", tableError);
      
      // Create the check_table_exists function if it doesn't exist
      await supabase.rpc('execute_sql', { 
        query_text: `
          CREATE OR REPLACE FUNCTION check_table_exists(table_name text) 
          RETURNS boolean 
          LANGUAGE plpgsql 
          SECURITY DEFINER
          AS $$
          DECLARE
            exists_result boolean;
          BEGIN
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = $1
            ) INTO exists_result;
            RETURN exists_result;
          END
          $$;
        `
      });
      
      // Now try to check again
      const { data: tablesCheck, error: checkError } = await supabase
        .rpc('check_table_exists', { table_name: 'prize_clues' })
        .single();
        
      if (checkError) {
        console.error("Failed to check if table exists:", checkError);
      } else {
        tableExists = tablesCheck;
      }
    }
    
    if (tableExists) {
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
    
    // Create the table directly using the service role client
    try {
      console.log("Attempting to create the prize_clues table...");
      
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

        -- Add policy for admins - use IF NOT EXISTS to avoid errors if it already exists
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
      
      // Execute the SQL directly
      const { data: result, error: sqlError } = await supabase
        .rpc('execute_sql', { query_text: createTableQuery });
      
      if (sqlError) {
        console.error("Error executing SQL:", sqlError);
        throw new Error(`SQL execution error: ${sqlError.message}`);
      }
      
      console.log("SQL executed successfully, verifying table...");
      
      // Verify the table was created successfully
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
