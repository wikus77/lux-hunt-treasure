// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT - Hook for the endgame precision shot feature
// NOTA: Questo hook è COMPLETAMENTE INDIPENDENTE dalle logiche BUZZ/Map esistenti

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FinalShootState {
  isAvailable: boolean;       // True se siamo negli ultimi 7 giorni
  isActive: boolean;          // True se l'utente ha attivato la modalità
  remainingAttempts: number;  // 0-3
  daysRemaining: number;      // Giorni rimasti della missione
  hasWon: boolean;            // True se l'utente ha già vinto
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

// Check if test mode is enabled via URL parameter
const isTestMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('test-final-shoot') === 'true';
};

// Test coordinates (Piazza Duomo, Milano) - used in test mode
const TEST_COORDINATES = { lat: 45.4642, lng: 9.1900 };

export function useFinalShoot() {
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

  // Additional state for "locked" mode explanation
  const [isLocked, setIsLocked] = useState(true);
  const [totalMissionDays, setTotalMissionDays] = useState(30);

  // Check if Final Shoot is available (last 7 days of mission)
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const testMode = isTestMode();
        
        // In test mode, use fake data
        if (testMode) {
          console.log('🎯 [FINAL-SHOOT] TEST MODE ENABLED');
          setMissionData({
            missionId: 'test-mission-id',
            prizeLocation: TEST_COORDINATES,
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
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
          console.log('🎯 [FINAL-SHOOT] No active mission found');
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

        // Final Shoot is available only in the last 7 days
        const isAvailable = daysRemaining > 0 && daysRemaining <= 7;
        const locked = !isAvailable;
        setIsLocked(locked);

        // Set mission data even if locked (for display purposes)
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
          console.error('🎯 [FINAL-SHOOT] Error fetching attempts:', attemptsError);
        }

        const attemptsCount = attempts?.length || 0;
        const hasWon = attempts?.some(a => a.is_winner) || false;
        const remainingAttempts = Math.max(0, 3 - attemptsCount);

        // Get last attempt hint
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

        console.log('🎯 [FINAL-SHOOT] Status:', {
          isAvailable,
          isLocked: locked,
          daysRemaining,
          remainingAttempts,
          hasWon,
        });

      } catch (error) {
        console.error('🎯 [FINAL-SHOOT] Error checking availability:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAvailability();
  }, []);

  // Generate hint based on distance (senza rivelare la tolleranza esatta)
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

  // Activate Final Shoot mode
  const activateFinalShoot = useCallback(() => {
    if (!state.isAvailable || state.remainingAttempts <= 0 || state.hasWon) {
      return;
    }
    setState(prev => ({ ...prev, isActive: true }));
    toast.info('🎯 FINAL SHOOT ATTIVATO!', {
      description: `Clicca sulla mappa dove pensi sia il premio. Hai ${state.remainingAttempts} tentativi.`,
      duration: 5000,
    });
  }, [state.isAvailable, state.remainingAttempts, state.hasWon]);

  // Deactivate Final Shoot mode
  const deactivateFinalShoot = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
  }, []);

  // Execute a Final Shoot attempt
  const executeShoot = useCallback(async (lat: number, lng: number): Promise<boolean> => {
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
      const R = 6371000; // Earth radius in meters
      const dLat = (missionData.prizeLocation.lat - lat) * Math.PI / 180;
      const dLng = (missionData.prizeLocation.lng - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(missionData.prizeLocation.lat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      const isWinner = distance <= 19; // 19 meters tolerance
      const hint = getHintFromDistance(distance);

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Devi essere loggato');
        return false;
      }

      // Save attempt to database
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
        console.error('🎯 [FINAL-SHOOT] Error saving attempt:', insertError);
        toast.error('Errore nel salvataggio del tentativo');
        return false;
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
        // Winner animation and notification
        toast.success('🎉 HAI VINTO IL FINAL SHOOT!', {
          description: 'Complimenti! Hai trovato la posizione esatta del premio!',
          duration: 10000,
        });
        
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }

        // Deactivate mode
        deactivateFinalShoot();
      } else {
        toast.info(hint, {
          description: `Tentativi rimasti: ${state.remainingAttempts - 1}`,
          duration: 5000,
        });
      }

      return isWinner;

    } catch (error) {
      console.error('🎯 [FINAL-SHOOT] Error executing shoot:', error);
      toast.error('Errore durante il tentativo');
      return false;
    }
  }, [missionData, state.remainingAttempts, state.hasWon, deactivateFinalShoot]);

  return {
    ...state,
    missionData,
    isLocked,
    totalMissionDays,
    isTestMode: isTestMode(),
    activateFinalShoot,
    deactivateFinalShoot,
    executeShoot,
  };
}

