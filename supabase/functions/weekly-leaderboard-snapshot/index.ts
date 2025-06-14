
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseKey || !supabaseUrl) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    console.log("Starting weekly leaderboard snapshot...");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `snapshots/leaderboard-${timestamp}.json`;
    
    // Create snapshot log entry
    const { data: snapshotLog, error: logError } = await supabase
      .from("snapshot_logs")
      .insert({
        snapshot_type: "leaderboard",
        file_path: filePath,
        status: "in_progress"
      })
      .select()
      .single();
      
    if (logError) {
      throw new Error(`Error creating snapshot log: ${logError.message}`);
    }
    
    // Fetch top 100 users from leaderboard
    // Assuming we have a view or function that returns the leaderboard data
    // Adjust this query to match your actual leaderboard data structure
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .rpc("get_leaderboard", { limit_count: 100 })
      .select();
    
    if (leaderboardError) {
      // If the RPC doesn't exist, try a direct query approach
      const { data: directData, error: directError } = await supabase
        .from("profiles")
        .select("id, full_name, agent_code, credits")
        .order("credits", { ascending: false })
        .limit(100);
        
      if (directError) {
        throw new Error(`Error fetching leaderboard data: ${directError.message}`);
      }
      
      leaderboardData = directData;
    }
    
    // Filter out the qa@mission.dev user if present
    const filteredData = leaderboardData.filter((user: any) => 
      user.email !== "qa@mission.dev" && 
      user.agent_code !== "AG-QA001"
    );
    
    // Create storage bucket if it doesn't exist
    const { error: bucketError } = await supabase
      .storage
      .createBucket("snapshots", {
        public: false,
        fileSizeLimit: 10485760 // 10MB
      });
      
    // Ignore error if bucket already exists
    if (bucketError && !bucketError.message.includes("already exists")) {
      throw new Error(`Error creating bucket: ${bucketError.message}`);
    }
    
    // Upload snapshot file
    const jsonData = JSON.stringify(filteredData, null, 2);
    const { error: uploadError } = await supabase
      .storage
      .from("snapshots")
      .upload(filePath, new Blob([jsonData]), {
        contentType: "application/json",
        cacheControl: "3600"
      });
      
    if (uploadError) {
      throw new Error(`Error uploading snapshot: ${uploadError.message}`);
    }
    
    // Update snapshot log
    await supabase
      .from("snapshot_logs")
      .update({
        status: "completed",
        record_count: filteredData.length
      })
      .eq("id", snapshotLog.id);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Leaderboard snapshot created successfully",
      timestamp,
      recordCount: filteredData.length,
      snapshotId: snapshotLog.id
    }), { 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });

  } catch (err) {
    console.error("Snapshot error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { 
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });
  }
});
