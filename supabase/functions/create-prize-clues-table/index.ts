
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
    
    // First attempt to check if the table exists with direct query
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
      }
    } catch (checkError) {
      console.log("Check table error (expected if table doesn't exist):", checkError.message);
    }
    
    // Table doesn't exist or check failed, create it with SQL
    console.log("Attempting to create prize_clues table via SQL");
    
    // Create the table using SQL directly
    const { data, error } = await supabase.rpc(
      'exec',
      {
        query: `
          DO $$
          BEGIN
            -- Check if table exists first
            IF NOT EXISTS (
              SELECT FROM pg_tables 
              WHERE schemaname = 'public' 
                AND tablename = 'prize_clues'
            ) THEN
              -- Create table if it doesn't exist
              CREATE TABLE public.prize_clues (
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
              CREATE POLICY "Admin users can manage prize clues"
                ON public.prize_clues
                USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
                
              RAISE NOTICE 'Table prize_clues created successfully';
            ELSE
              RAISE NOTICE 'Table prize_clues already exists';
            END IF;
          END $$;
        `
      }
    );
    
    // Check for errors from SQL execution
    if (error) {
      console.error("Error creating table via SQL:", error);
      
      // Try alternative method with raw SQL if exec function fails
      const { error: sqlError } = await supabase.from('prize_clues').select('id').limit(1);
      
      if (sqlError && sqlError.message.includes("relation") && sqlError.message.includes("does not exist")) {
        console.log("Confirmed table does not exist, creating manually");
        
        // If table doesn't exist, try separate operations
        try {
          await supabase.rpc('exec', { 
            query: `CREATE TABLE IF NOT EXISTS public.prize_clues (
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
            );`
          });
          
          await supabase.rpc('exec', { 
            query: `ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;`
          });
          
          await supabase.rpc('exec', { 
            query: `CREATE POLICY "Admin users can manage prize clues" 
              ON public.prize_clues 
              USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');`
          });
          
          console.log("Table created successfully with separate operations");
          
          return new Response(
            JSON.stringify({ 
              exists: false, 
              created: true, 
              message: "Table 'prize_clues' created successfully via separate operations" 
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders
              }
            }
          );
        } catch (separateError) {
          console.error("Error in separate operations:", separateError);
          return new Response(
            JSON.stringify({ 
              error: separateError.message,
              message: "Failed to create table with separate operations",
              details: separateError
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
      }
      
      return new Response(
        JSON.stringify({ 
          exists: false, 
          created: false, 
          error: error.message,
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
