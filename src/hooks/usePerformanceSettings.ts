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

        if (isAuthenticated && user?.id) {
          // Try loading from user_settings table (with type casting)
          // Use maybeSingle() to avoid errors when table doesn't exist or no row
          const { data, error } = await supabase
            .from('user_settings' as any)
            .select('preferences')
            .eq('user_id', user.id)
            .maybeSingle();

          // Silently handle all errors - fallback to localStorage
          if (error) {
            // No console output - localStorage fallback is fine
            return;
          }

          if (!error && data) {
            const settingsData = data as any;
            const prefs = settingsData?.preferences as any;
            const savedMode = prefs?.battle?.fxMode as BattleFxPerformanceMode | undefined;
            
            if (savedMode === 'high' || savedMode === 'low') {
              setBattleFxModeState(savedMode);
              console.log('[PerformanceSettings] Loaded from DB:', savedMode);
            }
          }
        }
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

  // Save settings
  const setBattleFxMode = useCallback(async (mode: BattleFxPerformanceMode) => {
    try {
      setBattleFxModeState(mode);

      if (isAuthenticated && user?.id) {
        // Save to user_settings table (with type casting)
        const { data: existing } = await supabase
          .from('user_settings' as any)
          .select('preferences')
          .eq('user_id', user.id)
          .single();

        const existingData = existing as any;
        const currentPrefs = (existingData?.preferences as any) || {};
        const updatedPrefs = {
          ...currentPrefs,
          battle: {
            ...(currentPrefs.battle || {}),
            fxMode: mode
          }
        };

        const { error } = await supabase
          .from('user_settings' as any)
          .upsert({
            user_id: user.id,
            preferences: updatedPrefs
          } as any);

        if (error) throw error;

        console.log('[PerformanceSettings] Saved to DB:', mode);
      } else {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY, mode);
        console.log('[PerformanceSettings] Saved to localStorage:', mode);
      }
    } catch (e) {
      console.error('[PerformanceSettings] Save error:', e);
      // Still update local state even if save fails
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [isAuthenticated, user?.id]);

  return {
    battleFxMode,
    setBattleFxMode,
    isBattleFxEnabled: true, // Always enabled, just different quality levels
    isLoading
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
