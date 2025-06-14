
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoRecovery = () => {
  useEffect(() => {
    const handleAutoRecovery = async () => {
      const currentPath = window.location.pathname;
      
      // Auto-recovery solo se siamo sulla pagina login
      if (currentPath === '/login') {
        const lastRetry = localStorage.getItem('last-login-retry');
        
        if (lastRetry && lastRetry !== '0') {
          console.log('🔄 AUTO-RECOVERY: Checking for existing session...');
          
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (session && !error) {
              console.log('✅ AUTO-RECOVERY: Session found, redirecting to /home');
              window.location.href = '/home';
            } else {
              console.log('ℹ️ AUTO-RECOVERY: No valid session found');
            }
          } catch (error) {
            console.error('❌ AUTO-RECOVERY: Error checking session:', error);
          }
        }
      }
    };

    // Delay per evitare race conditions all'avvio
    const timer = setTimeout(handleAutoRecovery, 1000);
    
    return () => clearTimeout(timer);
  }, []);
};
