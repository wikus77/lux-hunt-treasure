// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LegalConsentState {
  isAccepted: boolean;
  isLoading: boolean;
  needsConsent: boolean;
}

export const useLegalConsent = () => {
  const { toast } = useToast();
  
  // Lazy initialization from localStorage to prevent flicker
  const [state, setState] = useState<LegalConsentState>(() => {
    const saved = localStorage.getItem('m1ssion_legal_consent') === 'true';
    return {
      isAccepted: saved,
      isLoading: false,
      needsConsent: !saved
    };
  });

  const acceptLegalConsent = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

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

  const refreshConsent = () => {
    const saved = localStorage.getItem('m1ssion_legal_consent') === 'true';
    setState({
      isAccepted: saved,
      isLoading: false,
      needsConsent: !saved
    });
  };

  return {
    ...state,
    acceptLegalConsent,
    refreshConsent
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
