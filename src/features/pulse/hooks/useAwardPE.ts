/**
 * THE PULSE™ — Award PE Hook (PER UTENTE)
 * Hook per assegnare Pulse Energy all'utente corrente
 * Utilizza la funzione database award_pulse_energy con auto-rank-up
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { emitPECreditEvent } from '@/features/pulse/peCreditEvent';

// ============================================================================
// TIPI DI AZIONI CHE GENERANO PE
// ============================================================================

export type PEActionType = 
  | 'BUZZ_CLICK'           // Tasto Buzz
  | 'BUZZ_MAP_CLICK'       // Tasto Buzz Map
  | 'PULSE_BREAKER_WIN'    // Vittoria Pulse Breaker
  | 'PULSE_BREAKER_PLAY'   // Partecipazione Pulse Breaker
  | 'FORTUNE_WHEEL'        // Ruota della Fortuna (variabile)
  | 'AION_CHAT'            // Conversazione AION
  | 'FORUM_POST'           // Nuovo post forum
  | 'FORUM_COMMENT'        // Commento forum
  | 'MAP_TIME_240S'        // 4 minuti in mappa
  | 'MAP_TIME_600S'        // 10 minuti in mappa
  | 'MARKER_CLAIM'         // Riscatto marker reward
  | 'BATTLE_WIN'           // Vittoria Tron Battle
  | 'BATTLE_LOSE'          // Sconfitta Tron Battle
  | 'COUNTRY_CONQUEST'     // Conquista paese Risiko
  | 'DAILY_LOGIN'          // Login giornaliero
  | 'DAILY_MISSION'        // Missione giornaliera
  | 'REFERRAL_SIGNUP'      // Nuovo referral registrato
  | 'FINAL_SHOOT_WIN'      // Vittoria Final Shoot
  | 'CUSTOM';              // Valore custom

// ============================================================================
// CONFIGURAZIONE PE PER AZIONE (valori di default)
// ============================================================================

export const PE_VALUES: Record<Exclude<PEActionType, 'CUSTOM' | 'FORTUNE_WHEEL'>, number> = {
  BUZZ_CLICK: 10,
  BUZZ_MAP_CLICK: 15,
  PULSE_BREAKER_WIN: 10,    // Vittoria Pulse Breaker
  PULSE_BREAKER_PLAY: 5,    // Partecipazione Pulse Breaker
  AION_CHAT: 20,
  FORUM_POST: 25,
  FORUM_COMMENT: 10,
  MAP_TIME_240S: 15,        // 4 minuti in mappa
  MAP_TIME_600S: 30,        // 10 minuti in mappa (bonus)
  MARKER_CLAIM: 100,
  BATTLE_WIN: 50,           // Vittoria Tron Battle
  BATTLE_LOSE: -100,        // Sconfitta Tron Battle
  COUNTRY_CONQUEST: 1000,
  DAILY_LOGIN: 10,
  DAILY_MISSION: 50,
  REFERRAL_SIGNUP: 200,
  FINAL_SHOOT_WIN: 150,
};

// ============================================================================
// LIMITI GIORNALIERI PER AZIONE (anti-abuse)
// ============================================================================

export const PE_DAILY_LIMITS: Partial<Record<PEActionType, number>> = {
  BUZZ_CLICK: 5,
  BUZZ_MAP_CLICK: 3,
  PULSE_BREAKER_WIN: 10,
  PULSE_BREAKER_PLAY: 10,
  AION_CHAT: 3,
  FORUM_POST: 5,
  FORUM_COMMENT: 10,
  MAP_TIME_240S: 1,
  MAP_TIME_600S: 1,
  DAILY_LOGIN: 1,
  DAILY_MISSION: 1,
  // No limit for: MARKER_CLAIM, BATTLE_WIN, BATTLE_LOSE, COUNTRY_CONQUEST, REFERRAL_SIGNUP, FINAL_SHOOT_WIN
};

// ============================================================================
// INTERFACCE
// ============================================================================

export interface AwardPEResult {
  success: boolean;
  oldPE?: number;
  newPE?: number;
  deltaPE?: number;
  rankChanged?: boolean;
  oldRankId?: number;
  newRankId?: number;
  error?: string;
  limitReached?: boolean;
}

export interface UseAwardPEReturn {
  awardPE: (
    action: PEActionType, 
    customAmount?: number, 
    metadata?: Record<string, unknown>
  ) => Promise<AwardPEResult>;
  isAwarding: boolean;
  lastAward: AwardPEResult | null;
}

// ============================================================================
// HOOK PRINCIPALE
// ============================================================================

export const useAwardPE = (): UseAwardPEReturn => {
  const { user } = useAuth();
  const [isAwarding, setIsAwarding] = useState(false);
  const [lastAward, setLastAward] = useState<AwardPEResult | null>(null);

  const awardPE = useCallback(async (
    action: PEActionType,
    customAmount?: number,
    metadata: Record<string, unknown> = {}
  ): Promise<AwardPEResult> => {
    // 🛡️ GUARD: Non autenticato
    if (!user?.id) {
      console.log('[PE] Award skipped - user not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    setIsAwarding(true);
    if (typeof console !== 'undefined') console.log('[PE-TRACE-AWARD] ENTRY', { action });

    try {
      // Determina l'importo PE
      let peAmount: number;
      if (action === 'CUSTOM' || action === 'FORTUNE_WHEEL') {
        if (customAmount === undefined) {
          console.error('[PE] CUSTOM/FORTUNE_WHEEL action requires customAmount');
          return { success: false, error: 'Custom amount required' };
        }
        peAmount = customAmount;
      } else {
        peAmount = PE_VALUES[action];
      }

      console.log(`[PE] 🎯 Awarding ${peAmount} PE for action: ${action}`, { 
        userId: user.id, 
        metadata 
      });

      // Verifica limite giornaliero (se applicabile)
      const dailyLimit = PE_DAILY_LIMITS[action];
      if (dailyLimit !== undefined) {
        const { data: limitCheck, error: limitError } = await supabase
          .rpc('check_pe_daily_limit', {
            p_user_id: user.id,
            p_action_type: action,
            p_daily_limit: dailyLimit
          });

        if (limitError) {
          // Se la funzione non esiste ancora, logga e continua
          console.warn('[PE] ⚠️ Daily limit check failed (RPC may not exist yet):', limitError.message);
          // Continua senza check del limite per ora
        } else if (limitCheck && !limitCheck.can_award) {
          console.log(`[PE] ⏳ Daily limit reached for ${action}: ${limitCheck.current_count}/${dailyLimit}`);
          return { 
            success: false, 
            error: `Limite giornaliero raggiunto (${dailyLimit}/${dailyLimit})`,
            limitReached: true 
          };
        }
      }

      // Chiama la funzione database award_pulse_energy
      const { data, error } = await supabase.rpc('award_pulse_energy', {
        p_user_id: user.id,
        p_delta_pe: peAmount,
        p_reason: action,
        p_metadata: { ...metadata, action, timestamp: new Date().toISOString() }
      });

      if (error) {
        console.error('[PE] ❌ RPC award_pulse_energy error:', error);
        return { success: false, error: error.message };
      }

      // Parse risultato (può essere JSON string o object)
      const result = typeof data === 'string' ? JSON.parse(data) : data;

      if (!result?.success) {
        console.error('[PE] ❌ Award failed:', result);
        return { success: false, error: result?.error || 'Award failed' };
      }

      // Registra l'azione nel log giornaliero (se ha limite). No .catch() — supabase.rpc() return may not be full Promise on iOS.
      if (dailyLimit !== undefined) {
        try {
          const { error: dailyErr } = await supabase.rpc('record_pe_daily_action', {
            p_user_id: user.id,
            p_action_type: action,
            p_pe_awarded: peAmount
          });
          if (dailyErr && import.meta.env.DEV) {
            console.warn('[PE] ⚠️ Failed to record daily action (RPC may not exist yet):', dailyErr.message);
          }
        } catch (_err) {
          if (import.meta.env.DEV) {
            console.warn('[PE] ⚠️ record_pe_daily_action exception:', _err instanceof Error ? _err.message : _err);
          }
        }
      }

      const awardResult: AwardPEResult = {
        success: true,
        oldPE: result.old_pe,
        newPE: result.new_pe,
        deltaPE: result.delta_pe,
        rankChanged: result.rank_changed,
        oldRankId: result.old_rank_id,
        newRankId: result.new_rank_id,
      };

      console.log(`[PE] ✅ Award successful:`, {
        action,
        oldPE: result.old_pe,
        newPE: result.new_pe,
        delta: result.delta_pe,
        rankChanged: result.rank_changed
      });

      setLastAward(awardResult);

      // Dispatch evento globale per aggiornare UI
      const delta = awardResult.deltaPE ?? (awardResult.newPE != null && awardResult.oldPE != null ? awardResult.newPE - awardResult.oldPE : 0);
      const limitReached = !!(awardResult as { limitReached?: boolean }).limitReached;
      const willEmit = typeof window !== 'undefined' && delta > 0;
      if (typeof console !== 'undefined') {
        console.log('[PE-TRACE-AWARD] RPC success', { action, delta, limitReached, willEmit });
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pe:awarded', {
          detail: { ...awardResult, action }
        }));
        // PE fullscreen reward overlay: only for positive delta
        if (delta > 0) {
          const source = action.toLowerCase().replace(/\s+/g, '_');
          if (typeof console !== 'undefined') console.log('[PE-TRACE-AWARD] calling emitPECreditEvent', { delta, source });
          emitPECreditEvent(delta, source, {
            preValue: awardResult.oldPE,
            postValue: awardResult.newPE,
          });
        }
      }

      return awardResult;

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? '');
      const name = err instanceof Error ? err.name : '';
      const stack = err instanceof Error ? err.stack : '';
      const cause = err instanceof Error && (err as Error & { cause?: unknown }).cause != null ? (err as Error & { cause?: unknown }).cause : undefined;
      const safeJson = (() => {
        try {
          if (err && typeof err === 'object' && Object.keys(err).length > 0) return JSON.stringify(err);
        } catch (_) {}
        return '';
      })();
      if (import.meta.env.DEV || msg || name || stack) {
        console.error('[PE] ❌ Exception:', msg || name || '(empty)', { name, stack: stack?.slice(0, 200), cause, raw: safeJson || (err != null ? String(err) : '') });
      }
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      };
    } finally {
      setIsAwarding(false);
    }
  }, [user?.id]);

  return {
    awardPE,
    isAwarding,
    lastAward
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

