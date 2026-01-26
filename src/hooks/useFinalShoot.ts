// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT - Hook for the endgame precision shot feature
// 
// ⚠️ SECURITY NOTE (2025-01-17):
// - Vittoria determinata SOLO server-side via RPC `execute_final_shoot`
// - Nessun INSERT diretto dal client
// - Lock atomico "first winner" garantito da PK su `final_shoot_winners`
// - Il client NON conosce le coordinate del premio e NON può manipolare is_winner

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';

// Tipi per la risposta RPC
interface ExecuteFinalShootResponse {
  success: boolean;
  status: 'winner' | 'missed' | 'already_won' | 'already_claimed' | 'not_available' | 'no_attempts' | 'config_error';
  winner?: boolean;
  distance_meters?: number;
  attempts_remaining?: number;
  hint?: string;
  message?: string;
  error?: string;
  won_at?: string;
  winner_claimed_at?: string;
}

interface FinalShootState {
  isAvailable: boolean;       // True se siamo negli ultimi 7 giorni
  isActive: boolean;          // True se l'utente ha attivato la modalità
  remainingAttempts: number;  // 0-3
  daysRemaining: number;      // Giorni rimasti della missione
  hasWon: boolean;            // True se l'utente ha già vinto
  isLoading: boolean;
  alreadyClaimed: boolean;    // True se un altro utente ha già vinto il premio
  lastAttempt: {
    distance: number;
    hint: string;
  } | null;
}

interface MissionData {
  missionId: string | null;
  // ⚠️ prizeLocation RIMOSSO - il client NON deve conoscere le coordinate del premio!
  endsAt: Date | null;
}

// Check if test mode is enabled via URL parameter
const isTestMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('test-final-shoot') === 'true';
};

export function useFinalShoot() {
  const [state, setState] = useState<FinalShootState>({
    isAvailable: false,
    isActive: false,
    remainingAttempts: 3,
    daysRemaining: 0,
    hasWon: false,
    alreadyClaimed: false,
    isLoading: true,
    lastAttempt: null,
  });

  const [missionData, setMissionData] = useState<MissionData>({
    missionId: null,
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
            endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          });
          setIsLocked(false);
          setState({
            isAvailable: true,
            isActive: false,
            remainingAttempts: 3,
            daysRemaining: 3,
            hasWon: false,
            alreadyClaimed: false,
            isLoading: false,
            lastAttempt: null,
          });
          setTotalMissionDays(30);
          return;
        }

        // Get current mission data
        // ⚠️ NON selezioniamo prize_lat/prize_lng - il client non deve conoscere le coordinate!
        const { data: mission, error: missionError } = await supabase
          .from('current_mission_data')
          .select('id, mission_ends_at, mission_started_at, mission_status, linked_mission_id')
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

        const missionId = mission.linked_mission_id || mission.id;

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

        // Set mission data (senza coordinate premio!)
        setMissionData({
          missionId,
          endsAt,
        });

        // Get user's remaining attempts
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
          return;
        }

        // Check if prize already claimed by someone else
        const { data: winner } = await supabase
          .from('final_shoot_winners')
          .select('winner_user_id, won_at')
          .eq('mission_id', missionId)
          .maybeSingle();

        const alreadyClaimed = winner !== null && winner.winner_user_id !== user.id;
        const hasWonByMe = winner !== null && winner.winner_user_id === user.id;

        // Get user's attempts
        const { data: attempts, error: attemptsError } = await supabase
          .from('final_shoot_attempts')
          .select('id, distance_meters, is_winner, created_at')
          .eq('user_id', user.id)
          .eq('mission_id', missionId)
          .order('created_at', { ascending: false });

        if (attemptsError) {
          console.error('🎯 [FINAL-SHOOT] Error fetching attempts:', attemptsError);
        }

        const attemptsCount = attempts?.length || 0;
        const remainingAttempts = Math.max(0, 3 - attemptsCount);

        // Get last attempt hint
        const lastAttempt = attempts?.[0] 
          ? { distance: attempts[0].distance_meters, hint: getHintFromDistance(attempts[0].distance_meters) }
          : null;

        setState({
          isAvailable: isAvailable && !alreadyClaimed,
          isActive: false,
          remainingAttempts,
          daysRemaining,
          hasWon: hasWonByMe,
          alreadyClaimed,
          isLoading: false,
          lastAttempt,
        });

        console.log('🎯 [FINAL-SHOOT] Status:', {
          isAvailable,
          isLocked: locked,
          daysRemaining,
          remainingAttempts,
          hasWon: hasWonByMe,
          alreadyClaimed,
        });

      } catch (error) {
        console.error('🎯 [FINAL-SHOOT] Error checking availability:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAvailability();
  }, []);

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
  // ⚠️ SECURITY: Usa ESCLUSIVAMENTE la RPC server-side, nessun calcolo client-side!
  const executeShoot = useCallback(async (lat: number, lng: number): Promise<boolean> => {
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

    if (state.alreadyClaimed) {
      toast.error('Il premio è già stato vinto da un altro agente.');
      return false;
    }

    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Devi essere loggato');
        return false;
      }

      console.log('🎯 [FINAL-SHOOT] Executing via RPC...', { lat, lng, missionId: missionData.missionId });

      // ═══════════════════════════════════════════════════════════════════════════
      // ⚠️ SECURITY: Chiamata RPC server-side - la vittoria è determinata dal server!
      // Il client NON calcola la distanza e NON decide se ha vinto.
      // ═══════════════════════════════════════════════════════════════════════════
      const { data: result, error: rpcError } = await supabase.rpc('execute_final_shoot', {
        p_user_id: user.id,
        p_mission_id: missionData.missionId,
        p_lat: lat,
        p_lng: lng,
      });

      if (rpcError) {
        console.error('🎯 [FINAL-SHOOT] RPC Error:', rpcError);
        toast.error('Errore durante il tentativo. Riprova.');
        return false;
      }

      const response = result as ExecuteFinalShootResponse;
      console.log('🎯 [FINAL-SHOOT] RPC Response:', response);

      // 📊 Track attempt (sempre, indipendentemente dal risultato)
      track('final_shot_attempted', {
        mission_id: missionData.missionId,
        status: response.status,
        distance_meters: response.distance_meters,
        attempts_remaining: response.attempts_remaining,
      });

      // Gestisci i vari status della risposta
      switch (response.status) {
        case 'winner':
          // 🎉 L'utente ha VINTO! (determinato dal server)
          
          // 📊 Track WINNER EVENT (critical)
          track('final_shot_won', {
            mission_id: missionData.missionId,
            distance_meters: response.distance_meters,
            won_at: response.won_at || new Date().toISOString(),
          }, { immediate: true }); // Send immediately, don't batch
          
          setState(prev => ({
            ...prev,
            remainingAttempts: response.attempts_remaining ?? prev.remainingAttempts - 1,
            hasWon: true,
            isActive: false,
            lastAttempt: { 
              distance: response.distance_meters ?? 0, 
              hint: '🎯 PERFETTO! HAI VINTO!' 
            },
          }));

          toast.success('🎉 HAI VINTO IL FINAL SHOOT!', {
            description: response.message || 'Complimenti! Hai trovato la posizione esatta del premio!',
            duration: 10000,
          });
          
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([500, 200, 500, 200, 500]);
          }

          deactivateFinalShoot();
          return true;

        case 'missed':
          // Non vincitore, mostra hint dal server
          const hint = response.hint || getHintFromDistance(response.distance_meters ?? 9999);
          
          setState(prev => ({
            ...prev,
            remainingAttempts: response.attempts_remaining ?? prev.remainingAttempts - 1,
            lastAttempt: { 
              distance: response.distance_meters ?? 0, 
              hint 
            },
          }));

          toast.info(hint, {
            description: `Tentativi rimasti: ${response.attempts_remaining ?? 0}`,
            duration: 5000,
          });
          return false;

        case 'already_won':
          // L'utente ha già vinto questa missione
          setState(prev => ({ ...prev, hasWon: true, isActive: false }));
          toast.success(response.message || 'Hai già vinto il Final Shoot!');
          return false;

        case 'already_claimed':
          // Un altro utente ha già vinto
          setState(prev => ({ ...prev, alreadyClaimed: true, isAvailable: false, isActive: false }));
          toast.error(response.error || 'Il premio è già stato vinto da un altro agente.');
          return false;

        case 'not_available':
          setState(prev => ({ ...prev, isAvailable: false }));
          toast.error(response.error || 'Final Shoot non disponibile.');
          return false;

        case 'no_attempts':
          setState(prev => ({ ...prev, remainingAttempts: 0 }));
          toast.error(response.error || 'Hai esaurito tutti i tentativi.');
          return false;

        case 'config_error':
          toast.error('Errore di configurazione. Contatta il supporto.');
          return false;

        default:
          // Fallback per status non gestiti
          if (!response.success) {
            toast.error(response.error || 'Errore sconosciuto. Riprova.');
            return false;
          }
          return false;
      }

    } catch (error) {
      console.error('🎯 [FINAL-SHOOT] Error executing shoot:', error);
      toast.error('Errore durante il tentativo. Riprova.');
      return false;
    }
  }, [missionData.missionId, state.remainingAttempts, state.hasWon, state.alreadyClaimed, deactivateFinalShoot]);

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

// 🔧 FIX 26/01/2026: Soglie hint ragionevoli (allineate con RPC)
// Helper per generare hint (usato solo per display, mai per logica di vittoria)
function getHintFromDistance(distanceMeters: number): string {
  if (distanceMeters <= 19) return '🎯 PERFETTO! HAI VINTO!';
  if (distanceMeters <= 150) return '🔥 Ci sei quasi! Pochissimi passi!';
  if (distanceMeters <= 500) return '🌡️ Molto vicino! Sei in zona calda!';
  if (distanceMeters <= 1000) return '☀️ Vicino! Continua così!';
  if (distanceMeters <= 3000) return '😊 Sei in zona. Esplora meglio!';
  if (distanceMeters <= 5000) return '😐 Zona giusta ma non vicinissimo.';
  if (distanceMeters <= 10000) return '❄️ Lontano. Cambia direzione!';
  if (distanceMeters <= 25000) return '🥶 Molto lontano. Riconsidera la zona!';
  return '🌍 Lontanissimo! Sei fuori area.';
}

