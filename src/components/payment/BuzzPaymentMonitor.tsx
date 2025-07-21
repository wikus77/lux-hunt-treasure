// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

const BuzzPaymentMonitor: React.FC = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('🎯 BuzzPaymentMonitor: Starting payment monitoring');

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
              const center = JSON.parse(sessionStorage.getItem("m1ssion_last_map_center") || "{}");
              const zoom = parseInt(sessionStorage.getItem("m1ssion_last_map_zoom") || "13", 10);
              
              console.log('🗺️ Navigating to map with restored state:', { center, zoom });
              navigate("/map", { replace: true });

              // Restore map position after navigation
              setTimeout(() => {
                if ((window as any).leafletMap && center?.lat) {
                  console.log('🎯 Restoring map position:', { center, zoom });
                  (window as any).leafletMap.setView([center.lat, center.lng], zoom);
                }
              }, 800);
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