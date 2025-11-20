// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';

interface LegalConsentState {
  isAccepted: boolean;
  isLoading: boolean;
  needsConsent: boolean;
}

export const useLegalConsent = () => {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [state, setState] = useState<LegalConsentState>({
    isAccepted: false,
    isLoading: true,
    needsConsent: false
  });

  useEffect(() => {
    checkLegalConsent();
  }, [user]);

  const checkLegalConsent = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (user) {
        // For authenticated users, check database
        const { data: consentData, error } = await supabase
          .from('user_consents')
          .select('granted')
          .eq('user_id', user.id)
          .eq('purpose', 'terms')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading legal consent:', error);
        }

        const isAccepted = consentData?.granted === true;
        setState({
          isAccepted,
          isLoading: false,
          needsConsent: !isAccepted
        });
      } else {
        // For anonymous users, check localStorage
        const savedConsent = localStorage.getItem('m1ssion_legal_consent');
        const isAccepted = savedConsent === 'true';
        
        setState({
          isAccepted,
          isLoading: false,
          needsConsent: !isAccepted
        });
      }
    } catch (error) {
      console.error('Error checking legal consent:', error);
      setState({
        isAccepted: false,
        isLoading: false,
        needsConsent: true
      });
    }
  };

  const acceptLegalConsent = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (user) {
        // Save to database for authenticated users
        const { error } = await supabase
          .from('user_consents')
          .upsert({
            user_id: user.id,
            purpose: 'terms',
            granted: true
          }, { onConflict: 'user_id,purpose' });

        if (error) {
          console.error('DB save error:', error);
          throw error;
        }
      }
      
      // ALWAYS save to localStorage as fallback/cache
      localStorage.setItem('m1ssion_legal_consent', 'true');
      localStorage.setItem('m1ssion_legal_consent_date', new Date().toISOString());

      setState({
        isAccepted: true,
        isLoading: false,
        needsConsent: false
      });

      toast({
        title: "🎯 Legal Terms Accepted",
        description: "Welcome to M1SSION™! Your skill-based adventure begins now."
      });

      // Force immediate state persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error('Error accepting legal consent:', error);
      
      // Even on error, save to localStorage so user can proceed
      localStorage.setItem('m1ssion_legal_consent', 'true');
      localStorage.setItem('m1ssion_legal_consent_date', new Date().toISOString());
      
      setState({
        isAccepted: true,
        isLoading: false,
        needsConsent: false
      });

      toast({
        title: "⚠️ Saved Locally",
        description: "Your consent has been saved. Welcome to M1SSION™!"
      });

      return true;
    }
  };

  return {
    ...state,
    acceptLegalConsent,
    refreshConsent: checkLegalConsent
  };
};