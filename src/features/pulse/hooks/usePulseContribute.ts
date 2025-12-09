/**
 * THE PULSE™ — Contribution Hook
 * Hook per inviare contribuzioni al Pulse con feedback visivo
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

// Tipi di contribuzione supportati (da pulse_config_weights)
export type PulseEventType = 
  | 'BUZZ_COMPLETED'
  | 'PORTAL_DISCOVERED'
  | 'DAILY_STREAK'
  | 'QR_SCAN_VERIFIED'
  | 'NORAH_STORY_BEAT'
  | 'MISSION_COMPLETED';

// Mapping peso → incremento visuale (per UI)
const EVENT_DISPLAY_INFO: Record<PulseEventType, { label: string; emoji: string }> = {
  BUZZ_COMPLETED: { label: 'Buzz completato!', emoji: '🎯' },
  PORTAL_DISCOVERED: { label: 'Portale scoperto!', emoji: '🌀' },
  DAILY_STREAK: { label: 'Login giornaliero!', emoji: '🔥' },
  QR_SCAN_VERIFIED: { label: 'QR verificato!', emoji: '📱' },
  NORAH_STORY_BEAT: { label: 'Interazione AION!', emoji: '🤖' },
  MISSION_COMPLETED: { label: 'Missione completata!', emoji: '🏆' },
};

export interface PulseContributionResult {
  success: boolean;
  accepted: boolean;
  newValue?: number;
  delta?: number;
  thresholdTriggered?: number | null;
  error?: string;
  displayInfo?: {
    label: string;
    emoji: string;
    deltaPercent: number;
  };
}

export interface UsePulseContributeReturn {
  contribute: (type: PulseEventType, meta?: Record<string, any>) => Promise<PulseContributionResult>;
  isContributing: boolean;
  lastContribution: PulseContributionResult | null;
}

export const usePulseContribute = (): UsePulseContributeReturn => {
  const { user } = useAuthContext();
  const [isContributing, setIsContributing] = useState(false);
  const [lastContribution, setLastContribution] = useState<PulseContributionResult | null>(null);

  const contribute = useCallback(async (
    type: PulseEventType,
    meta: Record<string, any> = {}
  ): Promise<PulseContributionResult> => {
    // 🛡️ GUARD: Non autenticato
    if (!user?.id) {
      console.log('[PULSE] Contribute skipped - user not authenticated');
      return { success: false, accepted: false, error: 'Not authenticated' };
    }

    setIsContributing(true);

    try {
      console.log(`[PULSE] Contributing: ${type}`, { userId: user.id, meta });

      // Aggiungi device hash per dedup (opzionale)
      const deviceHash = typeof window !== 'undefined' 
        ? btoa(navigator.userAgent + screen.width + screen.height).slice(0, 16)
        : undefined;

      const { data, error } = await supabase.rpc('rpc_pulse_event_record', {
        p_user_id: user.id,
        p_type: type,
        p_meta: { ...meta, device_hash: deviceHash }
      });

      if (error) {
        console.error('[PULSE] RPC error:', error);
        return { success: false, accepted: false, error: error.message };
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!result.accepted) {
        console.log('[PULSE] Contribution rejected:', result.error);
        return { 
          success: true, // RPC worked, but contribution was rejected (cooldown, cap, etc.)
          accepted: false, 
          error: result.error 
        };
      }

      const displayInfo = EVENT_DISPLAY_INFO[type];
      const contributionResult: PulseContributionResult = {
        success: true,
        accepted: true,
        newValue: result.new_value,
        delta: result.delta,
        thresholdTriggered: result.threshold_triggered,
        displayInfo: {
          label: displayInfo.label,
          emoji: displayInfo.emoji,
          deltaPercent: result.delta || 0
        }
      };

      console.log(`[PULSE] ✅ Contribution accepted:`, {
        type,
        newValue: result.new_value,
        delta: result.delta,
        threshold: result.threshold_triggered
      });

      setLastContribution(contributionResult);
      
      // Dispatch custom event per notificare altri componenti
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pulse:contributed', {
          detail: contributionResult
        }));
      }

      return contributionResult;

    } catch (err) {
      console.error('[PULSE] Exception:', err);
      return { 
        success: false, 
        accepted: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    } finally {
      setIsContributing(false);
    }
  }, [user?.id]);

  return {
    contribute,
    isContributing,
    lastContribution
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


