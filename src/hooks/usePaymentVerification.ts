
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface PaymentVerificationResult {
  hasValidPayment: boolean;
  canAccessPremium: boolean;
  subscriptionTier: string;
  remainingBuzz: number;
  weeklyBuzzLimit: number;
  loading: boolean;
  requireBuzzPayment: () => Promise<boolean>;
  logUnauthorizedAccess: (event: string, details?: any) => Promise<void>;
}

export const usePaymentVerification = (): PaymentVerificationResult => {
  const { user, getCurrentUser } = useAuthContext();
  const [result, setResult] = useState<Omit<PaymentVerificationResult, 'requireBuzzPayment' | 'logUnauthorizedAccess'>>({
    hasValidPayment: false,
    canAccessPremium: false,
    subscriptionTier: 'Free',
    remainingBuzz: 0,
    weeklyBuzzLimit: 1,
    loading: true,
  });

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      // Get current user with developer support
      const currentUser = getCurrentUser();
      const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      
      console.log("🔍 Payment verification for:", {
        email: currentUser?.email,
        isDeveloper,
        hasDeveloperAccess
      });

      // DEVELOPER BYPASS - always grant access
      if (isDeveloper || hasDeveloperAccess) {
        console.log("🔧 Developer bypass activated - granting full access");
        setResult({
          hasValidPayment: true,
          canAccessPremium: true,
          subscriptionTier: 'Developer',
          remainingBuzz: 999,
          weeklyBuzzLimit: 999,
          loading: false,
        });
        return;
      }

      if (!currentUser?.id) {
        console.log("❌ No user for payment verification");
        setResult(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Check subscription status
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('tier, status, end_date')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .single();

        if (subError && subError.code !== 'PGRST116') {
          console.error("Error checking subscription:", subError);
        }

        // Check payment methods
        const { data: paymentMethods, error: pmError } = await supabase
          .from('user_payment_methods')
          .select('id')
          .eq('user_id', currentUser.id);

        if (pmError) {
          console.error("Error checking payment methods:", pmError);
        }

        const hasPaymentMethod = paymentMethods && paymentMethods.length > 0;
        const hasActiveSubscription = subscription && subscription.status === 'active';
        
        setResult({
          hasValidPayment: hasPaymentMethod || hasActiveSubscription || false,
          canAccessPremium: hasActiveSubscription || false,
          subscriptionTier: subscription?.tier || 'Free',
          remainingBuzz: hasActiveSubscription ? 10 : 1, // Example values
          weeklyBuzzLimit: hasActiveSubscription ? 20 : 1,
          loading: false,
        });

      } catch (error) {
        console.error("Payment verification error:", error);
        setResult(prev => ({ ...prev, loading: false }));
      }
    };

    verifyPaymentStatus();
  }, [user, getCurrentUser]);

  const requireBuzzPayment = async (): Promise<boolean> => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // Developer bypass
    if (isDeveloper || hasDeveloperAccess) {
      console.log("🔧 Developer payment bypass - access granted");
      return true;
    }
    
    // Check if user has valid payment
    if (result.hasValidPayment && result.canAccessPremium) {
      return true;
    }
    
    console.log("❌ Payment required - access denied");
    return false;
  };

  const logUnauthorizedAccess = async (event: string, details?: any): Promise<void> => {
    const currentUser = getCurrentUser();
    
    if (!currentUser?.id) {
      console.warn("Cannot log unauthorized access - no user ID");
      return;
    }

    try {
      await supabase
        .from('abuse_logs')
        .insert({
          user_id: currentUser.id,
          event_type: event,
        });
      
      console.log(`🚨 Logged unauthorized access: ${event}`, details);
    } catch (error) {
      console.error("Failed to log unauthorized access:", error);
    }
  };

  return {
    ...result,
    requireBuzzPayment,
    logUnauthorizedAccess,
  };
};
