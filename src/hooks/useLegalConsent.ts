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
  // © 2025 M1SSION™ NIYVORA KFT – Lazy initialization to prevent banner flicker
  const [state, setState] = useState<LegalConsentState>(() => {
    const saved = localStorage.getItem('m1ssion_legal_consent') === 'true';
    return {
      isAccepted: saved,
      isLoading: false,
      needsConsent: !saved
    };
  });

  useEffect(() => {
    checkLegalConsent();
  }, [user]);

  const checkLegalConsent = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Always use localStorage for legal consent (database column doesn't exist)
      const savedConsent = localStorage.getItem('m1ssion_legal_consent');
      const isAccepted = savedConsent === 'true';
      
      setState({
        isAccepted,
        isLoading: false,
        needsConsent: !isAccepted
      });
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

      // Always use localStorage for legal consent (database column doesn't exist)
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

      return true;
    } catch (error) {
      console.error('Error accepting legal consent:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "❌ Error",
        description: "Unable to save consent. Please try again.",
        variant: "destructive"
      });

      return false;
    }
  };

  return {
    ...state,
    acceptLegalConsent,
    refreshConsent: checkLegalConsent
  };
};