// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Legacy stub for compatibility - no DB table exists

export type BuzzGrant = { 
  source: string; 
  remaining: number; 
  created_at?: string;
};

export const useBuzzGrants = () => {
  return { 
    loading: false, 
    error: null, 
    grants: [] as BuzzGrant[],
    totalRemaining: 0
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
