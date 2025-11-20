// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export const useActiveMissionEnrollment = () => {
  const { user } = useAuthContext();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user?.id) {
        setIsEnrolled(false);
        setIsLoading(false);
        return;
      }

      try {
        // Get active mission
        const { data: missions, error: missionError } = await supabase
          .from('missions')
          .select('id')
          .eq('status', 'active')
          .order('start_date', { ascending: false })
          .limit(1);

        if (missionError || !missions || missions.length === 0) {
          setIsEnrolled(false);
          setIsLoading(false);
          return;
        }

        const activeMissionId = missions[0].id;

        // Check if user is enrolled
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('mission_enrollments')
          .select('user_id')
          .eq('user_id', user.id)
          .eq('mission_id', activeMissionId)
          .maybeSingle();

        setIsEnrolled(!!enrollment && !enrollmentError);
      } catch (err) {
        console.error('Error checking mission enrollment:', err);
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollment();
  }, [user?.id]);

  return { isEnrolled, isLoading };
};
