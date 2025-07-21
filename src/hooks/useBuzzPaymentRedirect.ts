// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// BUZZ Payment Redirect Hook - Auto redirect to map after successful BUZZ payment

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/auth";

export const useBuzzPaymentRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 BUZZ Payment Redirect: Setting up payment success monitor');

    // Listen for successful BUZZ MAP payments
    const channel = supabase
      .channel('buzz-payment-success')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('💳 Payment transaction updated:', payload);
          
          const newRecord = payload.new as any;
          
          // Check if this is a successful BUZZ MAP payment
          if (
            newRecord.status === 'succeeded' && 
            newRecord.description?.includes('Buzz Map')
          ) {
            console.log('✅ BUZZ MAP payment succeeded! Auto-redirecting to map...');
            
            // Wait a moment for the area generation to complete
            setTimeout(() => {
              console.log('🧭 Navigating to /map after BUZZ payment success');
              navigate('/map', { replace: true });
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 BUZZ Payment Redirect: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, navigate]);
};