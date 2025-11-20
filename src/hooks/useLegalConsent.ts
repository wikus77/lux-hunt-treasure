// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';

interface LegalConsentState {
  isAccepted: boolean;
  isLoading: boolean;
  needsConsent: boolean;
}

export const useLegalConsent = () => {
  // Stub: Legacy consent tracking - return accepted state
  const [state] = useState<LegalConsentState>({
    isAccepted: true,
    isLoading: false,
    needsConsent: false
  });

  const acceptConsent = async () => {
    console.log('useLegalConsent: acceptConsent stub');
    return true;
  };

  return {
    ...state,
    acceptConsent
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
