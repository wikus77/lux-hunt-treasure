/**
 * useDailyEngineV2 — Phase 1 Core Engine MVP
 * Server-driven daily mission: today's mission + run state from server.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchDailyMissionToday } from '../serverReal/dailyMissionToday';

export interface DailyRunState {
  phase: number;
  status: string;
  progress_json: Record<string, unknown> | null;
}

/** Phase 3: retention from server. */
export interface DailyEngineRetention {
  streak: number;
  weekStart: string;
  weeklyCompletion: boolean[];
  agentStatus: 'ACTIVE' | 'INACTIVE';
  sundayRewardAvailable: boolean;
  sundayRewardDayKey: string | null;
}

export interface DailyEngineV2State {
  dayKey: string | null;
  missionId: string | null;
  /** Phase 2: template archetype for display (e.g. intelligence, skill). */
  templateKey: string | null;
  /** Optional: from daily-mission-today when server sends it (pilot / future). */
  gameType: string | null;
  run: DailyRunState | null;
  /** Phase 3: retention (streak, weekly, agent, Sunday). */
  retention: DailyEngineRetention | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDailyEngineV2(): DailyEngineV2State {
  const { user } = useUnifiedAuth();
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [gameType, setGameType] = useState<string | null>(null);
  const [run, setRun] = useState<DailyRunState | null>(null);
  const [retention, setRetention] = useState<DailyEngineRetention | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setDayKey(null);
      setMissionId(null);
      setTemplateKey(null);
      setGameType(null);
      setRun(null);
      setRetention(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDailyMissionToday();
      if (!res.ok || res.day_key == null || res.mission_id == null) {
        setDayKey(null);
        setMissionId(null);
        setTemplateKey(null);
        setGameType(null);
        setRun(null);
        setRetention(null);
        setError(res.error ?? 'fetch_failed');
        setLoading(false);
        return;
      }
      setDayKey(res.day_key);
      setMissionId(res.mission_id);
      setTemplateKey(res.template_key ?? null);
      setGameType(res.game_type ?? null);
      if (res.retention) {
        setRetention({
          streak: res.retention.streak,
          weekStart: res.retention.week_start,
          weeklyCompletion: res.retention.weekly_completion ?? [],
          agentStatus: res.retention.agent_status,
          sundayRewardAvailable: res.retention.sunday_reward_available ?? false,
          sundayRewardDayKey: res.retention.sunday_reward_day_key ?? null,
        });
      } else {
        setRetention(null);
      }

      const { data: runRow, error: runErr } = await supabase
        .from('daily_mission_runs')
        .select('phase, status, progress_json')
        .eq('user_id', user.id)
        .eq('day_key', res.day_key)
        .eq('mission_id', res.mission_id)
        .maybeSingle();

      if (runErr) {
        setRun(null);
        setError(runErr.message);
      } else if (runRow) {
        setRun({
          phase: runRow.phase ?? 0,
          status: runRow.status ?? 'active',
          progress_json: runRow.progress_json ?? null,
        });
      } else {
        setRun(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      refetch();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refetch]);

  return { dayKey, missionId, templateKey, gameType, run, retention, loading, error, refetch };
}
