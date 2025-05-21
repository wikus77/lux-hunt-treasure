
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
    
    // Simple connectivity test using a lightweight query
    console.log("Testing database connection...");
    try {
      // Use a simple query to profiles table to test connection
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select("id")
        .limit(1);

      if (profileError) {
        console.error("Database connection test failed:", profileError);
        throw new Error("Database connection failed: " + profileError.message);
      } else {
        console.log("Test connessione riuscito");
      }
    } catch (connError) {
      console.error("Connessione fallita: controlla la rete o SUPABASE_SERVICE_ROLE_KEY", connError);
      throw new Error("Connection test failed: " + connError.message);
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
    
    // Create the table using direct SQL execution
    try {
      console.log("Attempting to create the prize_clues table...");
      
      // Direct SQL execution via RPC to create table
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
        
        -- Enable RLS
        ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;
        
        -- Add policy for admins (will ignore if already exists)
        DO $$
        BEGIN
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
      
      const { error: sqlError } = await supabase.rpc('execute_sql', { sql: createTableSQL });
      
      if (sqlError) {
        // If execute_sql RPC doesn't exist, fall back to direct table operations
        console.log("RPC failed, trying direct table operations:", sqlError.message);
        
        // Create the table directly using insert operation
        const { error: createError } = await supabase
          .from('prize_clues')
          .insert({ 
            prize_id: '00000000-0000-0000-0000-000000000000', 
            week: 1,
            title_it: 'SETUP_ROW', 
            description_it: 'SETUP_ROW'
          });
          
        if (createError && !createError.message.includes("relation") && !createError.message.includes("already exists")) {
          console.error("Error creating table:", createError.message);
          throw createError;
        }
        
        // Try to enable RLS and policies
        await supabase.rpc('execute_admin_command', { 
          command: "ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;" 
        }).catch(e => console.log("RLS might already be enabled:", e.message));
        
        await supabase.rpc('execute_admin_command', { 
          command: "CREATE POLICY \"Admin users can manage prize clues\" ON public.prize_clues USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');" 
        }).catch(e => console.log("Policy might already exist:", e.message));
      } else {
        console.log("Table created successfully via SQL");
      }
      
      // Verify table was created
      const { data: verifyTable, error: verifyError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', 'prize_clues')
        .maybeSingle();
        
      if (verifyError) {
        console.error("Error verifying table creation:", verifyError);
        throw verifyError;
      }
      
      if (!verifyTable) {
        console.error("Table verification failed - table not found after creation");
        throw new Error("Table creation verification failed");
      }
      
      console.log("Table 'prize_clues' created and verified successfully");
      
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
        details: "Connessione fallita: controlla la rete o SUPABASE_SERVICE_ROLE_KEY",
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
