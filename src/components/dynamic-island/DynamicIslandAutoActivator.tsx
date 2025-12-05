// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Dynamic Island Auto Activator - Activates on first user interaction after login

import { useEffect, useRef } from 'react';
import { useDynamicIsland } from '@/hooks/useDynamicIsland';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useAuth } from '@/hooks/use-auth';

const DynamicIslandAutoActivator: React.FC = () => {
  const { isActive, activate, updateData, deactivate } = useDynamicIsland();
  const { missionStatus } = useMissionStatus();
  const { user } = useAuth();
  const hasActivatedRef = useRef(false);
  const activationAttemptedRef = useRef(false);

  // Auto-activate on first user interaction after login
  useEffect(() => {
    if (!user) {
      // User logged out - reset state
      if (isActive) {
        deactivate();
      }
      hasActivatedRef.current = false;
      activationAttemptedRef.current = false;
      return;
    }

    if (hasActivatedRef.current) return;

    const handleFirstInteraction = async () => {
      if (hasActivatedRef.current || activationAttemptedRef.current) return;
      activationAttemptedRef.current = true;

      try {
        // Prepare initial status from mission data
        const initialData = missionStatus ? {
          cluesFound: missionStatus.cluesFound,
          totalClues: missionStatus.totalClues,
          daysRemaining: missionStatus.daysRemaining
        } : {
          cluesFound: 0,
          totalClues: 200,
          daysRemaining: 25
        };

        await activate(initialData);
        hasActivatedRef.current = true;
        
        // Remove listeners after activation
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
        
        console.log('🎵 Dynamic Island: Auto-activated on first interaction');
      } catch (error) {
        console.warn('🎵 Dynamic Island: Auto-activation failed', error);
        activationAttemptedRef.current = false; // Allow retry
      }
    };

    // Listen for first user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [user, activate, missionStatus, isActive, deactivate]);

  // Keep mission status synced when data changes
  useEffect(() => {
    if (isActive && missionStatus) {
      updateData({
        cluesFound: missionStatus.cluesFound,
        totalClues: missionStatus.totalClues,
        daysRemaining: missionStatus.daysRemaining
      });
    }
  }, [isActive, missionStatus, updateData]);

  // This component renders nothing - it's just for side effects
  return null;
};

export default DynamicIslandAutoActivator;
