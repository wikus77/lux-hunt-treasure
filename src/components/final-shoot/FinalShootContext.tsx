// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT CONTEXT - Shared state between Pill and Overlay

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

const FinalShootContext = createContext<FinalShootContextValue | null>(null);

// Check if test mode is enabled via URL parameter
const isTestMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('test-final-shoot') === 'true';
};

// Test coordinates (Piazza Duomo, Milano)
const TEST_COORDINATES = { lat: 45.4642, lng: 9.1900 };

export function FinalShootProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinalShootState>({
    isAvailable: false,
    isActive: false,
    remainingAttempts: 3,
    daysRemaining: 0,
    hasWon: false,
    isLoading: true,
    lastAttempt: null,
  });

  const [missionData, setMissionData] = useState<MissionData>({
    missionId: null,
    prizeLocation: null,
    endsAt: null,
  });

  const [isLocked, setIsLocked] = useState(true);
  const [totalMissionDays, setTotalMissionDays] = useState(30);

  // Generate hint based on distance
  const getHintFromDistance = (distanceMeters: number): string => {
    if (distanceMeters <= 19) return '🎯 PERFETTO! HAI VINTO!';
    if (distanceMeters <= 50) return '🔥 Caldissimo! Sei vicinissimo!';
    if (distanceMeters <= 100) return '🌡️ Molto caldo! Quasi ci sei!';
    if (distanceMeters <= 250) return '☀️ Caldo! Stai andando bene!';
    if (distanceMeters <= 500) return '😊 Tiepido. Direzione giusta!';
    if (distanceMeters <= 1000) return '😐 Freddo. Riprova!';
    if (distanceMeters <= 2000) return '❄️ Molto freddo. Sei lontano.';
    return '🥶 Freddissimo! Sei molto lontano.';
  };

  // Check if Final Shoot is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const testMode = isTestMode();
        
        if (testMode) {
          console.log('🎯 [FINAL-SHOOT-CTX] TEST MODE ENABLED');
          setMissionData({
            missionId: 'test-mission-id',
            prizeLocation: TEST_COORDINATES,
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          });
          setIsLocked(false);
          setState({
            isAvailable: true,
            isActive: false,
            remainingAttempts: 3,
            daysRemaining: 3,
            hasWon: false,
            isLoading: false,
            lastAttempt: null,
          });
          setTotalMissionDays(30);
          return;
        }

        // Get current mission data
        const { data: mission, error: missionError } = await supabase
          .from('current_mission_data')
          .select('id, prize_lat, prize_lng, mission_ends_at, mission_started_at, mission_status, linked_mission_id')
          .eq('mission_status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (missionError || !mission) {
          console.log('🎯 [FINAL-SHOOT-CTX] No active mission found');
          setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
          setIsLocked(true);
          return;
        }

        // Calculate total mission days
        const startedAt = mission.mission_started_at ? new Date(mission.mission_started_at) : null;
        const endsAt = mission.mission_ends_at ? new Date(mission.mission_ends_at) : null;
        const missionDuration = (startedAt && endsAt) 
          ? Math.ceil((endsAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 30;
        setTotalMissionDays(missionDuration);

        // Calculate days remaining
        const now = new Date();
        const daysRemaining = endsAt 
          ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
          return;
        }

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
  }, []);

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
  const executeShoot = useCallback(async (lat: number, lng: number): Promise<boolean> => {
    console.log('🎯 [FINAL-SHOOT-CTX] Executing shoot at:', lat, lng);
    
    if (!missionData.missionId || !missionData.prizeLocation) {
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

    try {
      // Calculate distance using Haversine formula
      const R = 6371000;
      const dLat = (missionData.prizeLocation.lat - lat) * Math.PI / 180;
      const dLng = (missionData.prizeLocation.lng - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(missionData.prizeLocation.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      const isWinner = distance <= 19;
      const hint = getHintFromDistance(distance);

      console.log('🎯 [FINAL-SHOOT-CTX] Distance:', distance, 'isWinner:', isWinner);

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Devi essere loggato');
        return false;
      }

      // Save attempt (skip in test mode for now)
      if (!isTestMode()) {
        const { error: insertError } = await supabase
          .from('final_shoot_attempts')
          .insert({
            user_id: user.id,
            mission_id: missionData.missionId,
            attempt_lat: lat,
            attempt_lng: lng,
            distance_meters: distance,
            is_winner: isWinner,
            attempt_number: 4 - state.remainingAttempts,
          });

        if (insertError) {
          console.error('🎯 [FINAL-SHOOT-CTX] Error saving attempt:', insertError);
          toast.error('Errore nel salvataggio del tentativo');
          return false;
        }
      }

      // Update state
      setState(prev => ({
        ...prev,
        remainingAttempts: prev.remainingAttempts - 1,
        hasWon: isWinner,
        isActive: isWinner ? false : prev.isActive,
        lastAttempt: { distance, hint },
      }));

      if (isWinner) {
        toast.success('🎉 HAI VINTO IL FINAL SHOOT!', {
          description: 'Complimenti! Hai trovato la posizione esatta del premio!',
          duration: 10000,
        });
        
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }
      } else {
        toast.info(hint, {
          description: `Tentativi rimasti: ${state.remainingAttempts - 1}`,
          duration: 5000,
        });
      }

      return isWinner;

    } catch (error) {
      console.error('🎯 [FINAL-SHOOT-CTX] Error executing shoot:', error);
      toast.error('Errore durante il tentativo');
      return false;
    }
  }, [missionData, state.remainingAttempts, state.hasWon]);

  const value: FinalShootContextValue = {
    ...state,
    missionData,
    isLocked,
    totalMissionDays,
    isTestMode: isTestMode(),
    activateFinalShoot,
    deactivateFinalShoot,
    executeShoot,
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


