// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState } from 'react';

export const useActiveMissionEnrollment = () => {
  // Stub: No mission_enrollments table exists - return null state
  const [isEnrolled] = useState(false);
  const [isLoading] = useState(false);

  return { isEnrolled, isLoading };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
