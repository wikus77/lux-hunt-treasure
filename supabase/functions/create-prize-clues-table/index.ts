
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
    
    // Create authenticated Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
      
      // Execute a stored procedure query to avoid permissions issues
      // This will use a Postgres function to run our SQL commands
      // First, check if the prize_clues table exists
      const { data, error } = await supabase
        .from('prizes')  // Use a table we know exists
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error("Database connection test failed:", error);
        throw new Error(`Database connection test failed: ${error.message}`);
      }
      
      console.log("Database connection test successful");
      
      // Now check if prize_clues table exists
      const { data: tableExists, error: tableError } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'prize_clues' }
      ).catch(() => {
        // If the function doesn't exist, let's assume the table doesn't exist
        return { data: false, error: null };
      });
      
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
      
      // Execute the SQL to create the table
      // Use the REST API directly with the service role key
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_admin_command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ 
          command: createTableQuery 
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API error: ${res.status} ${res.statusText}`, errorText);
        
        // Since we encountered an error, we'll provide SQL for manual execution
        return new Response(
          JSON.stringify({
            error: `API creation failed: ${res.status} ${res.statusText}`,
            details: "Esegui il codice SQL manualmente tramite l'SQL Editor",
            sql: createTableQuery
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
      
      // Verify the table was created successfully
      console.log("Table creation command sent, verifying...");
      
      // Wait a moment for the table to be created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the table exists now
      try {
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
