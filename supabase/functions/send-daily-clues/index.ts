
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
}

interface User {
  id: string;
  language?: string;
  device_token?: string;
}

interface Clue {
  id: string;
  week: number;
  title_it: string;
  title_en: string;
  title_fr: string;
  description_it: string;
  description_en: string;
  description_fr: string;
  location_label: string;
  lat: number;
  lng: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting daily clue distribution process...");
    
    // 1. Get all active subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan')
      .is('end_date', null)
      .or('end_date.gt.now()');
    
    if (subError) {
      throw new Error(`Error fetching subscriptions: ${subError.message}`);
    }
    
    console.log(`Found ${subscriptions?.length || 0} active subscriptions`);
    
    // Process each subscription
    for (const sub of subscriptions || []) {
      // 2. Check if user should receive a clue today based on subscription plan
      const { data: shouldReceive } = await supabase
        .rpc('should_receive_clue_today', { plan_type: sub.plan });
      
      if (!shouldReceive) {
        console.log(`User ${sub.user_id} with plan ${sub.plan} doesn't receive clues today`);
        continue;
      }
      
      // 3. Get user details (specifically language preference)
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('id, language')
        .eq('id', sub.user_id)
        .single();
      
      // Default to Italian if no language preference
      const userLanguage = userProfiles?.language || 'it';
      
      // 4. Get device token for push notification
      const { data: deviceTokens } = await supabase
        .from('device_tokens')
        .select('token')
        .eq('user_id', sub.user_id)
        .order('last_used', { ascending: false })
        .limit(1);
      
      // 5. Get all clues the user has already received
      const { data: receivedClues } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', sub.user_id);
      
      const receivedClueIds = (receivedClues || []).map(rc => rc.clue_id);
      
      // 6. Find the next clue for the appropriate week
      // Determine which week the user is currently in
      const weekCount = receivedClueIds.length > 0 ? Math.floor(receivedClueIds.length / 7) + 1 : 1;
      
      // Get a clue the user hasn't received yet for their current week
      const { data: nextClue } = await supabase
        .from('clues')
        .select('*')
        .eq('week', weekCount)
        .eq('type', 'regular')
        .not('id', 'in', `(${receivedClueIds.join(',')})`)
        .limit(1)
        .single();
      
      if (!nextClue) {
        console.log(`No new clues available for user ${sub.user_id} in week ${weekCount}`);
        continue;
      }
      
      // 7. Insert record in user_clues to mark this clue as sent
      const { error: insertError } = await supabase
        .from('user_clues')
        .insert({
          user_id: sub.user_id,
          clue_id: nextClue.id,
          delivery_type: 'push',
          sent_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error(`Failed to record clue delivery for user ${sub.user_id}: ${insertError.message}`);
        continue;
      }
      
      // 8. Send push notification
      if (deviceTokens && deviceTokens.length > 0) {
        // Get clue title and description based on user language
        const clueTitle = nextClue[`title_${userLanguage}`] || nextClue.title_it;
        const clueDescription = nextClue[`description_${userLanguage}`] || nextClue.description_it;
        
        // Call the send-push-notification edge function
        const { error: pushError } = await supabase.functions.invoke("send-push-notification", {
          body: {
            title: clueTitle,
            message: clueDescription,
            segments: ["All"],
            url: `/clue/${nextClue.id}`
          }
        });
        
        if (pushError) {
          console.error(`Error sending push notification to user ${sub.user_id}: ${pushError}`);
        } else {
          console.log(`Successfully sent clue ${nextClue.id} to user ${sub.user_id}`);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Daily clue distribution completed" }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
    
  } catch (error) {
    console.error("Error in send-daily-clues function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
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
};

serve(handler);
