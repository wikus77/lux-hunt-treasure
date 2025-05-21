
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
    
    // Create authenticated Supabase client with service role key and proper config
    console.log("Creating Supabase client with service role...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Simple connectivity test using a lightweight query
    console.log("Testing database connection...");
    try {
      const { data: pingData, error: pingError } = await supabase
        .from('_test_connection')
        .select('*')
        .limit(1)
        .catch(() => ({ data: null, error: { message: "Connection failed" }}));

      if (pingError) {
        // Try alternative connection test if the first one fails
        const { data: altData, error: altError } = await supabase
          .from('profiles')
          .select('count(*)', { count: 'exact', head: true });

        if (altError) {
          console.error("Database connection test failed:", altError);
          throw new Error(`Database connection test failed: ${altError.message}`);
        }
        
        console.log("Database connection test successful (alternative method)");
      } else {
        console.log("Database connection test successful");
      }
    } catch (connError) {
      console.error("Test diagnostico fallito: problema con SUPABASE_SERVICE_ROLE_KEY o rete", connError);
      throw new Error(`Connection test failed: ${connError.message}`);
    }
    
    // Check if prize_clues table exists using information schema
    console.log("Checking if prize_clues table exists...");
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'prize_clues')
      .maybeSingle();
    
    if (tableCheckError) {
      console.error("Error checking if table exists:", tableCheckError);
    }
    
    if (tableExists) {
      console.log("Table 'prize_clues' already exists");
      return new Response(
        JSON.stringify({ 
          exists: true, 
          message: "La tabella prize_clues è già presente" 
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
    
    // Create the table using direct table creation methods
    try {
      console.log("Attempting to create the prize_clues table...");
      
      // Create the table
      const { error: createTableError } = await supabase
        .from('prize_clues')
        .insert(null)
        .select()
        .limit(0)
        .catch(err => {
          // If table doesn't exist, we'll get an error, which is expected
          return { error: err };
        });

      if (createTableError && !createTableError.message.includes('relation "prize_clues" does not exist')) {
        console.error("Unexpected error:", createTableError);
      }
      
      // Create the table definition by executing the CREATE TABLE statement
      const { error: defineTableError } = await supabase
        .from('_schema_migrations')
        .insert({
          name: 'create_prize_clues_table',
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
          `
        })
        .select()
        .limit(0)
        .catch(err => {
          // Table might already exist or other issue
          console.error("Error creating table definition:", err);
          return { error: err };
        });
      
      if (defineTableError && !defineTableError.message.includes('relation "_schema_migrations" does not exist')) {
        console.error("Error creating table definition:", defineTableError);
      }
      
      // Enable RLS and create policies
      const enableRlsAndPoliciesSql = `
        ALTER TABLE IF EXISTS public.prize_clues ENABLE ROW LEVEL SECURITY;
        
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
      
      // Alternative approach using direct table operations
      console.log("Verifying table creation...");
      
      // Final verification - Check if table exists now
      const { data: verifyTable, error: verifyError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', 'prize_clues')
        .maybeSingle();
      
      if (verifyError) {
        console.error("Error during verification:", verifyError);
      }
      
      if (verifyTable) {
        console.log("Table 'prize_clues' verified and exists");
        
        return new Response(
          JSON.stringify({ 
            created: true, 
            message: "La tabella prize_clues è stata creata correttamente" 
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      } else {
        console.log("Table creation could not be verified, falling back to SQL backup");
        
        // Return the SQL for manual execution
        return new Response(
          JSON.stringify({ 
            created: false, 
            message: "È necessario creare la tabella manualmente tramite SQL Editor",
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
            status: 202,  // Accepted but requires action
            headers: {
              "Content-Type": "application/json", 
              ...corsHeaders,
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
