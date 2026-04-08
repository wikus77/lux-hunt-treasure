/**
 * Parse server `progress` for Sheep Herd (no rule logic — display + sim only).
 * © 2025 Joseph MULÉ – M1SSION™
 */

import type { SheepHerdGameParams } from './sheepHerdTypes';

export function parseSheepHerdParams(raw: unknown): SheepHerdGameParams | null {
  if (raw == null || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const seed = typeof p.seed === 'string' ? p.seed : '';
  const week_index = typeof p.week_index === 'number' ? p.week_index : Number(p.week_index);
  const time_limit_sec = typeof p.time_limit_sec === 'number' ? p.time_limit_sec : Number(p.time_limit_sec);
  const sheep_total = typeof p.sheep_total === 'number' ? p.sheep_total : Number(p.sheep_total);
  const required_in_pen = typeof p.required_in_pen === 'number' ? p.required_in_pen : Number(p.required_in_pen);
  const max_lost = typeof p.max_lost === 'number' ? p.max_lost : Number(p.max_lost);
  const scare_radius_mul = typeof p.scare_radius_mul === 'number' ? p.scare_radius_mul : Number(p.scare_radius_mul);
  const pen_radius_mul = typeof p.pen_radius_mul === 'number' ? p.pen_radius_mul : Number(p.pen_radius_mul);
  const sheep_speed_mul = typeof p.sheep_speed_mul === 'number' ? p.sheep_speed_mul : Number(p.sheep_speed_mul);

  if (!seed || !Number.isFinite(week_index) || !Number.isFinite(time_limit_sec)) return null;
  if (!Number.isFinite(sheep_total) || sheep_total < 1 || sheep_total > 24) return null;
  if (!Number.isFinite(required_in_pen) || !Number.isFinite(max_lost)) return null;
  if (!Number.isFinite(scare_radius_mul) || !Number.isFinite(pen_radius_mul) || !Number.isFinite(sheep_speed_mul)) return null;

  return {
    seed,
    week_index,
    difficulty_level: typeof p.difficulty_level === 'string' ? p.difficulty_level : undefined,
    time_limit_sec,
    sheep_total,
    required_in_pen,
    max_lost,
    scare_radius_mul,
    pen_radius_mul,
    sheep_speed_mul,
  };
}
