
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly BUZZ generation...");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get current week and year
    const { data: weekData } = await supabaseAdmin.rpc('get_current_week_and_year');
    const currentWeek = weekData[0].week_num;
    const currentYear = weekData[0].year_num;
    
    console.log(`Current week: ${currentWeek}, year: ${currentYear}`);

    // Get all active users with their subscription tiers
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, subscription_tier, preferred_language, email')
      .not('subscription_tier', 'is', null);

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    console.log(`Processing ${users?.length || 0} users`);

    // Get subscription tier data
    const { data: tiers, error: tiersError } = await supabaseAdmin
      .from('subscription_tiers')
      .select('*');

    if (tiersError) {
      throw new Error(`Error fetching tiers: ${tiersError.message}`);
    }

    const tierMap = Object.fromEntries(tiers.map(tier => [tier.name, tier]));

    // Get active prizes for current week
    const { data: activePrizes, error: prizesError } = await supabaseAdmin
      .from('admin_prizes')
      .select('*')
      .eq('week', currentWeek)
      .eq('is_active', true);

    if (prizesError) {
      console.error("Error fetching prizes:", prizesError.message);
    }

    let processedUsers = 0;
    let totalBuzzGenerated = 0;
    let totalCluesGenerated = 0;

    for (const user of users || []) {
      try {
        const userTier = user.subscription_tier || 'Free';
        const tier = tierMap[userTier];
        
        if (!tier) {
          console.log(`Unknown tier for user ${user.id}: ${userTier}`);
          continue;
        }

        // Check if user already has allowance for this week
        const { data: existingAllowance } = await supabaseAdmin
          .from('weekly_buzz_allowances')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_number', currentWeek)
          .eq('year', currentYear)
          .single();

        if (existingAllowance) {
          console.log(`User ${user.id} already has allowance for week ${currentWeek}`);
          continue;
        }

        // Create weekly buzz allowance
        const { error: allowanceError } = await supabaseAdmin
          .from('weekly_buzz_allowances')
          .insert({
            user_id: user.id,
            week_number: currentWeek,
            year: currentYear,
            max_buzz_count: tier.max_weekly_buzz,
            used_buzz_count: 0
          });

        if (allowanceError) {
          console.error(`Error creating allowance for user ${user.id}:`, allowanceError.message);
          continue;
        }

        // Generate clues based on subscription tier
        const clueCount = Math.min(tier.max_weekly_buzz, 3); // Max 3 clues per week
        const userLanguage = user.preferred_language || 'italiano';
        
        const clues = [];
        for (let i = 0; i < clueCount; i++) {
          const clue = {
            user_id: user.id,
            clue_id: crypto.randomUUID(),
            title_it: `Indizio Settimanale ${i + 1}`,
            title_en: userLanguage === 'english' ? `Weekly Clue ${i + 1}` : null,
            title_fr: userLanguage === 'francais' ? `Indice Hebdomadaire ${i + 1}` : null,
            description_it: `Descrizione indizio per settimana ${currentWeek}`,
            description_en: userLanguage === 'english' ? `Clue description for week ${currentWeek}` : null,
            description_fr: userLanguage === 'francais' ? `Description de l'indice pour la semaine ${currentWeek}` : null,
            clue_type: i === 0 ? 'precise' : (i === 1 ? 'moderate' : 'vague'),
            buzz_cost: i === 0 ? 0 : (i + 1) * 1.99
          };
          clues.push(clue);
        }

        // Insert clues
        if (clues.length > 0) {
          const { error: cluesError } = await supabaseAdmin
            .from('user_clues')
            .insert(clues);

          if (cluesError) {
            console.error(`Error inserting clues for user ${user.id}:`, cluesError.message);
          } else {
            totalCluesGenerated += clues.length;
          }
        }

        // Generate initial map area if there are active prizes
        if (activePrizes && activePrizes.length > 0) {
          const prize = activePrizes[0]; // Use first active prize
          
          const { error: mapError } = await supabaseAdmin
            .from('user_map_areas')
            .insert({
              user_id: user.id,
              week: currentWeek,
              lat: prize.lat || 41.9028, // Default to Rome
              lng: prize.lng || 12.4964,
              radius_km: 100, // Initial radius 100km
              clue_id: clues[0]?.clue_id
            });

          if (mapError) {
            console.error(`Error creating map area for user ${user.id}:`, mapError.message);
          }
        }

        // Log the generation
        const { error: logError } = await supabaseAdmin
          .from('buzz_generation_logs')
          .insert({
            user_id: user.id,
            week_number: currentWeek,
            year: currentYear,
            buzz_count_generated: tier.max_weekly_buzz,
            clues_generated: clues.length,
            subscription_tier: userTier
          });

        if (logError) {
          console.error(`Error logging generation for user ${user.id}:`, logError.message);
        }

        totalBuzzGenerated += tier.max_weekly_buzz;
        processedUsers++;
        
        console.log(`Processed user ${user.id} (${userTier}): ${tier.max_weekly_buzz} buzz, ${clues.length} clues`);

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError.message);
      }
    }

    const result = {
      success: true,
      week: currentWeek,
      year: currentYear,
      processedUsers,
      totalBuzzGenerated,
      totalCluesGenerated,
      activePrizes: activePrizes?.length || 0
    };

    console.log("Weekly BUZZ generation completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in weekly BUZZ generation:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
