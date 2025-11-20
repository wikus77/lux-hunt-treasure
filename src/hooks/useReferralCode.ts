// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';

export const useReferralCode = () => {
  // Stub: No referral_code column - return stub state
  const [referralCode] = useState<string | null>(null);
  const [loading] = useState(false);

  const generateReferralCode = async () => {
    console.log('useReferralCode: generateReferralCode stub');
    return null;
  };

  const applyReferralCode = async () => {
    console.log('useReferralCode: applyReferralCode stub');
    return false;
  };

  return {
    referralCode,
    loading,
    generateReferralCode,
    applyReferralCode
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
