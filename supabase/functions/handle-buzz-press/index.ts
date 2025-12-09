// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import { withCors } from '../_shared/cors.ts'
import { getBuzzLevelFromCount } from '../_shared/buzzMapPricing.ts'
// 🔥 REMOVED: No longer using hardcoded clue generator - now using prize_clues from database

// 🔍 Debug switch (controlled by ENV)
const DEBUG = Deno.env.get('DEBUG_BUZZ_MAP') === '1';
const dlog = (...args: unknown[]) => { if (DEBUG) console.log(...args); };

serve(withCors(async (req: Request): Promise<Response> => {
  // Debug/trace flags
  const wantsDebug = req.headers.get('x-m1-debug') === '1' || Deno.env.get('DEBUG_PANELS') === 'true';
  const wantsTrace = req.headers.get('x-debug') === '1';
  const origin = req.headers.get('origin') || null;

  try {
    console.log('🎯 [HANDLE-BUZZ-PRESS] Function started');
    console.log('[DEPLOY] handle-buzz-press build:', '2025-11-16T05:50:00Z');

    // TRACE: Request metadata
    if (wantsTrace) {
      console.log('[TRACE] Origin:', origin);
      console.log('[TRACE] Method:', req.method);
      console.log('[TRACE] Headers:', {
        authorization: !!req.headers.get('Authorization'),
        'x-client-info': req.headers.get('x-client-info'),
        'content-type': req.headers.get('content-type')
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    const sawAuth = !!authHeader;
    const jwtLen = sawAuth ? authHeader!.replace('Bearer ', '').length : 0;
    
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

    // Parse request body with compat layer for userId/user_id
    const rawBody = await req.json().catch(() => ({}));
    const userId = rawBody.userId ?? rawBody.user_id ?? user.id;
    const body = { ...rawBody, userId };
    const { mode, generateMap, coordinates: rawCoordinates, sessionId } = body;
    
    // 🔥 FIX: Normalize coordinates with strict validation
    function normalizeCoordinates(c: any): { lat: number; lng: number } | null {
      if (!c) return null;
      const lat = Number(Array.isArray(c) ? c[0] : c.lat);
      const lng = Number(Array.isArray(c) ? c[1] : c.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
      return { lat, lng };
    }
    
    const coordinates = normalizeCoordinates(rawCoordinates);
    const willMap = (generateMap === true || mode === 'map') && !!coordinates;
    
    // TRACE: Payload (only if wantsTrace)
    if (wantsTrace) {
      console.log('[TRACE] userId:', userId);
      console.log('[TRACE] mode:', mode);
      console.log('[TRACE] generateMap:', generateMap);
      console.log('[TRACE] rawCoordinates:', rawCoordinates);
      console.log('[TRACE] normalizedCoordinates:', coordinates);
      console.log('[TRACE] willMap:', willMap);
      console.log('[TRACE] sessionId:', sessionId);
    }
    
    dlog('[DBG] Branch decision', {
      mode,
      generateMap,
      typeGenerateMap: typeof generateMap,
      hasRawCoords: !!rawCoordinates,
      hasNormalizedCoords: !!coordinates,
      willMap
    });
    
    // Handle BUZZ MAP flow (strict validation)
    if (willMap) {
      dlog('[DBG] ENTERING MAP BRANCH');
      console.log('🗺️ [HANDLE-BUZZ-PRESS] Processing BUZZ MAP generation (SERVER-AUTHORITATIVE)');
      
      // 🔥 SERVER-AUTHORITATIVE: Use RPC to get next level
      dlog('[DBG] Calling RPC m1_get_next_buzz_level...');
      const { data: nextLevel, error: levelError } = await supabase
        .rpc('m1_get_next_buzz_level', { p_user_id: user.id })
        .single();

      if (levelError || !nextLevel) {
        console.error('❌ [HANDLE-BUZZ-PRESS] RPC m1_get_next_buzz_level error:', levelError);
        throw new Error('Failed to compute next level: ' + (levelError?.message || 'No data'));
      }

      const level = nextLevel.level;
      const radius_km = nextLevel.radius_km;
      const costM1U = nextLevel.m1u;
      const currentWeek = nextLevel.current_week;

      dlog('[DBG] SERVER-CALCULATED pricing (RPC):', {
        source: 'rpc_server',
        currentWeek: nextLevel.current_week,
        currentCount: nextLevel.current_count,
        nextLevel: level,
        radiusKm: radius_km,
        costM1U: costM1U
      });
      
      // 🔥 SERVER-AUTHORITATIVE: Spend M1U using server-calculated cost
      console.log('💎 [HANDLE-BUZZ-PRESS] Calling RPC to spend M1U...');
      const { data: spendResult, error: spendError } = await supabase.rpc('buzz_map_spend_m1u', {
        p_user_id: user.id,
        p_cost_m1u: costM1U,
        p_latitude: coordinates.lat,
        p_longitude: coordinates.lng,
        p_radius_km: radius_km
      });
      
      if (spendError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] M1U payment error:', spendError);
        throw new Error('M1U payment failed: ' + spendError.message);
      }
      
      if (!spendResult?.success) {
        const errorType = spendResult?.error || 'unknown';
        console.error('❌ [HANDLE-BUZZ-PRESS] M1U payment rejected:', { error: errorType });
        throw new Error('M1U payment rejected: ' + errorType);
      }
      
      console.log('✅ [HANDLE-BUZZ-PRESS] M1U spent successfully:', {
        spent: spendResult.spent,
        newBalance: spendResult.new_balance
      });
      
      // 💰 CASHBACK VAULT™ WIRING - Accumula cashback dopo pagamento riuscito
      // Solo se costM1U > 0 (pagamento effettivo, non gratuito)
      if (costM1U > 0) {
        try {
          // 1. Ottieni il tier dell'utente
          const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();
          
          const userTier = profile?.subscription_tier || 'Base';
          
          // 2. Calcola cashback in base al tier
          const CASHBACK_RATES: Record<string, number> = {
            'Base': 0.005,      // 0.5%
            'Silver': 0.01,     // 1%
            'Gold': 0.02,       // 2%
            'Black': 0.03,      // 3%
            'Titanium': 0.05,   // 5%
          };
          
          const rate = CASHBACK_RATES[userTier] || CASHBACK_RATES['Base'];
          const costEur = costM1U / 10; // 1 M1U = €0.10
          // 🔥 FIX: Garantisce almeno 1 M1U di cashback per ogni transazione
          const rawCashback = costEur * rate * 10;
          const cashbackM1U = Math.max(1, Math.ceil(rawCashback));
          
          if (cashbackM1U > 0) {
            console.log('💰 [HANDLE-BUZZ-PRESS] Accruing cashback:', { userTier, costEur, rate, cashbackM1U });
            
            // 3. Chiama RPC accrue_cashback
            const { error: cashbackError } = await supabase.rpc('accrue_cashback', {
              p_user_id: user.id,
              p_source_type: 'buzz_map',
              p_source_cost_eur: costEur,
              p_cashback_m1u: cashbackM1U,
              p_tier_at_time: userTier
            });
            
            if (cashbackError) {
              console.error('⚠️ [HANDLE-BUZZ-PRESS] Cashback accrual error (non-blocking):', cashbackError);
            } else {
              console.log('✅ [HANDLE-BUZZ-PRESS] Cashback accrued:', cashbackM1U, 'M1U');
            }
          }
        } catch (cashbackErr) {
          console.error('⚠️ [HANDLE-BUZZ-PRESS] Cashback error (non-blocking):', cashbackErr);
        }
      }
      
      // Create the map area with weekly counter (using RPC values)
      const { data: mapArea, error: mapError } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: user.id,
          lat: coordinates.lat,
          lng: coordinates.lng,
          center_lat: coordinates.lat,
          center_lng: coordinates.lng,
          radius_km: radius_km,
          source: 'buzz_map',
          level: level,
          price_eur: costM1U / 10,
          week: currentWeek
        })
        .select()
        .single();
        
      if (mapError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error creating map area:', mapError);
        throw new Error('Failed to create map area');
      }
      
      // ✅ Stable log: MAP area created successfully
      console.log('[BUZZ-MAP] area created', { 
        area_id: mapArea?.id, 
        level, 
        radius_km, 
        week: currentWeek 
      });
      
      // Log the action (using RPC values)
      const { error: actionError } = await supabase
        .from('buzz_map_actions')
        .insert({
          user_id: user.id,
          clue_count: level,
          cost_eur: costM1U / 10,
          radius_generated: radius_km
        });
        
      if (actionError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error logging action:', actionError);
      }
      
      const response = {
        success: true,
        mode: 'map',
        area: {
          id: mapArea.id,
          center_lat: coordinates.lat,
          center_lng: coordinates.lng,
          radius_km: radius_km,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        area_id: mapArea.id,
        level: level,
        radius_km: radius_km,
        price_eur: costM1U / 10,
        cost_m1u: costM1U,
        new_balance: spendResult.new_balance,
        week: currentWeek
      };

      // Add debug block if requested
      const debugBlock = wantsDebug ? {
        sawAuthorizationHeader: sawAuth,
        jwtLen,
        requestOrigin: origin,
        allowedOrigin: origin,
        userId: user.id.substring(0, 8) + '...',
        flow: 'BUZZ_MAP'
      } : undefined;

      const responseBody = wantsDebug ? { ...response, __debug: debugBlock } : response;
      
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      dlog('[DBG] ENTERING CLUE BRANCH (no map generation)', {
        generateMap,
        coordinates
      });
    }

    // 🎯 M1SSION™ CLUE ENGINE V2: Progressive weekly clues with anti-duplication
    console.log('🎯 [HANDLE-BUZZ-PRESS] Loading clue from database (V2)...');
    
    let clueText = '';
    let clueId = '';
    
    try {
      // 1. Get active prize with start_date for week calculation
      const { data: activePrize, error: prizeError } = await supabase
        .from('prizes')
        .select('id, title, start_date')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (prizeError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error fetching active prize:', prizeError);
      }
      
      if (activePrize) {
        console.log('🎁 [HANDLE-BUZZ-PRESS] Active prize found:', activePrize.title);
        
        // 2. Calculate current week (1-4) based on mission start date
        const missionStart = activePrize.start_date 
          ? new Date(activePrize.start_date) 
          : new Date();
        
        const now = new Date();
        const daysSinceStart = Math.floor((now.getTime() - missionStart.getTime()) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.min(4, Math.max(1, Math.floor(daysSinceStart / 7) + 1));
        
        console.log('📅 [HANDLE-BUZZ-PRESS] Mission timing:', { missionStart, daysSinceStart, currentWeek });
        
        // 3. Get user's already unlocked clue IDs
        const { data: userUnlockedClues } = await supabase
          .from('user_clues')
          .select('clue_id')
          .eq('user_id', user.id);
        
        const unlockedClueIds = new Set((userUnlockedClues || []).map(uc => uc.clue_id));
        console.log('🔓 [HANDLE-BUZZ-PRESS] User has unlocked', unlockedClueIds.size, 'clues');
        
        // 4. Get clues up to current week
        const { data: prizeClues, error: cluesError } = await supabase
          .from('prize_clues')
          .select('id, description_it, week, clue_category, is_fake')
          .eq('prize_id', activePrize.id)
          .lte('week', currentWeek)
          .order('week', { ascending: true });
        
        if (cluesError) {
          console.error('❌ [HANDLE-BUZZ-PRESS] Error fetching prize clues:', cluesError);
        }
        
        if (prizeClues && prizeClues.length > 0) {
          // 5. Filter out already seen clues
          const availableClues = prizeClues.filter(c => !unlockedClueIds.has(c.id));
          
          console.log('📊 [HANDLE-BUZZ-PRESS] Clue stats:', {
            total: prizeClues.length,
            available: availableClues.length,
            currentWeek
          });
          
          if (availableClues.length > 0) {
            // 6. Balance location vs prize (50/50)
            const locationClues = availableClues.filter(c => c.clue_category === 'location');
            const prizeOnlyClues = availableClues.filter(c => c.clue_category === 'prize');
            
            const useLocation = unlockedClueIds.size % 2 === 0;
            let pool = useLocation && locationClues.length > 0 
              ? locationClues 
              : prizeOnlyClues.length > 0 ? prizeOnlyClues : availableClues;
            
            // 7. Random selection
            const selected = pool[Math.floor(Math.random() * pool.length)];
            clueText = selected.description_it || 'Indizio non disponibile';
            clueId = selected.id;
            
            console.log('🎯 [HANDLE-BUZZ-PRESS] Clue selected:', {
              clueId, week: selected.week, category: selected.clue_category, isFake: selected.is_fake
            });
          } else {
            clueText = `Hai sbloccato tutti gli indizi della settimana ${currentWeek}. Torna la prossima settimana!`;
            clueId = `week_complete_${currentWeek}_${Date.now()}`;
          }
        } else {
          clueText = 'Gli indizi non sono ancora stati generati. Contatta l\'amministratore.';
          clueId = `no_clues_${Date.now()}`;
        }
      } else {
        clueText = 'Nessuna missione attiva al momento. Resta sintonizzato!';
        clueId = `no_mission_${Date.now()}`;
      }
    } catch (error) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Error in clue generation:', error);
      clueText = 'Errore nel caricamento. Riprova...';
      clueId = `error_${Date.now()}`;
    }
    
    console.log('🎯 [HANDLE-BUZZ-PRESS] CLUE READY:', { clueId, textPreview: clueText.substring(0, 50) + '...' });

    // Increment buzz counter with direct UPSERT - FIX: use correct column names
    const today = new Date().toISOString().split('T')[0];
    
    // Get current counter
    const { data: currentCounter } = await supabase
      .from('user_buzz_counter')
      .select('buzz_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    
    const newCount = (currentCounter?.buzz_count || 0) + 1;
    
    // Upsert new count
    const { error: counterError } = await supabase
      .from('user_buzz_counter')
      .upsert({
        user_id: user.id,
        date: today,
        buzz_count: newCount
      }, {
        onConflict: 'user_id,date'
      });
    
    if (counterError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Error incrementing counter:', counterError);
      // NON bloccare il flusso - il clue è già stato generato
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] Counter incremented successfully to:', newCount);
    }

    // Log the BUZZ action
    const { error: logError } = await supabase
      .from('buzz_activations')
      .insert({
        user_id: user.id,
        location: {
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
        message: clueText
      });

    if (notificationError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Notification error:', notificationError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] Notification created successfully');
    }
    
    // 🔥 Save clue to user_clues table (only if it's a real clue, not fallback/error/special)
    const isRealClue = clueId && 
      !clueId.startsWith('fallback_') && 
      !clueId.startsWith('error_') &&
      !clueId.startsWith('week_complete_') &&
      !clueId.startsWith('no_clues_') &&
      !clueId.startsWith('no_mission_');
    
    console.log('🔍 [HANDLE-BUZZ-PRESS] Checking if clue should be saved:', { clueId, isRealClue });
    
    if (isRealClue) {
      const { error: saveClueError } = await supabase
        .from('user_clues')
        .upsert({
          user_id: user.id,
          clue_id: clueId,
          title_it: '🎯 Indizio BUZZ',
          description_it: clueText,
          clue_type: 'buzz',
          buzz_cost: 20,
          unlocked_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,clue_id'
        });
      
      if (saveClueError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error saving clue to user_clues:', saveClueError);
      } else {
        console.log('✅ [HANDLE-BUZZ-PRESS] Clue saved to user_clues:', clueId);
      }
    }

    const response = {
      success: true,
      mode: 'buzz',
      clue: {
        text: clueText
      }
    };

    // Add debug block if requested
    const debugBlock = wantsDebug ? {
      sawAuthorizationHeader: sawAuth,
      jwtLen,
      requestOrigin: origin,
      allowedOrigin: origin,
      userId: user.id.substring(0, 8) + '...',
      flow: 'BUZZ_CLUE',
      buzzCount: newCount,
      clueLength: clueText.length
    } : undefined;

    const responseBody = wantsDebug ? { ...response, __debug: debugBlock } : response;

    console.log('🎉 [HANDLE-BUZZ-PRESS] Function completed successfully:', response);

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [HANDLE-BUZZ-PRESS] Function error:', error);
    
    const debugBlock = wantsDebug ? {
      sawAuthorizationHeader: typeof authHeader !== 'undefined' && !!authHeader,
      jwtLen: typeof authHeader !== 'undefined' && authHeader ? authHeader.replace('Bearer ', '').length : 0,
      requestOrigin: origin,
      error: error.message
    } : undefined;

    const errorResponse = wantsDebug
      ? { success: false, error: 'Internal error', detail: String(error?.message || error), __debug: debugBlock }
      : { success: false, error: 'Internal error', detail: String(error?.message || error) };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}));

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™