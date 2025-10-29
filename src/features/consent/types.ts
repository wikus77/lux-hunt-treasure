// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export type ConsentStatus = 'accepted' | 'rejected' | 'granular' | 'pending';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface ConsentData {
  status: ConsentStatus;
  timestamp: string;
  preferences?: ConsentPreferences;
  version?: string; // For future policy updates
}

export const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  personalization: false,
};

export const CONSENT_STORAGE_KEY = 'm1:cookie_consent:v1';
export const CONSENT_TTL_DAYS = 180; // Optional: 6 months

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
