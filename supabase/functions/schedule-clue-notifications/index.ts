
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Server configuration error: missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Determine current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Get active prizes
    const { data: activePrizes, error: prizesError } = await supabase
      .from('prizes')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today.toISOString())
      .gte('end_date', today.toISOString());
      
    if (prizesError) {
      throw new Error(`Error fetching active prizes: ${prizesError.message}`);
    }
    
    if (!activePrizes || activePrizes.length === 0) {
      console.log("No active prizes found");
      return new Response(
        JSON.stringify({ message: "No active prizes found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get all users with their subscription tiers
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier');
      
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }
    
    if (!users || users.length === 0) {
      console.log("No users found");
      return new Response(
        JSON.stringify({ message: "No users found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For each user, determine if they should receive clues today based on their tier
    const results = {
      total_users: users.length,
      eligible_users: 0,
      notifications_sent: 0,
      errors: 0
    };

    for (const user of users) {
      // Check if user should receive notification today based on subscription tier
      let shouldReceiveToday = false;
      
      switch (user.subscription_tier) {
        case 'free':
          // Free users receive notifications only on Thursday (4)
          shouldReceiveToday = (dayOfWeek === 4);
          break;
        case 'silver':
          // Silver users receive notifications on Monday (1), Wednesday (3), Friday (5)
          shouldReceiveToday = [1, 3, 5].includes(dayOfWeek);
          break;
        case 'gold':
          // Gold users receive notifications on Monday (1), Tuesday (2), Wednesday (3), Thursday (4), Saturday (6)
          shouldReceiveToday = [1, 2, 3, 4, 6].includes(dayOfWeek);
          break;
        case 'black':
          // Black users receive notifications every day
          shouldReceiveToday = true;
          break;
        default:
          // Default to free tier schedule
          shouldReceiveToday = (dayOfWeek === 4);
      }
      
      if (!shouldReceiveToday) {
        continue;
      }
      
      results.eligible_users++;
      
      // For each active prize, check if the user has already received all clues
      for (const prize of activePrizes) {
        try {
          // Get prize clues that are weekly (not buzz clues)
          const { data: prizeClues, error: cluesError } = await supabase
            .from('prize_clues')
            .select('*')
            .eq('prize_id', prize.id)
            .eq('clue_type', 'weekly')
            .order('week', { ascending: true });
            
          if (cluesError) {
            throw new Error(`Error fetching clues for prize ${prize.id}: ${cluesError.message}`);
          }
          
          if (!prizeClues || prizeClues.length === 0) {
            console.log(`No clues found for prize ${prize.id}`);
            continue;
          }
          
          // Get clues that the user has already received for this prize
          const { data: userClues, error: userCluesError } = await supabase
            .from('user_clues')
            .select('clue_id')
            .eq('user_id', user.id);
            
          if (userCluesError) {
            throw new Error(`Error fetching user clues: ${userCluesError.message}`);
          }
          
          // Create a set of clue IDs the user has already received
          const receivedClueIds = new Set((userClues || []).map(uc => uc.clue_id));
          
          // Find the first clue the user hasn't received yet
          const nextClue = prizeClues.find(clue => !receivedClueIds.has(clue.id));
          
          if (nextClue) {
            // Get user's device tokens for push notifications
            const { data: deviceTokens, error: tokensError } = await supabase
              .from('device_tokens')
              .select('token')
              .eq('user_id', user.id);
              
            if (tokensError) {
              console.error(`Error fetching device tokens for user ${user.id}: ${tokensError.message}`);
              results.errors++;
              continue;
            }
            
            // Record that the user has received this clue
            const { error: insertError } = await supabase
              .from('user_clues')
              .insert({
                user_id: user.id,
                clue_id: nextClue.id,
                is_unlocked: true,
                unlocked_at: today.toISOString()
              });
              
            if (insertError) {
              console.error(`Error recording clue for user ${user.id}: ${insertError.message}`);
              results.errors++;
              continue;
            }
            
            // If the user has device tokens, send push notification
            if (deviceTokens && deviceTokens.length > 0) {
              try {
                await supabase.functions.invoke('send-push-notification', {
                  body: { 
                    title: `🔍 Nuovo indizio: settimana ${nextClue.week}`,
                    message: "Controlla il nuovo indizio per trovare l'auto!",
                    tokens: deviceTokens.map(t => t.token),
                    data: {
                      type: "weekly_clue",
                      prize_id: prize.id,
                      clue_id: nextClue.id,
                      week: nextClue.week
                    }
                  }
                });
                
                results.notifications_sent++;
              } catch (error) {
                console.error(`Error sending push notification to user ${user.id}: ${error}`);
                results.errors++;
              }
            }
            
            // Only send one clue per user per day (for the first eligible prize)
            break;
          }
        } catch (error) {
          console.error(`Error processing prize ${prize.id} for user ${user.id}: ${error}`);
          results.errors++;
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        message: `Processed ${results.eligible_users} eligible users. Sent ${results.notifications_sent} notifications with ${results.errors} errors.`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in schedule-clue-notifications function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
