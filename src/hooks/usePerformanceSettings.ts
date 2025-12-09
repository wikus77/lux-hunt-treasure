// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';

export type BattleFxPerformanceMode = 'high' | 'low';

interface PerformanceSettings {
  battleFxMode: BattleFxPerformanceMode;
  setBattleFxMode: (mode: BattleFxPerformanceMode) => Promise<void>;
  isBattleFxEnabled: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'm1_battle_fx_performance_mode';
const DEFAULT_MODE: BattleFxPerformanceMode = 'high';

/**
 * Hook for managing Battle FX Performance Mode settings
 * Persists to user_settings table (preferred) or localStorage (fallback)
 */
export function usePerformanceSettings(): PerformanceSettings {
  const { user, isAuthenticated } = useUnifiedAuth();
  const [battleFxMode, setBattleFxModeState] = useState<BattleFxPerformanceMode>(DEFAULT_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Always try localStorage first as fallback source
        const savedModeLocal = localStorage.getItem(STORAGE_KEY) as BattleFxPerformanceMode | null;
        if (savedModeLocal === 'high' || savedModeLocal === 'low') {
          setBattleFxModeState(savedModeLocal);
        }

        // NOTE: user_settings table may not have 'preferences' column
        // Use localStorage as primary storage until DB schema is updated
        // This avoids 400 errors on non-existent columns
      } catch (e) {
        console.debug('[PerformanceSettings] Load error (non-critical):', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated, user?.id]);

  // Listen to realtime settings updates
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const handleSettingsSync = (event: CustomEvent) => {
      try {
        const detail = event.detail as any;
        if (detail?.preferences?.battle?.fxMode) {
          const mode = detail.preferences.battle.fxMode as BattleFxPerformanceMode;
          if (mode === 'high' || mode === 'low') {
            setBattleFxModeState(mode);
            console.log('[PerformanceSettings] Synced from realtime:', mode);
          }
        }
      } catch (e) {
        console.warn('[PerformanceSettings] Sync error:', e);
      }
    };

    window.addEventListener('settings-sync', handleSettingsSync as EventListener);

    return () => {
      window.removeEventListener('settings-sync', handleSettingsSync as EventListener);
    };
  }, [isAuthenticated, user?.id]);

  // Save settings - localStorage only (DB schema pending update)
  const setBattleFxMode = useCallback(async (mode: BattleFxPerformanceMode) => {
    try {
      setBattleFxModeState(mode);
      localStorage.setItem(STORAGE_KEY, mode);
      console.log('[PerformanceSettings] Saved to localStorage:', mode);
    } catch (e) {
      console.error('[PerformanceSettings] Save error:', e);
    }
  }, []);

  return {
    battleFxMode,
    setBattleFxMode,
    isBattleFxEnabled: true, // Always enabled, just different quality levels
    isLoading
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
