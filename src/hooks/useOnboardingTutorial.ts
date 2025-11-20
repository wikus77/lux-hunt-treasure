// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';

export const useOnboardingTutorial = () => {
  // Stub: No get_user_flags/set_hide_tutorial RPC - return stub state
  const [showTutorial] = useState(false);
  const [isLoading] = useState(false);

  const hideTutorial = async () => {
    console.log('useOnboardingTutorial: hideTutorial stub');
  };

  return {
    showTutorial,
    isLoading,
    hideTutorial
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
