// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hook per verificare se l'utente è iscritto alla missione attiva
// V2 FIX: DB-first, localStorage NON fa più override

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// Cache key for localStorage
const ENROLLMENT_CACHE_KEY = 'm1_mission_enrolled';
const ENROLLMENT_MISSION_KEY = 'm1_enrolled_mission_id';

// Helper per pulire TUTTA la cache enrollment E mission data
const clearEnrollmentCache = () => {
  try {
    localStorage.removeItem(ENROLLMENT_CACHE_KEY);
    localStorage.removeItem(ENROLLMENT_MISSION_KEY);
    // 🔧 FIX: Pulisci TUTTA la cache mission-related
    localStorage.removeItem('mission-progress');
    localStorage.removeItem('purchased-clues');
    localStorage.removeItem('diary-entries');
    localStorage.removeItem('cch_last_checked');
    localStorage.removeItem('ums_last_checked');
    console.log('🧹 [useActiveMissionEnrollment] ALL cache cleared');
  } catch (_) {}
};

// 🔧 FIX: Check cross-page reset on module load
const checkCrossPageReset = (): boolean => {
  try {
    const lastResetStr = localStorage.getItem('m1ssion_last_reset');
    const lastCheckedStr = localStorage.getItem('enrollment_last_checked');
    
    if (lastResetStr) {
      const lastReset = parseInt(lastResetStr, 10);
      const lastChecked = lastCheckedStr ? parseInt(lastCheckedStr, 10) : 0;
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      if (lastReset > lastChecked && lastReset > fiveMinutesAgo) {
        console.log('🚨 [useActiveMissionEnrollment] Cross-page reset detected on load!');
        localStorage.setItem('enrollment_last_checked', Date.now().toString());
        clearEnrollmentCache();
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

interface EnrollmentState {
  isEnrolled: boolean;
  isLoading: boolean;
  missionId: string | null;
  enrolledAt: string | null;
  error: string | null;
}

export const useActiveMissionEnrollment = () => {
  const { user } = useAuth();
  
  // 🔧 FIX: Check for cross-page reset FIRST before using cache
  const wasReset = checkCrossPageReset();
  
  // 🔥 V3 FIX: Leggi cache SUBITO per evitare flash (MA NON se c'è stato reset!)
  const cachedEnrollment = (() => {
    if (wasReset) return false; // 🔧 FIX: Se reset, ignora cache!
    try {
      return localStorage.getItem(ENROLLMENT_CACHE_KEY) === '1';
    } catch { return false; }
  })();
  
  const [state, setState] = useState<EnrollmentState>({
    isEnrolled: cachedEnrollment, // 🔥 Usa cache come valore iniziale
    isLoading: !cachedEnrollment || wasReset, // Se cache dice enrolled E non c'è stato reset, non mostrare loading
    missionId: null,
    enrolledAt: null,
    error: null,
  });
  const hasCheckedDb = useRef(false);

  // La cache è usata per il rendering iniziale, poi il DB la sovrascrive

  // Main enrollment check function
  const checkEnrollment = useCallback(async () => {
    if (!user) {
      setState({
        isEnrolled: false,
        isLoading: false,
        missionId: null,
        enrolledAt: null,
        error: null,
      });
      clearEnrollmentCache(); // Pulisci cache se non c'è utente
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Step 1: 🔥 FIX: Get current active mission from CURRENT_MISSION_DATA first
      // (dove l'admin crea le missioni), poi fallback su missions
      let activeMission: { id: string; title: string; status: string } | null = null;

      // Try current_mission_data first (where admin creates missions)
      const { data: cmdMission, error: cmdError } = await supabase
        .from('current_mission_data')
        .select('id, mission_name, mission_status')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cmdError && cmdMission) {
        activeMission = {
          id: cmdMission.id,
          title: cmdMission.mission_name,
          status: cmdMission.mission_status,
        };
        console.log('📍 [useActiveMissionEnrollment] Found mission in current_mission_data:', cmdMission.mission_name);
      } else {
        // Fallback to missions table
        const { data: missionData, error: missionError } = await supabase
          .from('missions')
          .select('id, title, status')
          .eq('status', 'active')
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (missionError) {
          console.error('❌ [useActiveMissionEnrollment] Error fetching active mission:', missionError);
          // 🔥 FIX: Se errore DB, NON usare cache - segnala errore
          setState({
            isEnrolled: false,
            isLoading: false,
            missionId: null,
            enrolledAt: null,
            error: 'Errore nel caricamento missione',
          });
          return;
        }

        activeMission = missionData;
      }

      if (!activeMission) {
        // No active mission exists
        console.log('⚠️ [useActiveMissionEnrollment] No active mission found');
        setState({
          isEnrolled: false,
          isLoading: false,
          missionId: null,
          enrolledAt: null,
          error: null,
        });
        clearEnrollmentCache(); // 🔥 FIX: Pulisci cache!
        return;
      }

      // Step 2: Check if user is enrolled in this mission
      // 🔥 FIX: La tabella potrebbe avere schema diverso (vecchio vs nuovo)
      // Usiamo '*' per essere compatibili con entrambi gli schemi
      const { data: enrollment, error: enrollError } = await supabase
        .from('mission_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('mission_id', activeMission.id)
        .maybeSingle();

      if (enrollError) {
        console.error('❌ [useActiveMissionEnrollment] Error checking enrollment:', enrollError);
        // 🔥 FIX: Se errore DB, NON usare cache - mostra stato neutro
        setState({
          isEnrolled: false,
          isLoading: false,
          missionId: activeMission.id,
          enrolledAt: null,
          error: 'Errore nel controllo iscrizione',
        });
        return;
      }

      // 🔥 FIX: Check enrollment senza dipendere da campi specifici
      // La tabella potrebbe avere 'state' (nuovo schema) o no (vecchio schema)
      const enrollmentState = enrollment?.state;
      const isEnrolled = !!enrollment && enrollmentState !== 'cancelled';

      // 🔥 FIX: Aggiorna localStorage SOLO se il DB conferma l'enrollment
      if (isEnrolled) {
        try {
          localStorage.setItem(ENROLLMENT_CACHE_KEY, '1');
          localStorage.setItem(ENROLLMENT_MISSION_KEY, activeMission.id);
        } catch (_) {}
      } else {
        // 🔥 CRITICAL: Se DB dice NO, PULISCI la cache!
        clearEnrollmentCache();
      }

      // 🔥 FIX: La data potrebbe essere 'created_at' (nuovo) o 'joined_at' (vecchio)
      const enrolledAt = enrollment?.created_at || enrollment?.joined_at || null;

      setState({
        isEnrolled,
        isLoading: false,
        missionId: activeMission.id,
        enrolledAt,
        error: null,
      });

      hasCheckedDb.current = true;

      console.log('✅ [useActiveMissionEnrollment] Status:', {
        userId: user.id.slice(-8),
        missionId: activeMission.id,
        missionTitle: activeMission.title,
        isEnrolled,
        enrolledAt: enrollment?.created_at,
      });

    } catch (err) {
      console.error('❌ [useActiveMissionEnrollment] Unexpected error:', err);
      // 🔥 FIX: Non usare fallback a localStorage in caso di errore!
      setState({
        isEnrolled: false,
        isLoading: false,
        missionId: null,
        enrolledAt: null,
        error: 'Errore di connessione',
      });
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  // Real-time subscription for instant updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('mission_enrollment_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_enrollments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 [useActiveMissionEnrollment] Enrollment change:', payload.eventType);
          checkEnrollment();
        }
      )
      // 🔧 FIX: Ascolta anche i cambiamenti di current_mission_data
      // Così quando viene lanciata una nuova missione, l'hook si aggiorna
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'current_mission_data',
        },
        (payload) => {
          console.log('🚀 [useActiveMissionEnrollment] Mission changed:', payload.eventType);
          // Pulisci cache e ri-verifica
          clearEnrollmentCache();
          setState({
            isEnrolled: false,
            isLoading: true,
            missionId: null,
            enrolledAt: null,
            error: null,
          });
          setTimeout(checkEnrollment, 500);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, checkEnrollment]);

  // Listen for custom event (from StartMissionButton)
  useEffect(() => {
    const handleEnrolled = (event: CustomEvent) => {
      console.log('🎯 [useActiveMissionEnrollment] mission:enrolled event received:', event.detail);
      
      // 🔥 V4 FIX: Set cache IMMEDIATAMENTE per evitare flash su altre pagine
      try {
        localStorage.setItem(ENROLLMENT_CACHE_KEY, '1');
        if (event.detail?.missionId) {
          localStorage.setItem(ENROLLMENT_MISSION_KEY, event.detail.missionId);
        }
      } catch (_) {}
      
      // Immediate optimistic update
      setState(prev => ({
        ...prev,
        isEnrolled: true,
        isLoading: false, // 🔥 V4 FIX: Anche isLoading a false!
        missionId: event.detail?.missionId || prev.missionId,
      }));
      // Also refresh from DB to confirm
      setTimeout(checkEnrollment, 500);
    };

    // 🔥 FIX: Listen for missionLaunched event (from admin panel)
    // Quando una nuova missione viene lanciata, TUTTI gli utenti devono essere resettati
    const handleMissionLaunched = () => {
      console.log('🚀 [useActiveMissionEnrollment] missionLaunched event received - RESETTING STATE');
      // 1. Pulisci cache localStorage
      clearEnrollmentCache();
      // 2. Reset state immediato
      setState({
        isEnrolled: false,
        isLoading: true,
        missionId: null,
        enrolledAt: null,
        error: null,
      });
      // 3. Ri-verifica dal DB
      setTimeout(checkEnrollment, 300);
    };

    // 🔥 FIX: Listen for mission:reset event (for manual reset)
    const handleMissionReset = () => {
      console.log('🔄 [useActiveMissionEnrollment] mission:reset event received - CLEARING STATE');
      clearEnrollmentCache();
      setState({
        isEnrolled: false,
        isLoading: false,
        missionId: null,
        enrolledAt: null,
        error: null,
      });
    };

    window.addEventListener('mission:enrolled', handleEnrolled as EventListener);
    window.addEventListener('missionLaunched', handleMissionLaunched);
    window.addEventListener('mission:reset', handleMissionReset);
    window.addEventListener('missionReset', handleMissionReset); // 🔥 FIX: Anche senza i due punti
    
    return () => {
      window.removeEventListener('mission:enrolled', handleEnrolled as EventListener);
      window.removeEventListener('missionLaunched', handleMissionLaunched);
      window.removeEventListener('mission:reset', handleMissionReset);
      window.removeEventListener('missionReset', handleMissionReset);
    };
  }, [checkEnrollment]);

  return {
    isEnrolled: state.isEnrolled,
    isLoading: state.isLoading,
    missionId: state.missionId,
    enrolledAt: state.enrolledAt,
    error: state.error,
    refresh: checkEnrollment,
    clearCache: clearEnrollmentCache, // 🔥 Esponi per uso esterno
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
