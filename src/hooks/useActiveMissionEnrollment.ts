// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Hook per verificare se l'utente è iscritto alla missione attiva

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// Cache key for localStorage
const ENROLLMENT_CACHE_KEY = 'm1_mission_enrolled';
const ENROLLMENT_MISSION_KEY = 'm1_enrolled_mission_id';

interface EnrollmentState {
  isEnrolled: boolean;
  isLoading: boolean;
  missionId: string | null;
  enrolledAt: string | null;
  error: string | null;
}

export const useActiveMissionEnrollment = () => {
  const { user } = useAuth();
  const [state, setState] = useState<EnrollmentState>({
    isEnrolled: false,
    isLoading: true,
    missionId: null,
    enrolledAt: null,
    error: null,
  });

  // Check localStorage cache first for instant UI
  useEffect(() => {
    try {
      const cached = localStorage.getItem(ENROLLMENT_CACHE_KEY);
      if (cached === '1') {
        setState(prev => ({ ...prev, isEnrolled: true }));
      }
    } catch (_) {}
  }, []);

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
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Step 1: Get current active mission
      const { data: activeMission, error: missionError } = await supabase
        .from('missions')
        .select('id, title, status')
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (missionError) {
        console.error('❌ [useActiveMissionEnrollment] Error fetching active mission:', missionError);
        // Don't fail completely - check localStorage fallback
        const cached = localStorage.getItem(ENROLLMENT_CACHE_KEY) === '1';
        setState({
          isEnrolled: cached,
          isLoading: false,
          missionId: null,
          enrolledAt: null,
          error: 'Errore nel caricamento missione',
        });
        return;
      }

      if (!activeMission) {
        // No active mission exists
        setState({
          isEnrolled: false,
          isLoading: false,
          missionId: null,
          enrolledAt: null,
          error: null,
        });
        // Clear cache since no mission
        try { localStorage.removeItem(ENROLLMENT_CACHE_KEY); } catch (_) {}
        return;
      }

      // Step 2: Check if user is enrolled in this mission
      const { data: enrollment, error: enrollError } = await supabase
        .from('mission_enrollments')
        .select('id, mission_id, created_at, state')
        .eq('user_id', user.id)
        .eq('mission_id', activeMission.id)
        .maybeSingle();

      if (enrollError) {
        console.error('❌ [useActiveMissionEnrollment] Error checking enrollment:', enrollError);
        // Fallback to localStorage
        const cached = localStorage.getItem(ENROLLMENT_CACHE_KEY) === '1';
        setState({
          isEnrolled: cached,
          isLoading: false,
          missionId: activeMission.id,
          enrolledAt: null,
          error: 'Errore nel controllo iscrizione',
        });
        return;
      }

      const isEnrolled = !!enrollment && enrollment.state !== 'cancelled';

      // Update localStorage cache
      try {
        if (isEnrolled) {
          localStorage.setItem(ENROLLMENT_CACHE_KEY, '1');
          localStorage.setItem(ENROLLMENT_MISSION_KEY, activeMission.id);
        } else {
          localStorage.removeItem(ENROLLMENT_CACHE_KEY);
          localStorage.removeItem(ENROLLMENT_MISSION_KEY);
        }
      } catch (_) {}

      setState({
        isEnrolled,
        isLoading: false,
        missionId: activeMission.id,
        enrolledAt: enrollment?.created_at || null,
        error: null,
      });

      console.log('✅ [useActiveMissionEnrollment] Status:', {
        userId: user.id,
        missionId: activeMission.id,
        missionTitle: activeMission.title,
        isEnrolled,
        enrolledAt: enrollment?.created_at,
      });

    } catch (err) {
      console.error('❌ [useActiveMissionEnrollment] Unexpected error:', err);
      // Fallback to localStorage
      const cached = localStorage.getItem(ENROLLMENT_CACHE_KEY) === '1';
      setState({
        isEnrolled: cached,
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
          console.log('🔄 [useActiveMissionEnrollment] Realtime update:', payload.eventType);
          // Refresh on any change
          checkEnrollment();
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
      // Immediate optimistic update
      setState(prev => ({
        ...prev,
        isEnrolled: true,
        missionId: event.detail?.missionId || prev.missionId,
      }));
      // Also refresh from DB to confirm
      setTimeout(checkEnrollment, 500);
    };

    window.addEventListener('mission:enrolled', handleEnrolled as EventListener);
    return () => window.removeEventListener('mission:enrolled', handleEnrolled as EventListener);
  }, [checkEnrollment]);

  return {
    isEnrolled: state.isEnrolled,
    isLoading: state.isLoading,
    missionId: state.missionId,
    enrolledAt: state.enrolledAt,
    error: state.error,
    refresh: checkEnrollment,
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
