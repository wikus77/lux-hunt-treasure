// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT CONTEXT - Shared state between Pill and Overlay

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

// 🎯 FINAL SHOOT PLUS/ELITE PRICING (26/01/2026)
interface PricingInfo {
  attempts_used: number;
  next_attempt_number: number;
  tier: 'free' | 'plus' | 'elite' | 'blocked';
  cost_m1u: number;
  allowed: boolean;
  reason: string | null;
  free_remaining: number;
  plus_remaining: number;
  elite_remaining: number;
  total_remaining: number;
}

interface FinalShootState {
  isAvailable: boolean;
  isActive: boolean;
  remainingAttempts: number;
  daysRemaining: number;
  hasWon: boolean;
  isLoading: boolean;
  lastAttempt: {
    distance: number;
    hint: string;
  } | null;
  // 🎯 PLUS/ELITE pricing
  pricing: PricingInfo | null;
}

interface MissionData {
  missionId: string | null;
  prizeLocation: { lat: number; lng: number } | null;
  endsAt: Date | null;
}

interface FinalShootContextValue extends FinalShootState {
  missionData: MissionData;
  isLocked: boolean;
  totalMissionDays: number;
  isTestMode: boolean;
  activateFinalShoot: () => void;
  deactivateFinalShoot: () => void;
  executeShoot: (lat: number, lng: number) => Promise<boolean>;
  refreshPricing: () => Promise<void>;
}

const FinalShootContext = createContext<FinalShootContextValue | null>(null);

// Check if test mode is enabled via URL parameter
const isTestMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('test-final-shoot') === 'true';
};

// Test coordinates (Piazza Duomo, Milano) - used as fallback only
const TEST_COORDINATES = { lat: 45.4642, lng: 9.1900 };

// WINNING DISTANCE: 50 meters (reasonable for mobile GPS accuracy)
const WINNING_DISTANCE_METERS = 50;

// 🔧 FIX 26/01/2026: Soglie hint ragionevoli per esperienza utente migliore
// Generate hint based on distance (soglie allineate con RPC)
const getHintFromDistance = (distanceMeters: number): string => {
  if (distanceMeters <= WINNING_DISTANCE_METERS) return '🎯 PERFETTO! HAI VINTO!';
  if (distanceMeters <= 150) return '🔥 Ci sei quasi! Pochissimi passi!';
  if (distanceMeters <= 500) return '🌡️ Molto vicino! Sei in zona calda!';
  if (distanceMeters <= 1000) return '☀️ Vicino! Continua così!';
  if (distanceMeters <= 3000) return '😊 Sei in zona. Esplora meglio!';
  if (distanceMeters <= 5000) return '😐 Zona giusta ma non vicinissimo.';
  if (distanceMeters <= 10000) return '❄️ Lontano. Cambia direzione!';
  if (distanceMeters <= 25000) return '🥶 Molto lontano. Riconsidera la zona!';
  return '🌍 Lontanissimo! Sei fuori area.';
};

// Format distance for display (m/km)
const formatDistance = (distanceMeters: number): string => {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)} m`;
};

export function FinalShootProvider({ children }: { children: ReactNode }) {
  // 🔥 FIX: Use AuthContext instead of direct supabase.auth.getUser() call
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const hasInitializedRef = useRef(false);
  
  const [state, setState] = useState<FinalShootState>({
    isAvailable: false,
    isActive: false,
    remainingAttempts: 23, // 🎯 Updated: 3 free + 10 plus + 10 elite = 23 max
    daysRemaining: 0,
    hasWon: false,
    isLoading: true,
    lastAttempt: null,
    pricing: null, // 🎯 PLUS/ELITE pricing
  });

  const [missionData, setMissionData] = useState<MissionData>({
    missionId: null,
    prizeLocation: null,
    endsAt: null,
  });

  const [isLocked, setIsLocked] = useState(true);
  const [totalMissionDays, setTotalMissionDays] = useState(30);

  // Check if Final Shoot is available
  // 🔥 FIX: Depend on authUser and authLoading to re-run when auth becomes ready
  useEffect(() => {
    // Skip if auth is still loading
    if (authLoading) {
      console.log('🎯 [FINAL-SHOOT-CTX] Waiting for auth...');
      return;
    }
    
    const checkAvailability = async () => {
      try {
        const testMode = isTestMode();
        
        // Get current mission data (ALWAYS load real data, even in test mode)
        // 🔥 FIX: Use is_active=true instead of mission_status='active'
        const { data: mission, error: missionError } = await supabase
          .from('current_mission_data')
          .select('id, prize_lat, prize_lng, mission_ends_at, mission_started_at, mission_status, linked_mission_id')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (testMode) {
          console.log('🎯 [FINAL-SHOOT-CTX] TEST MODE ENABLED - Using REAL mission coordinates');
          
          // Use REAL mission coordinates if available, fallback to test coordinates
          const prizeLocation = (mission?.prize_lat && mission?.prize_lng)
            ? { lat: mission.prize_lat, lng: mission.prize_lng }
            : TEST_COORDINATES;
          
          console.log('🎯 [FINAL-SHOOT-CTX] Prize location:', prizeLocation);
          
          setMissionData({
            missionId: mission?.linked_mission_id || mission?.id || 'test-mission-id',
            prizeLocation,
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          });
          setIsLocked(false);
          setState({
            isAvailable: true,
            isActive: false,
            remainingAttempts: 99, // Unlimited attempts in test mode
            daysRemaining: 3,
            hasWon: false,
            isLoading: false,
            lastAttempt: null,
            pricing: null, // 🎯 Test mode doesn't use pricing
          });
          setTotalMissionDays(30);
          return;
        }

        // Normal mode - use already loaded mission data
        if (missionError || !mission) {
          console.log('🎯 [FINAL-SHOOT-CTX] No active mission found');
          setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
          setIsLocked(true);
          return;
        }

        // Calculate total mission days
        const startedAt = mission.mission_started_at ? new Date(mission.mission_started_at) : null;
        let endsAt = mission.mission_ends_at ? new Date(mission.mission_ends_at) : null;
        
        // 🔥 FIX: If endsAt is not set, assume 30 days from start
        if (!endsAt && startedAt) {
          endsAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
          console.log('🎯 [FINAL-SHOOT-CTX] No end date set, assuming 30 days from start:', endsAt);
        }
        
        const missionDuration = (startedAt && endsAt) 
          ? Math.ceil((endsAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 30;
        setTotalMissionDays(Math.max(1, missionDuration)); // Ensure at least 1 day

        // Calculate days remaining
        const now = new Date();
        const daysRemaining = endsAt 
          ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 30; // 🔥 FIX: Default to 30 if no end date

        const isAvailable = daysRemaining > 0 && daysRemaining <= 7;
        setIsLocked(!isAvailable);

        setMissionData({
          missionId: mission.linked_mission_id || mission.id,
          prizeLocation: (mission.prize_lat && mission.prize_lng) 
            ? { lat: mission.prize_lat, lng: mission.prize_lng }
            : null,
          endsAt,
        });

        // Get user's remaining attempts
        // 🔥 FIX: Use authUser from context instead of direct Supabase call
        if (!authUser) {
          console.log('🎯 [FINAL-SHOOT-CTX] No user from auth context');
          setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
          return;
        }
        const user = authUser;

        const { data: attempts, error: attemptsError } = await supabase
          .from('final_shoot_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('mission_id', mission.linked_mission_id || mission.id)
          .order('created_at', { ascending: false });

        if (attemptsError) {
          console.error('🎯 [FINAL-SHOOT-CTX] Error fetching attempts:', attemptsError);
        }

        const attemptsCount = attempts?.length || 0;
        const hasWon = attempts?.some(a => a.is_winner) || false;
        const remainingAttempts = Math.max(0, 3 - attemptsCount);
        const lastAttempt = attempts?.[0] 
          ? { distance: attempts[0].distance_meters, hint: getHintFromDistance(attempts[0].distance_meters) }
          : null;

        setState({
          isAvailable,
          isActive: false,
          remainingAttempts,
          daysRemaining,
          hasWon,
          isLoading: false,
          lastAttempt,
          pricing: null, // 🎯 Will be fetched by refreshPricing effect
        });

        console.log('🎯 [FINAL-SHOOT-CTX] Status:', {
          isAvailable,
          daysRemaining,
          remainingAttempts,
          hasWon,
        });

      } catch (error) {
        console.error('🎯 [FINAL-SHOOT-CTX] Error checking availability:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAvailability();
    hasInitializedRef.current = true;
  }, [authUser?.id, authLoading]); // 🔥 FIX: Re-run when user becomes available

  // 🎯 PLUS/ELITE: Fetch pricing info from server
  const refreshPricing = useCallback(async () => {
    if (!authUser?.id || !missionData.missionId) {
      console.log('🎯 [FINAL-SHOOT-CTX] Cannot fetch pricing: no user or mission');
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('get_final_shoot_pricing', {
        p_user_id: authUser.id,
        p_mission_id: missionData.missionId,
      });
      
      if (error) {
        console.error('🎯 [FINAL-SHOOT-CTX] Pricing error:', error);
        return;
      }
      
      const pricing = data as PricingInfo;
      console.log('🎯 [FINAL-SHOOT-CTX] Pricing:', pricing);
      
      setState(prev => ({
        ...prev,
        pricing,
        remainingAttempts: pricing.total_remaining,
      }));
    } catch (err) {
      console.error('🎯 [FINAL-SHOOT-CTX] Pricing fetch failed:', err);
    }
  }, [authUser?.id, missionData.missionId]);

  // Fetch pricing when mission data changes
  useEffect(() => {
    if (missionData.missionId && authUser?.id) {
      refreshPricing();
    }
  }, [missionData.missionId, authUser?.id, refreshPricing]);

  // Activate Final Shoot mode
  const activateFinalShoot = useCallback(() => {
    if (!state.isAvailable || state.remainingAttempts <= 0 || state.hasWon) {
      console.log('🎯 [FINAL-SHOOT-CTX] Cannot activate:', { 
        isAvailable: state.isAvailable, 
        remainingAttempts: state.remainingAttempts, 
        hasWon: state.hasWon 
      });
      return;
    }
    console.log('🎯 [FINAL-SHOOT-CTX] ACTIVATING Final Shoot!');
    setState(prev => ({ ...prev, isActive: true }));
    toast.info('🎯 FINAL SHOOT ATTIVATO!', {
      description: `Clicca sulla mappa dove pensi sia il premio. Hai ${state.remainingAttempts} tentativi.`,
      duration: 5000,
    });
  }, [state.isAvailable, state.remainingAttempts, state.hasWon]);

  // Deactivate Final Shoot mode
  const deactivateFinalShoot = useCallback(() => {
    console.log('🎯 [FINAL-SHOOT-CTX] DEACTIVATING Final Shoot');
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  // Execute a Final Shoot attempt
  // 🔧 FIX 26/01/2026: Use RPC execute_final_shoot instead of direct INSERT (blocked by RLS)
  const executeShoot = useCallback(async (lat: number, lng: number): Promise<boolean> => {
    console.log('🎯 [FINAL-SHOOT-CTX] Executing shoot at:', lat, lng);
    
    if (!missionData.missionId) {
      toast.error('Errore: Missione non trovata');
      return false;
    }

    if (state.remainingAttempts <= 0) {
      toast.error('Hai esaurito tutti i tentativi!');
      return false;
    }

    if (state.hasWon) {
      toast.success('Hai già vinto il Final Shoot!');
      return false;
    }

    if (!authUser) {
      toast.error('Devi essere loggato');
      return false;
    }

    try {
      // 🔧 FIX 26/01/2026: TEST MODE - calculate locally, skip DB save
      if (isTestMode() && missionData.prizeLocation) {
        const R = 6371000;
        const dLat = (missionData.prizeLocation.lat - lat) * Math.PI / 180;
        const dLng = (missionData.prizeLocation.lng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(missionData.prizeLocation.lat * Math.PI / 180) * 
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        const isWinner = distance <= WINNING_DISTANCE_METERS;
        const hint = getHintFromDistance(distance);

        console.log('🎯 [FINAL-SHOOT-CTX] TEST MODE - Distance:', distance, 'isWinner:', isWinner);

        setState(prev => ({
          ...prev,
          remainingAttempts: prev.remainingAttempts - 1,
          hasWon: isWinner,
          isActive: isWinner ? false : prev.isActive,
          lastAttempt: { distance, hint },
        }));

        if (isWinner) {
          toast.success('🎉 HAI VINTO IL FINAL SHOOT! (TEST)', { duration: 10000 });
        } else {
          toast.info(hint, { description: `Tentativi rimasti: ${state.remainingAttempts - 1}`, duration: 5000 });
        }
        return isWinner;
      }

      // 🔧 FIX 26/01/2026: PRODUCTION MODE - Use RPC (RLS blocks direct INSERT)
      const { data: rpcResult, error: rpcError } = await supabase.rpc('execute_final_shoot', {
        p_user_id: authUser.id,
        p_mission_id: missionData.missionId,
        p_lat: lat,
        p_lng: lng,
      });

      if (rpcError) {
        console.error('🎯 [FINAL-SHOOT-CTX] RPC error:', rpcError);
        toast.error(`Errore: ${rpcError.message || 'Salvataggio fallito'}`, {
          description: rpcError.code ? `Code: ${rpcError.code}` : undefined,
        });
        return false;
      }

      // Parse RPC response - 🎯 PLUS/ELITE: includes pricing info
      const result = rpcResult as { 
        success: boolean; 
        status: string; 
        winner?: boolean;
        distance_meters?: number;
        attempts_remaining?: number;
        hint?: string;
        message?: string;
        error?: string;
        // 🎯 PLUS/ELITE fields
        cost_charged?: number;
        tier?: string;
        pricing?: PricingInfo;
        required_m1u?: number;
        current_balance?: number;
        refunded?: boolean;
        refund_amount?: number;
      };

      console.log('🎯 [FINAL-SHOOT-CTX] RPC result:', result);

      if (!result.success) {
        // 🎯 PLUS/ELITE: Handle specific error statuses
        if (result.status === 'insufficient_funds') {
          toast.error('💰 Saldo M1U insufficiente', {
            description: `Richiesti: ${result.required_m1u} M1U | Disponibili: ${result.current_balance} M1U`,
            duration: 5000,
          });
        } else if (result.status === 'cap_reached') {
          toast.error('🚫 Limite raggiunto', {
            description: 'Hai utilizzato tutti i 23 tentativi per questa missione.',
            duration: 5000,
          });
        } else {
          const errorMessage = result.error || result.message || 'Tentativo fallito';
          toast.error(errorMessage);
        }
        // Refresh pricing after error
        refreshPricing();
        return false;
      }

      const isWinner = result.winner === true;
      const distance = result.distance_meters || 0;
      const hint = result.hint || getHintFromDistance(distance);
      const attemptsRemaining = result.attempts_remaining ?? (state.remainingAttempts - 1);
      const costCharged = result.cost_charged || 0;
      const tier = result.tier || 'free';

      // 🎯 PLUS/ELITE: Show cost charged if applicable
      if (costCharged > 0) {
        console.log(`🎯 [FINAL-SHOOT-CTX] Charged ${costCharged} M1U (${tier})`);
      }

      // Update local state with new pricing if available
      setState(prev => ({
        ...prev,
        remainingAttempts: Math.max(0, attemptsRemaining),
        hasWon: isWinner,
        isActive: isWinner ? false : prev.isActive,
        lastAttempt: { distance, hint },
        pricing: result.pricing || prev.pricing,
      }));
      
      // Refresh pricing after successful attempt
      refreshPricing();

      if (isWinner) {
        toast.success('🎉 HAI VINTO IL FINAL SHOOT!', {
          description: result.message || 'Complimenti! Hai trovato la posizione esatta del premio!',
          duration: 10000,
        });
        
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }
      } else {
        toast.info(hint, {
          description: `Tentativi rimasti: ${attemptsRemaining}`,
          duration: 5000,
        });
      }

      return isWinner;

    } catch (error) {
      console.error('🎯 [FINAL-SHOOT-CTX] Error executing shoot:', error);
      const errMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast.error(`Errore: ${errMsg}`);
      return false;
    }
  }, [missionData.missionId, missionData.prizeLocation, state.remainingAttempts, state.hasWon, authUser]);

  const value: FinalShootContextValue = {
    ...state,
    missionData,
    isLocked,
    totalMissionDays,
    isTestMode: isTestMode(),
    activateFinalShoot,
    deactivateFinalShoot,
    executeShoot,
    refreshPricing, // 🎯 PLUS/ELITE pricing
  };

  return (
    <FinalShootContext.Provider value={value}>
      {children}
    </FinalShootContext.Provider>
  );
}

export function useFinalShootContext() {
  const context = useContext(FinalShootContext);
  if (!context) {
    throw new Error('useFinalShootContext must be used within a FinalShootProvider');
  }
  return context;
}

export default FinalShootContext;





