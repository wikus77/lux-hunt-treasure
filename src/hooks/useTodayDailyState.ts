/**
 * useTodayDailyState — M1SSION DAILY CONTROL LOOP™ (Phase 1 minimal)
 * Aggregates commit, streak, and daily mission state for unified daily checklist.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useDailyEngineV2 } from '@/missions/dailyEngineV2/useDailyEngineV2';
import { supabase } from '@/integrations/supabase/client';
import { DAILY_ENGINE_V2_ENABLED } from '@/config/featureFlags';

const BONUS_STORAGE_PREFIX = 'm1_dcl_bonus_claimed_';
const DAILY_BONUS_M1U_AMOUNT = 10;

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getBonusStorageKey(userId: string): string {
  return `${BONUS_STORAGE_PREFIX}${userId}_${getTodayKey()}`;
}

export interface TodayDailyState {
  commit_done: boolean;
  streak_done: boolean;
  daily_mission_done: boolean;
  daily_completion_count: number;
  daily_bonus_claimed: boolean;
  can_claim_daily_bonus: boolean;
  /** Days this week (Mon–Sun) with 3/3 claimed. */
  weeklyClaimCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
  markBonusClaimed: () => void;
}

export function useTodayDailyState(): TodayDailyState {
  const { user } = useUnifiedAuth();
  const { run, refetch: refetchDailyMission } = useDailyEngineV2();

  const [commit_done, setCommitDone] = useState(false);
  const [streak_done, setStreakDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [daily_bonus_claimed, setDailyBonusClaimed] = useState(false);
  const [weeklyClaimCount, setWeeklyClaimCount] = useState(0);

  const daily_mission_done =
    DAILY_ENGINE_V2_ENABLED &&
    (run?.phase === 3 && run?.status === 'completed');

  const daily_completion_count =
    (commit_done ? 1 : 0) + (streak_done ? 1 : 0) + (daily_mission_done ? 1 : 0);

  const can_claim_daily_bonus = daily_completion_count === 3 && !daily_bonus_claimed;

  const fetchCommitAndStreak = useCallback(async () => {
    if (!user) {
      setCommitDone(false);
      setStreakDone(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const today = getTodayKey();

    try {
      const [commitRes, profileRes] = await Promise.all([
        supabase.rpc('check_commit_ritual_status'),
        supabase
          .from('profiles')
          .select('last_check_in_date')
          .eq('id', user.id)
          .single(),
      ]);

      setCommitDone(!!commitRes.data?.already_done_today);
      const lastCheckIn =
        (profileRes.data as { last_check_in_date?: string } | null)
          ?.last_check_in_date ?? null;
      setStreakDone(lastCheckIn === today);
    } catch {
      setCommitDone(false);
      setStreakDone(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchBonusClaimed = useCallback(async () => {
    if (!user) {
      setDailyBonusClaimed(false);
      return;
    }
    try {
      const { data } = await supabase.rpc('get_daily_control_loop_bonus_claimed');
      const claimed = (data as { claimed?: boolean } | null)?.claimed === true;
      setDailyBonusClaimed(claimed);
    } catch {
      try {
        const key = getBonusStorageKey(user.id);
        setDailyBonusClaimed(localStorage.getItem(key) === '1');
      } catch {
        setDailyBonusClaimed(false);
      }
    }
  }, [user?.id]);

  const fetchWeeklyProgress = useCallback(async () => {
    if (!user) {
      setWeeklyClaimCount(0);
      return;
    }
    try {
      const { data } = await supabase.rpc('get_daily_control_loop_weekly_progress');
      const count = (data as { count?: number } | null)?.count ?? 0;
      setWeeklyClaimCount(count);
    } catch {
      setWeeklyClaimCount(0);
    }
  }, [user?.id]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchCommitAndStreak(), refetchDailyMission(), fetchBonusClaimed(), fetchWeeklyProgress()]);
  }, [fetchCommitAndStreak, refetchDailyMission, fetchBonusClaimed, fetchWeeklyProgress]);

  useEffect(() => {
    fetchCommitAndStreak();
  }, [fetchCommitAndStreak]);

  useEffect(() => {
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchCommitAndStreak();
      }
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchCommitAndStreak]);

  useEffect(() => {
    fetchBonusClaimed();
  }, [fetchBonusClaimed]);

  useEffect(() => {
    fetchWeeklyProgress();
  }, [fetchWeeklyProgress]);

  const markBonusClaimed = useCallback(() => {
    setDailyBonusClaimed(true);
    if (!user) return;
    try {
      localStorage.setItem(getBonusStorageKey(user.id), '1');
    } catch {
      // ignore
    }
  }, [user?.id]);

  return {
    commit_done,
    streak_done,
    daily_mission_done,
    daily_completion_count,
    daily_bonus_claimed,
    can_claim_daily_bonus,
    weeklyClaimCount,
    loading,
    refetch,
    markBonusClaimed,
  };
}

export { DAILY_BONUS_M1U_AMOUNT };
