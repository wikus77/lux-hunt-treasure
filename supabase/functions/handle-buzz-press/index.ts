// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import { corsHeaders, handleOptions, ok, err } from '../_shared/cors.ts'
import { getBuzzLevelFromCount } from '../_shared/buzzMapPricing.ts'
import { generateMissionClue, getCurrentWeekOfYear } from '../_shared/clueGenerator.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }

  const origin = req.headers.get('origin');

  try {
    console.log('🎯 [HANDLE-BUZZ-PRESS] Function started');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('👤 [HANDLE-BUZZ-PRESS] User authenticated:', user.id);

    // Parse request body to check if this is BUZZ MAP
    const body = await req.json();
    const { generateMap, coordinates, sessionId } = body;
    
    // Handle BUZZ MAP flow
    if (generateMap && coordinates) {
      console.log('🗺️ [HANDLE-BUZZ-PRESS] Processing BUZZ MAP generation');
      
      // Count existing buzz map areas to determine level
      const { count, error: countError } = await supabase
        .from('user_map_areas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');
        
      if (countError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error counting map areas:', countError);
        throw new Error('Failed to count existing areas');
      }
      
      const currentCount = count ?? 0;
      const level = Math.min(currentCount + 1, 60);
      const buzzLevel = getBuzzLevelFromCount(currentCount);
      
      console.log('🗺️ [HANDLE-BUZZ-PRESS] Creating BUZZ MAP area:', {
        level,
        radiusKm: buzzLevel.radiusKm,
        priceCents: buzzLevel.priceCents,
        coordinates
      });
      
      // Create the map area
      const { data: mapArea, error: mapError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: user.id,
          lat: coordinates.lat,
          lng: coordinates.lng,
          center_lat: coordinates.lat,
          center_lng: coordinates.lng,
          radius_km: buzzLevel.radiusKm,
          source: 'buzz_map',
          level: level,
          price_eur: buzzLevel.priceCents / 100,
          week: Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000))
        })
        .select()
        .single();
        
      if (mapError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error creating map area:', mapError);
        throw new Error('Failed to create map area');
      }
      
      // Log the action
      const { error: actionError } = await supabase
        .from('buzz_map_actions')
        .insert({
          user_id: user.id,
          clue_count: level,
          cost_eur: buzzLevel.priceCents / 100,
          radius_generated: buzzLevel.radiusKm
        });
        
      if (actionError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error logging action:', actionError);
      }
      
      const response = {
        success: true,
        level: level,
        radius_km: buzzLevel.radiusKm,
        price_eur: buzzLevel.priceCents / 100,
        coordinates: coordinates,
        area_id: mapArea.id,
        message: 'BUZZ MAP area created successfully'
      };
      
      console.log('🎉 [HANDLE-BUZZ-PRESS] BUZZ MAP completed:', response);
      
      return ok(origin, response);
    }

    // 🎯 M1SSION™ CLUE ENGINE: Generate clue using original logic with weeks/tiers/antiforcing
    console.log('🎯 [HANDLE-BUZZ-PRESS] Generating clue using M1SSION™ engine...');
    
    let buzzCount = 0;
    try {
      // Get user's weekly BUZZ count
      const { data: counterData } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (counterData && counterData.length > 0) {
        buzzCount = counterData.reduce((sum, row) => sum + (row.buzz_count || 0), 0);
      }
    } catch (error) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Error fetching buzz count:', error);
    }

    const weekOfYear = getCurrentWeekOfYear();
    const clueData = generateMissionClue({ userId: user.id, buzzCount, weekOfYear });
    const clueText = clueData.text;
    
    console.log('🎯 [HANDLE-BUZZ-PRESS] CLUE GENERATED:', {
      tier: clueData.tier,
      week: clueData.week,
      difficulty: clueData.difficulty,
      buzzCount,
      textPreview: clueText.substring(0, 50) + '...'
    });

    // Log the BUZZ action
    const { error: logError } = await supabase
      .from('buzz_logs')
      .insert({
        user_id: user.id,
        action: 'buzz_press',
        metadata: {
          clue_text: clueText,
          source: 'handle_buzz_press',
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Log error:', logError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] BUZZ logged successfully');
    }

    // Create notification
    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: user.id,
        type: 'buzz',
        title: '🎯 Nuovo Indizio BUZZ!',
        message: clueText,
        metadata: {
          clue_text: clueText,
          source: 'buzz_press'
        }
      });

    if (notificationError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Notification error:', notificationError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] Notification created successfully');
    }

    const response = {
      success: true,
      clue_text: clueText,
      message: 'BUZZ processed successfully'
    };

    console.log('🎉 [HANDLE-BUZZ-PRESS] Function completed successfully:', response);

    return ok(origin, response);

  } catch (error) {
    console.error('❌ [HANDLE-BUZZ-PRESS] Function error:', error);
    return err(origin, 500, 'FUNCTION_ERROR', error.message);
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™