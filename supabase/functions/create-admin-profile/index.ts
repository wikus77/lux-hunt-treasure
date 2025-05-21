
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Supporto per richieste OPTIONS (preflight)
const handleOptions = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

serve(async (req) => {
  // Gestione delle richieste CORS preflight
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { userId, email } = await req.json();
    
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "User ID and email are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Special check - only allow for admin email
    if (email !== "wikus77@hotmail.it") {
      return new Response(
        JSON.stringify({ error: "This function is only for the admin user" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔄 Creating admin profile for:", email);
    
    // First check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .or(`id.eq.${userId},email.eq.${email}`)
      .maybeSingle();
      
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("❌ Error checking for existing profile:", fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to check for existing profile",
          details: fetchError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // If profile exists, update it to admin role
    if (existingProfile) {
      console.log("✅ Profile already exists, updating to admin role");
      
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", existingProfile.id)
        .select()
        .single();
        
      if (updateError) {
        console.error("❌ Error updating profile:", updateError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to update profile", 
            details: updateError 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Profile updated to admin role",
          profile: updatedProfile
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create new admin profile
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        role: "admin",
        full_name: "Admin User",
      })
      .select()
      .single();
      
    if (insertError) {
      console.error("❌ Error creating admin profile:", insertError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create admin profile", 
          details: insertError 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("✅ Admin profile created successfully:", newProfile);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin profile created successfully",
        profile: newProfile
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Unexpected error", 
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
