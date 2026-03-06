/**
 * useMissionOfTheDay — Mission Cycle Engine (Opzione B), no dayOfYear
 * Fetches official mission_id + day_key from server; fallback deterministic by epochDay % cycle length.
 * © 2025 Joseph MULÉ – M1SSION™
 */

import { useState, useEffect, useCallback } from 'react';
import { MISSIONS_REGISTRY, type MissionDefinition } from './missionsRegistry';
import { getTodayKey } from './missionState';
import { fetchDailyMissionToday } from './serverReal/dailyMissionToday';

const CACHE_KEY = 'm1_daily_mission_today_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Must match server daily-mission-today MISSION_CYCLE (15 ids)
const MISSION_CYCLE: string[] = [
  'cipher_drill_anagram_v1',
  'word_duel_memory_v1',
  'signal_pattern_numbers_v1',
  'open_source_intel',
  'urban_riddle',
  'pulse_breaker_challenge',
  'signal_trace',
  'code_fragment',
  'area_observation_lite',
  'pattern_break',
  'chain_of_intel',
  'time_distortion',
  'false_signal',
  'shadow_zone',
  'cipher_decode',
  'memory_matrix',
  'word_puzzle',
];

function getEpochDay(dayKey: string): number {
  const t = new Date(dayKey + 'T00:00:00Z').getTime();
  return Math.floor(t / 86400000);
}

function getMissionIdFromDayKey(dayKey: string): string {
  const epochDay = getEpochDay(dayKey);
  const idx = epochDay % MISSION_CYCLE.length;
  const index = idx >= 0 ? idx : idx + MISSION_CYCLE.length;
  return MISSION_CYCLE[index];
}

function getMissionById(missionId: string): MissionDefinition | null {
  return MISSIONS_REGISTRY.find((m) => m.id === missionId) ?? null;
}

interface CacheEntry {
  day_key: string;
  mission_id: string;
  ts: number;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.day_key || !parsed?.mission_id) return null;
    if (Date.now() - (parsed.ts || 0) > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(day_key: string, mission_id: string): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ day_key, mission_id, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

export type MissionOfTheDaySource = 'server' | 'cache' | 'fallback';

export interface UseMissionOfTheDayResult {
  mission: MissionDefinition | null;
  dayKey: string | null;
  source: MissionOfTheDaySource | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMissionOfTheDay(): UseMissionOfTheDayResult {
  const [mission, setMission] = useState<MissionDefinition | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [source, setSource] = useState<MissionOfTheDaySource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cached = readCache();
    const localDayKey = getTodayKey();
    const fallbackMissionId = getMissionIdFromDayKey(localDayKey);
    const fallbackMission = getMissionById(fallbackMissionId);

    const res = await fetchDailyMissionToday();

    if (res.ok && res.day_key != null && res.mission_id != null) {
      writeCache(res.day_key, res.mission_id);
      const def = getMissionById(res.mission_id);
      setMission(def ?? fallbackMission);
      setDayKey(res.day_key);
      setSource('server');
      setLoading(false);
      return;
    }

    if (cached && cached.day_key === localDayKey) {
      const def = getMissionById(cached.mission_id);
      if (def) {
        setMission(def);
        setDayKey(cached.day_key);
        setSource('cache');
        setLoading(false);
        return;
      }
    }

    setMission(fallbackMission);
    setDayKey(localDayKey);
    setSource('fallback');
    setError(res.error || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return { mission, dayKey, source, loading, error, refetch: run };
}
