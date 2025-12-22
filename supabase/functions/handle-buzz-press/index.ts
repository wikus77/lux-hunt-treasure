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

    // Initialize Supabase client with SERVICE ROLE (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // 🔥 FIX: Explicit options to ensure service_role bypasses RLS
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    
    console.log('🔐 [HANDLE-BUZZ-PRESS] Client initialized with service_role key');

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
    
    // 🔍 OBSERVABILITY: Extract audit metadata from request
    const buzzType = body.buzz_type || 'UNKNOWN';
    const m1uCost = body.m1u_cost ?? 0;
    
    // 🚨 =======================================================================
    // START M1SSION GATE V3: Simplified enrollment check
    // =======================================================================
    console.log('🔐 [GATE] Checking enrollment for user:', user.id.slice(-8));
    
    // 🔥 SIMPLIFIED: Just check if user has ANY enrollment record
    // Don't require specific mission_id match - user is enrolled if they have any active enrollment
    const { data: anyEnrollment, error: enrollCheckError } = await supabase
      .from('mission_enrollments')
      .select('id, mission_id, created_at, state')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (enrollCheckError) {
      console.error('❌ [GATE] Enrollment check error:', enrollCheckError);
      // Don't block on error - let user proceed
      console.log('⚠️ [GATE] Allowing user due to DB error');
    } else if (!anyEnrollment) {
      console.log('🚨 [GATE] No enrollment found for user');
      return new Response(JSON.stringify({
        success: false,
        error: 'not_enrolled',
        code: 'START_MISSION_REQUIRED',
        message: 'Devi avviare la missione prima di utilizzare BUZZ. Torna alla Home e premi START M1SSION.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // User has enrollment - check state if exists
      const enrollState = anyEnrollment.state;
      const isValidState = !enrollState || enrollState === 'enrolled' || enrollState === 'active';
      
      if (!isValidState) {
        console.log('🚨 [GATE] Enrollment found but invalid state:', enrollState);
        return new Response(JSON.stringify({
          success: false,
          error: 'enrollment_inactive',
          code: 'START_MISSION_REQUIRED',
          message: 'La tua iscrizione non è attiva. Torna alla Home e premi START M1SSION.'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.log('✅ [GATE] User enrolled:', {
        missionId: anyEnrollment.mission_id,
        enrolledAt: anyEnrollment.created_at,
        state: enrollState || 'legacy'
      });
    }
    
    // Get mission ID for later use (for clue generation)
    let missionId = anyEnrollment?.mission_id;
    if (!missionId) {
      // Fallback: get active mission
      const { data: activeMission } = await supabase
        .from('current_mission_data')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      missionId = activeMission?.id;
    }
    // 🚨 END GATE =================================================
    
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
      const baseRadiusKm = nextLevel.radius_km;
      const costM1U = nextLevel.m1u;
      const currentWeek = nextLevel.current_week;

      // 🚀 BOOTSTRAP BOOST: First 10 BUZZ MAP get 2× radius (4× area)
      // FIX: Get actual count from user_map_areas table (RPC doesn't return it)
      const BUZZ_MAP_BOOTSTRAP_COUNT = 10;
      const BUZZ_MAP_BOOTSTRAP_MULTIPLIER = 2;
      
      // Query actual BUZZ MAP count for this user
      const { count: buzzMapCount } = await supabase
        .from('user_map_areas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('source', 'buzz_map');
      
      const currentCount = buzzMapCount ?? 0;
      const isBootstrapEligible = currentCount < BUZZ_MAP_BOOTSTRAP_COUNT;
      const radius_km = isBootstrapEligible 
        ? baseRadiusKm * BUZZ_MAP_BOOTSTRAP_MULTIPLIER 
        : baseRadiusKm;
      
      // 🔴 ALWAYS LOG for verification (remove after testing)
      console.log('🚀 [BOOTSTRAP] BUZZ MAP #' + (currentCount + 1) + ':', {
        currentCount,
        isBootstrapEligible,
        baseRadiusKm,
        effectiveRadiusKm: radius_km,
        multiplier: isBootstrapEligible ? BUZZ_MAP_BOOTSTRAP_MULTIPLIER : 1
      });

      dlog('[DBG] SERVER-CALCULATED pricing (RPC):', {
        source: 'rpc_server',
        currentWeek: nextLevel.current_week,
        currentCount: currentCount,
        nextLevel: level,
        baseRadiusKm: baseRadiusKm,
        radiusKm: radius_km,
        costM1U: costM1U,
        bootstrapBoost: isBootstrapEligible
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

    // 🎯 M1SSION™ CLUE ENGINE V2.1: FIXED - Uses current_mission_data as source
    // FIX: Now reads from current_mission_data.id (same as where clues are written)
    console.log('🎯 [HANDLE-BUZZ-PRESS] Loading clue from database (V2.1 - FIXED)...');
    
    let clueText = '';
    let clueId = '';
    
    try {
      // 🔥 FIX V2.1: Get mission from current_mission_data (where clues are generated)
      // NOT from prizes table (which caused the mismatch!)
      const { data: currentMission, error: missionQueryError } = await supabase
        .from('current_mission_data')
        .select('id, mission_name, mission_started_at, city, country')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (missionQueryError) {
        console.error('❌ [HANDLE-BUZZ-PRESS] Error fetching current_mission_data:', missionQueryError);
      }
      
      // Fallback to prizes table only if current_mission_data is empty
      let activePrizeId: string | null = currentMission?.id || null;
      let missionStartDate: Date = currentMission?.mission_started_at 
        ? new Date(currentMission.mission_started_at) 
        : new Date();
      let missionTitle = currentMission?.mission_name || 'Mission';
      
      if (!activePrizeId) {
        console.log('⚠️ [HANDLE-BUZZ-PRESS] No current_mission_data, falling back to prizes table...');
        const { data: fallbackPrize } = await supabase
          .from('prizes')
          .select('id, title, start_date')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (fallbackPrize) {
          activePrizeId = fallbackPrize.id;
          missionStartDate = fallbackPrize.start_date ? new Date(fallbackPrize.start_date) : new Date();
          missionTitle = fallbackPrize.title;
        }
      }
      
      console.log('🎁 [HANDLE-BUZZ-PRESS] Active mission for clues:', { 
        id: activePrizeId, 
        title: missionTitle, 
        source: currentMission ? 'current_mission_data' : 'prizes_fallback' 
      });
      
      if (activePrizeId) {
        // 2. Calculate current week (1-4) based on mission start date
        const now = new Date();
        const daysSinceStart = Math.floor((now.getTime() - missionStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.min(4, Math.max(1, Math.floor(daysSinceStart / 7) + 1));
        
        console.log('📅 [HANDLE-BUZZ-PRESS] Mission timing:', { missionStartDate, daysSinceStart, currentWeek });
        
        // 3. Get user's already unlocked clue IDs
        const { data: userUnlockedClues, error: userCluesError } = await supabase
          .from('user_clues')
          .select('clue_id')
          .eq('user_id', user.id);
        
        // 🔥 DEBUG: Log raw query result
        console.log('🔍 [HANDLE-BUZZ-PRESS] user_clues query result:', {
          error: userCluesError?.message || 'none',
          code: userCluesError?.code || 'none',
          dataLength: userUnlockedClues?.length ?? 'null',
          rawData: JSON.stringify(userUnlockedClues?.slice(0, 5) || []),
          userId: user.id
        });
        
        // 🔥 FIX: Convert ALL IDs to strings to avoid type mismatch (UUID vs string)
        const unlockedClueIds = new Set((userUnlockedClues || []).map(uc => String(uc.clue_id)));
        console.log('🔓 [HANDLE-BUZZ-PRESS] UNLOCKED CLUES DEBUG:', {
          count: unlockedClueIds.size,
          rawData: JSON.stringify(userUnlockedClues?.slice(0, 3) || []),
          convertedIds: Array.from(unlockedClueIds).slice(0, 5),
          userId: user.id
        });
        
        // 🆕 FIX DETERMINISTIC: Usa order_index per erogare indizi in ordine
        // Alterna LOCATION/PRIZE basandosi sul count degli indizi già sbloccati
        const useLocation = unlockedClueIds.size % 2 === 0;
        const targetCategory = useLocation ? 'location' : 'prize';
        
        console.log('📊 [HANDLE-BUZZ-PRESS] Deterministic clue selection:', {
          unlockedCount: unlockedClueIds.size,
          targetCategory,
          currentWeek
        });
        
        // 4. Query: PRIMO indizio disponibile per categoria, ordinato per order_index
        let { data: nextClue, error: clueError } = await supabase
          .from('prize_clues')
          .select('id, description_it, week, clue_category, is_fake, order_index')
          .eq('prize_id', activePrizeId)
          .eq('clue_category', targetCategory)
          .lte('week', currentWeek)
          .order('week', { ascending: true })
          .order('order_index', { ascending: true })
          .limit(100); // Fetch batch to filter client-side
        
        if (clueError) {
          console.error('❌ [HANDLE-BUZZ-PRESS] Error fetching prize clues:', clueError);
        }
        
        // 5. Filtra quelli già sbloccati e prendi il PRIMO
        // 🔥 DEBUG: Log what we're comparing
        if (nextClue && nextClue.length > 0) {
          console.log('🔍 [HANDLE-BUZZ-PRESS] Comparing clues:', {
            firstClueId: nextClue[0].id,
            firstClueIdType: typeof nextClue[0].id,
            unlockedIdsArray: Array.from(unlockedClueIds).slice(0, 3),
            unlockedIdsType: unlockedClueIds.size > 0 ? typeof Array.from(unlockedClueIds)[0] : 'empty',
            isFirstClueInUnlocked: unlockedClueIds.has(nextClue[0].id),
            // Convert to string and check again
            stringMatch: unlockedClueIds.has(String(nextClue[0].id))
          });
        }
        
        // 🔥 FIX: Convert clue ID to string for comparison (type mismatch fix)
        let availableClues = (nextClue || []).filter(c => !unlockedClueIds.has(String(c.id)));
        
        // Se non ci sono indizi della categoria target, prova l'altra categoria
        if (availableClues.length === 0) {
          const fallbackCategory = targetCategory === 'location' ? 'prize' : 'location';
          console.log('⚠️ [HANDLE-BUZZ-PRESS] No clues for', targetCategory, '- trying', fallbackCategory);
          
          const { data: fallbackClues } = await supabase
            .from('prize_clues')
            .select('id, description_it, week, clue_category, is_fake, order_index')
            .eq('prize_id', activePrizeId)
            .eq('clue_category', fallbackCategory)
            .lte('week', currentWeek)
            .order('week', { ascending: true })
            .order('order_index', { ascending: true })
            .limit(100);
          
          // 🔥 FIX: Convert clue ID to string for comparison (type mismatch fix)
          availableClues = (fallbackClues || []).filter(c => !unlockedClueIds.has(String(c.id)));
        }
        
        console.log('📊 [HANDLE-BUZZ-PRESS] Query result for prize_id=' + activePrizeId + ':', {
          cluesFound: nextClue?.length || 0,
          available: availableClues.length,
          error: clueError?.message || 'none'
        });
        
        if (availableClues.length > 0) {
          // 🆕 DETERMINISTIC: Prendi il PRIMO (già ordinato per order_index)
          const selected = availableClues[0];
          clueText = selected.description_it || 'Indizio non disponibile';
          clueId = selected.id;
          
          console.log('🎯 [HANDLE-BUZZ-PRESS] Clue selected (DETERMINISTIC):', {
            clueId, 
            week: selected.week, 
            category: selected.clue_category, 
            order_index: selected.order_index,
            isFake: selected.is_fake,
            missionId: activePrizeId
          });
        } else {
          clueText = `Hai sbloccato tutti gli indizi della settimana ${currentWeek}. Torna la prossima settimana!`;
          clueId = `week_complete_${currentWeek}_${Date.now()}`;
        }
        
        // Mantieni questo blocco per il messaggio quando non ci sono indizi
        if (!clueText || clueText === 'Indizio non disponibile') {
          // 🔥 FIX V2.1: Provide detailed error message
          clueText = `Gli indizi per la missione "${missionTitle}" non sono ancora stati generati. L'admin deve cliccare "GENERA INDIZI" nel pannello.`;
          clueId = `no_clues_${activePrizeId}_${Date.now()}`;
          console.warn('⚠️ [HANDLE-BUZZ-PRESS] No clues found for prize_id:', activePrizeId);
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

    // Log the BUZZ action (buzz_activations)
    // 🔍 OBSERVABILITY: Include audit metadata in location JSONB
    const { error: logError } = await supabase
      .from('buzz_activations')
      .insert({
        user_id: user.id,
        location: {
          clue_text: clueText,
          source: 'handle_buzz_press',
          timestamp: new Date().toISOString(),
          // 🔍 OBSERVABILITY: Audit fields for FREE/PAID tracking
          buzz_type: buzzType,
          m1u_cost: m1uCost
        }
      });

    if (logError) {
      console.error('❌ [HANDLE-BUZZ-PRESS] Log error:', logError);
    } else {
      console.log('✅ [HANDLE-BUZZ-PRESS] BUZZ logged successfully', { buzzType, m1uCost });
    }

    // 🔥 FIX: Log to buzz_logs to trigger PE increment (+15 PE)
    // This is required because the handle_buzz_pe trigger listens to buzz_logs table
    // 🔍 OBSERVABILITY: Include buzz_type and m1u_cost for audit trail
    try {
      const { error: buzzLogError } = await supabase
        .from('buzz_logs')
        .insert({
          user_id: user.id,
          step: 'BUZZ_COMPLETED', // 🔧 FIX: Required column for buzz_logs table
          action: 'clue_generated', // 🔧 FIX: Action type
          details: {
            clue_text: clueText?.substring(0, 200),
            clue_id: clueId,
            source: 'handle_buzz_press',
            buzz_count: newCount,
            timestamp: new Date().toISOString(),
            // 🔍 OBSERVABILITY: Audit fields for FREE/PAID tracking
            buzz_type: buzzType,
            m1u_cost: m1uCost,
            is_free: buzzType === 'TIER_FREE' || buzzType === 'GRANT_FREE'
          }
        });

      if (buzzLogError) {
        console.warn('⚠️ [HANDLE-BUZZ-PRESS] buzz_logs insert error (PE may not increment):', buzzLogError.message);
      } else {
        console.log('✅ [HANDLE-BUZZ-PRESS] buzz_logs entry created - PE trigger should fire (+15 PE)', { buzzType, m1uCost });
      }
    } catch (buzzLogErr) {
      console.warn('⚠️ [HANDLE-BUZZ-PRESS] buzz_logs exception (non-blocking):', buzzLogErr);
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
    
    // 🔥 CRITICAL FIX: Save clue to user_clues table BEFORE returning
    // This MUST succeed to prevent "stuck on same clue" bug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = clueId && uuidRegex.test(clueId);
    const isRealClue = isValidUUID && 
      !clueId.startsWith('fallback_') && 
      !clueId.startsWith('error_') &&
      !clueId.startsWith('week_complete_') &&
      !clueId.startsWith('no_clues_') &&
      !clueId.startsWith('no_mission_');
    
    console.log('🔍 [HANDLE-BUZZ-PRESS] Clue save check:', { clueId, isValidUUID, isRealClue });
    
    let clueSaved = false;
    
    if (isRealClue) {
      // 🔥 FIX V3: Use direct INSERT instead of UPSERT to avoid RLS issues
      // First check if already exists
      const { data: existingClue, error: checkError } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', user.id)
        .eq('clue_id', clueId)
        .maybeSingle();
      
      console.log('🔍 [HANDLE-BUZZ-PRESS] Check existing clue:', {
        exists: !!existingClue,
        checkError: checkError?.message || 'none',
        clueId: clueId?.substring(0, 36),
        userId: user.id?.substring(0, 8)
      });
      
      if (existingClue) {
        // Already saved - this is OK, just log and continue
        console.log('✅ [HANDLE-BUZZ-PRESS] Clue already in user_clues (skipping insert):', existingClue.clue_id);
        clueSaved = true;
      } else {
        // INSERT new clue
        // 🔥 FIX V4: Include ALL required NOT NULL columns
        const cluePayload = {
          user_id: user.id,
          clue_id: clueId,
          title_it: clueText?.substring(0, 100) || '🎯 Indizio BUZZ',
          description_it: clueText || 'Indizio sbloccato', // 🔥 REQUIRED: NOT NULL column
          clue_type: 'buzz', // 🔥 REQUIRED: NOT NULL column
          buzz_cost: 20,
          unlocked_at: new Date().toISOString()
        };
        
        console.log('💾 [HANDLE-BUZZ-PRESS] Inserting new clue:', JSON.stringify(cluePayload));
        
        const { data: insertData, error: insertError } = await supabase
          .from('user_clues')
          .insert(cluePayload)
          .select();
        
        console.log('💾 [HANDLE-BUZZ-PRESS] INSERT result:', {
          error: insertError?.message || 'none',
          code: insertError?.code || 'none',
          hint: insertError?.hint || 'none',
          dataReturned: insertData ? JSON.stringify(insertData) : 'null'
        });
        
        if (insertError) {
          console.error('❌ [HANDLE-BUZZ-PRESS] CRITICAL: Failed to insert clue:', {
            error: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
            clueId,
            userId: user.id
          });
          clueSaved = false;
        } else {
          console.log('✅ [HANDLE-BUZZ-PRESS] Clue inserted successfully:', clueId, 'returned:', insertData?.length || 0, 'rows');
          clueSaved = true;
        }
      }
      
      // 🔥 FINAL VERIFICATION: Count total clues for this user
      const { count: totalClues, error: countError } = await supabase
        .from('user_clues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      console.log('📊 [HANDLE-BUZZ-PRESS] User total clues after operation:', {
        totalClues,
        countError: countError?.message || 'none'
      });
    } else {
      console.log('⏭️ [HANDLE-BUZZ-PRESS] Skipping save - not a real clue UUID:', clueId?.substring(0, 30));
      clueSaved = true; // Not a real clue, so "saved" is N/A
    }
    
    // 🔥 DEBUG: Log final state for troubleshooting
    console.log('📊 [HANDLE-BUZZ-PRESS] Clue delivery summary:', {
      clueId: clueId?.substring(0, 36),
      isRealClue,
      clueSaved
    });

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