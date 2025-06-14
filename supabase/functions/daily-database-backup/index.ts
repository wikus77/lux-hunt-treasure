
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Array of sensitive tables to backup
const TABLES_TO_BACKUP = [
  "profiles",
  "user_roles",
  "clues",
  "subscriptions",
  "user_map_areas",
  "admin_logs",
  "abuse_logs",
  "system_logs"
];

serve(async (req) => {
  // Handle CORS preflight requests
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
    
    console.log("Starting daily backup process...");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupData: Record<string, any> = {};
    let totalRecords = 0;
    
    // Create a backup log entry
    const { data: backupLog, error: backupLogError } = await supabase
      .from("backup_logs")
      .insert({
        backup_type: "daily",
        status: "in_progress"
      })
      .select()
      .single();
      
    if (backupLogError) {
      throw new Error(`Error creating backup log: ${backupLogError.message}`);
    }
    
    const backupId = backupLog.id;
    console.log(`Backup ID: ${backupId}`);
    
    // Backup each table
    for (const table of TABLES_TO_BACKUP) {
      console.log(`Backing up table: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select("*");
        
      if (error) {
        throw new Error(`Error backing up ${table}: ${error.message}`);
      }
      
      backupData[table] = data;
      totalRecords += data.length;
      console.log(`Backed up ${data.length} records from ${table}`);
    }
    
    // Convert to JSON and store in bucket
    const jsonData = JSON.stringify(backupData, null, 2);
    const filePath = `backups/daily-backup-${timestamp}.json`;
    
    // Create storage bucket if it doesn't exist
    const { error: bucketError } = await supabase
      .storage
      .createBucket("backups", {
        public: false,
        fileSizeLimit: 52428800 // 50MB
      });
      
    // Ignore error if bucket already exists
    if (bucketError && !bucketError.message.includes("already exists")) {
      throw new Error(`Error creating bucket: ${bucketError.message}`);
    }
    
    // Upload backup file
    const { error: uploadError } = await supabase
      .storage
      .from("backups")
      .upload(filePath, new Blob([jsonData]), {
        contentType: "application/json",
        cacheControl: "3600"
      });
      
    if (uploadError) {
      throw new Error(`Error uploading backup: ${uploadError.message}`);
    }
    
    // Create a signed URL for the backup file
    const { data: signedUrl, error: signedUrlError } = await supabase
      .storage
      .from("backups")
      .createSignedUrl(filePath, 60 * 60 * 48); // 48 hours expiry
      
    if (signedUrlError) {
      throw new Error(`Error creating signed URL: ${signedUrlError.message}`);
    }
    
    // Update backup log
    const fileSize = new Blob([jsonData]).size;
    await supabase
      .from("backup_logs")
      .update({
        status: "completed",
        file_size: fileSize,
        storage_path: filePath,
        duration_seconds: Math.floor((Date.now() - new Date(backupLog.created_at).getTime()) / 1000)
      })
      .eq("id", backupId);
      
    // Try to send email with backup link
    try {
      await sendBackupEmail(supabase, "founder@m1ssion.com", signedUrl.signedUrl, timestamp, totalRecords);
      console.log("Backup email sent successfully");
    } catch (emailError) {
      console.error("Failed to send backup email:", emailError);
      // Log error but don't fail the backup process
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: "Backup completed successfully",
      timestamp,
      tables: TABLES_TO_BACKUP,
      recordCount: totalRecords,
      backupId
    }), { 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    });

  } catch (err) {
    console.error("Backup error:", err);
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

async function sendBackupEmail(
  supabase: any,
  recipient: string,
  backupUrl: string,
  timestamp: string,
  recordCount: number
) {
  const { error } = await supabase.functions.invoke("send-mailjet-email", {
    body: {
      recipient_email: recipient,
      subject: `M1SSION Database Backup - ${timestamp}`,
      template_id: "backup-notification",
      variables: {
        backup_url: backupUrl,
        backup_date: new Date().toLocaleDateString(),
        record_count: recordCount,
        expiry_hours: 48
      }
    }
  });
  
  if (error) throw new Error(`Email sending failed: ${error.message}`);
}
