import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
}

export const useDynamicIslandSafety = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [isBuzzSafe, setIsBuzzSafe] = useState<SafetyCheckResult>({ isSafe: true });

  useEffect(() => {
    const checkBuzzSafety = async () => {
      if (!isAuthenticated || !user) {
        setIsBuzzSafe({ isSafe: false, reason: 'Not authenticated' });
        return;
      }

      try {
        // by Joseph Mulé – M1SSION™ – FIXED: Deterministic safety check
        // Verifica che l'utente abbia una sessione valida e ID valido
        if (!user.id || user.id.length < 10) {
          setIsBuzzSafe({ isSafe: false, reason: 'User ID non valido' });
          console.log('🔒 Dynamic Island safety: User ID non valido');
          return;
        }
        
        // Verifica che l'utente abbia email verificata
        if (!user.email_confirmed_at) {
          setIsBuzzSafe({ isSafe: false, reason: 'Email non verificata' });
          console.log('🔒 Dynamic Island safety: Email non verificata');
          return;
        }
        
        // Verifica che l'utente abbia una sessione attiva
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          setIsBuzzSafe({ isSafe: false, reason: 'Sessione non attiva' });
          console.log('🔒 Dynamic Island safety: Sessione non attiva');
          return;
        }
        
        // Tutto OK
        setIsBuzzSafe({ isSafe: true });
        console.log('✅ Dynamic Island safety check passed');
        
      } catch (error: any) {
        console.error('Error during safety check:', error);
        setIsBuzzSafe({ isSafe: false, reason: error.message || 'Unknown error' });
        console.log('❌ Dynamic Island safety check failed:', error.message);
      }
    };

    checkBuzzSafety();
  }, [user, isAuthenticated]);

  return {
    isBuzzSafe,
  };
};
