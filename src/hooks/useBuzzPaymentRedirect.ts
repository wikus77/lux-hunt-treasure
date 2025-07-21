// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export const useBuzzPaymentRedirect = () => {
  const { navigate } = useWouterNavigation();
  const { user } = useAuthContext();
  const [location] = useLocation();

  useEffect(() => {
    if (!user?.id) return;

    console.log('🎯 BUZZ Payment Redirect Monitor started');

    const channel = supabase
      .channel('buzz-payment-success')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('💳 Payment status updated:', payload);
          
          const transaction = payload.new;
          if (
            transaction?.status === 'succeeded' &&
            transaction?.description?.includes('Buzz Map')
          ) {
            console.log('✅ BUZZ MAP payment succeeded, preparing redirect...');
            
            // Get saved map state
            const restoreState = sessionStorage.getItem('m1_map_restore');
            
            const redirectToMap = () => {
              if (document.visibilityState === 'visible') {
                console.log('🗺️ Redirecting to map with restored state');
                navigate('/map', { replace: true });
              } else {
                // If PWA is in background, wait for it to become visible
                const handleVisibilityChange = () => {
                  if (document.visibilityState === 'visible') {
                    console.log('🗺️ PWA now visible, redirecting to map');
                    navigate('/map', { replace: true });
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                  }
                };
                document.addEventListener('visibilitychange', handleVisibilityChange);
              }
            };

            // Small delay to ensure payment processing is complete
            setTimeout(redirectToMap, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🎯 BUZZ Payment Redirect Monitor cleanup');
      supabase.removeChannel(channel);
    };
  }, [user?.id, navigate]);
};