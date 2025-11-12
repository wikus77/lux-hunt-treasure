// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const BuzzPaymentMonitor: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [, navigate] = useLocation();

  
  useEffect(() => {
    // SAFETY CHECK: Only activate monitor if user is authenticated
    if (!isAuthenticated || !user?.id) {
      console.log('🎯 BuzzPaymentMonitor: Waiting for user authentication...');
      return;
    }

    console.log('🎯 BuzzPaymentMonitor: Starting payment monitoring for user:', user.id);

    const subscription = supabase
      .channel('payment_monitor')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const paymentData = payload.new;
          console.log('💳 Payment status update:', paymentData);

          if (paymentData?.status === 'succeeded' && 
              paymentData?.description?.includes('Buzz Map')) {
            
            console.log('✅ BUZZ MAPPA Payment succeeded - initiating redirect');
            
            const redirectToMap = () => {
              console.log('🗺️ Redirecting to map with state restoration');
              navigate("/map-3d-tiler", {
                replace: true,
                state: { restorePreviousMapState: true }
              });
            };

            // Handle PWA visibility state for iOS Safari
            if (document.visibilityState === "visible") {
              redirectToMap();
            } else {
              const handleVisibilityChange = () => {
                if (document.visibilityState === "visible") {
                  redirectToMap();
                  document.removeEventListener("visibilitychange", handleVisibilityChange);
                }
              };
              document.addEventListener("visibilitychange", handleVisibilityChange);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🎯 BuzzPaymentMonitor: Cleanup');
      subscription.unsubscribe();
    };
  }, [isAuthenticated, user, navigate]);

  return null;
};

export default BuzzPaymentMonitor;