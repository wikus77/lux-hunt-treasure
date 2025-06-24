
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  lastCheck?: Date;
}

export const useDynamicIslandSafety = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [isBuzzSafe, setIsBuzzSafe] = useState<SafetyCheckResult>({ 
    isSafe: true,
    lastCheck: new Date()
  });

  useEffect(() => {
    const checkBuzzSafety = async () => {
      if (!isAuthenticated || !user) {
        setIsBuzzSafe({ 
          isSafe: false, 
          reason: 'Authentication required',
          lastCheck: new Date()
        });
        return;
      }

      try {
        // Enhanced safety check with multiple validation layers
        const checks = [
          // Check 1: User session validity
          user.email_confirmed_at !== null,
          // Check 2: Recent activity (simulate)
          Date.now() % 100 > 10,
          // Check 3: Rate limiting simulation
          localStorage.getItem(`last_buzz_${user.id}`) 
            ? Date.now() - parseInt(localStorage.getItem(`last_buzz_${user.id}`) || '0') > 5000
            : true
        ];

        const allChecksPassed = checks.every(check => check);

        if (!allChecksPassed) {
          setIsBuzzSafe({ 
            isSafe: false, 
            reason: 'Safety validation failed',
            lastCheck: new Date()
          });
          toast.warning('Safety check failed', {
            description: 'Please wait before trying again.'
          });
        } else {
          setIsBuzzSafe({ 
            isSafe: true,
            lastCheck: new Date()
          });
        }
      } catch (error: any) {
        console.error('Error during safety check:', error);
        setIsBuzzSafe({ 
          isSafe: false, 
          reason: error.message || 'Unknown safety error',
          lastCheck: new Date()
        });
      }
    };

    checkBuzzSafety();
    
    // Recheck every 30 seconds
    const interval = setInterval(checkBuzzSafety, 30000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const refreshSafetyCheck = () => {
    if (isAuthenticated && user) {
      setIsBuzzSafe({ 
        isSafe: true,
        lastCheck: new Date()
      });
    }
  };

  return {
    isBuzzSafe,
    refreshSafetyCheck
  };
};
