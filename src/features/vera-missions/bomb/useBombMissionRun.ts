/**
 * VERA MISSION: BOMBA - RPC Hook
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

function getTodayDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface StartRunError {
  code?: string;
  message: string;
  details?: string;
}

function toStartError(err: unknown): StartRunError {
  const e = err as { message?: string; code?: string; details?: string; hint?: string };
  const message = e?.message || (err instanceof Error ? err.message : null);
  const code = e?.code;
  const details = e?.details || e?.hint || '';
  if (!message && !code) {
    return { message: 'Impossibile avviare missione. Riprova.', details: String(err) };
  }
  if (code === '42883' || (message && /function.*does not exist/i.test(message))) {
    return { code: 'RPC_NOT_FOUND', message: 'Funzione missione non disponibile. Applica la migration Supabase.', details };
  }
  if (code === '42501' || (message && /permission denied/i.test(message))) {
    return { code: 'PERMISSION_DENIED', message: 'Permessi insufficienti. Controlla RLS.', details };
  }
  return { code: code as string, message: message || 'Impossibile avviare missione. Riprova.', details };
}

export interface StartRunResult {
  ok: boolean;
  runId?: string;
  dayKey?: string;
  expiresAt?: string;
  attemptsLeft?: number;
  status?: string;
  error?: StartRunError;
}

export interface FinalizeResult {
  success: boolean;
  deltaPe?: number;
  oldPe?: number;
  newPe?: number;
  runStatus?: string;
  alreadyFinalized?: boolean;
  error?: string;
}

export function useBombMissionRun() {
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const inFlightRef = useRef(false);

  const startRun = useCallback(async (): Promise<StartRunResult> => {
    if (!user?.id) {
      return { ok: false, error: { code: 'NOT_AUTHENTICATED', message: 'Utente non autenticato' } };
    }
    if (inFlightRef.current) {
      return { ok: false, error: { code: 'IN_FLIGHT', message: 'Operazione in corso' } };
    }
    inFlightRef.current = true;
    setIsStarting(true);
    try {
      const { data, error } = await supabase.rpc('start_vera_mission_run', { p_mission_id: 'bomb' });
      if (error) {
        const errObj = toStartError(error);
        console.error('[VERA_BOMB][START][RPC_ERROR]', { message: error.message, code: (error as any).code, details: (error as any).details, hint: (error as any).hint });
        return { ok: false, error: errObj };
      }
      const res = typeof data === 'string' ? JSON.parse(data) : data;
      if (res?.error) {
        return { ok: false, error: { message: String(res.error), details: res.details } };
      }
      const runId = res?.run_id;
      const status = res?.status;
      if (!runId) {
        return { ok: false, error: { message: 'Risposta RPC incompleta. Riprova.' } };
      }
      if (status === 'completed' || status === 'failed') {
        console.log('[VERA_BOMB][START][ALREADY_PLAYED_TODAY]', { runId, status });
        return {
          ok: false,
          error: {
            code: 'ALREADY_PLAYED_TODAY',
            message: 'Missione già completata oggi. Torna domani.',
          },
        };
      }
      return {
        ok: true,
        runId,
        dayKey: res.day_key,
        expiresAt: res.expires_at,
        attemptsLeft: res.attempts_left ?? 1,
        status: res.status ?? 'active',
      };
    } catch (err: unknown) {
      const errObj = toStartError(err);
      console.error('[VERA_BOMB][START][CATCH]', err, errObj);
      return { ok: false, error: errObj };
    } finally {
      inFlightRef.current = false;
      setIsStarting(false);
    }
  }, [user?.id]);

  const finalizeRun = useCallback(
    async (
      runId: string,
      outcome: 'success' | 'fail',
      elapsedMs: number,
      payload?: Record<string, unknown>
    ): Promise<FinalizeResult | null> => {
      if (!user?.id) return null;
      setIsFinalizing(true);
      try {
        const { data, error } = await supabase.rpc('finalize_vera_mission_run', {
          p_run_id: runId,
          p_outcome: outcome,
          p_elapsed_ms: Math.min(elapsedMs, 60_000),
          p_payload: payload ?? {},
        });
        if (error) throw error;
        const res = typeof data === 'string' ? JSON.parse(data) : data;
        if (!res?.success && res?.error) {
          return { success: false, error: res.error };
        }
        if (res.success && res.delta_pe !== undefined) {
          window.dispatchEvent(
            new CustomEvent('pe:awarded', {
              detail: {
                success: true,
                oldPE: res.old_pe,
                newPE: res.new_pe,
                deltaPE: res.delta_pe,
                action: 'VERA_MISSION_BOMB',
              },
            })
          );
          if (res.delta_pe > 0) {
            const { emitPECreditEvent } = await import('@/features/pulse/peCreditEvent');
            emitPECreditEvent(res.delta_pe, 'vera_bomb', {
              preValue: res.old_pe,
              postValue: res.new_pe,
            });
          }
        }
        return {
          success: res.success ?? false,
          deltaPe: res.delta_pe,
          oldPe: res.old_pe,
          newPe: res.new_pe,
          runStatus: res.run_status,
          alreadyFinalized: res.already_finalized,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: msg };
      } finally {
        setIsFinalizing(false);
      }
    },
    [user?.id]
  );

  return { startRun, finalizeRun, isStarting, isFinalizing };
}

/**
 * Check if user has completed VERA BOMB today (for badge "DONE")
 * Refetches on 'vera_bomb:completed' event (dispatched when mission ends)
 */
export function useVeraBombCompletedToday(): { completedToday: boolean; loading: boolean } {
  const { user } = useAuth();
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCompleted = useCallback(() => {
    if (!user?.id) return;
    const dayKey = getTodayDayKey();
    supabase
      .from('vera_mission_runs')
      .select('id')
      .eq('user_id', user.id)
      .eq('mission_id', 'bomb')
      .eq('day_key', dayKey)
      .in('status', ['completed', 'failed'])
      .maybeSingle()
      .then(({ data, error }) => {
        setCompletedToday(!!data);
        if (error) console.warn('[VERA_BOMB][CHECK_COMPLETED]', error.message);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setCompletedToday(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchCompleted();
    const handler = () => fetchCompleted();
    window.addEventListener('vera_bomb:completed', handler);
    return () => window.removeEventListener('vera_bomb:completed', handler);
  }, [user?.id, fetchCompleted]);

  return { completedToday, loading };
}
