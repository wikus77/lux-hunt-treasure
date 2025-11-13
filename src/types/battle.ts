// Battle System Types - TRON BATTLE (CANONICAL)
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

// TRON Battle statuses
export type BattleStatus = 'pending' | 'accepted' | 'ready' | 'countdown' | 'active' | 'resolved' | 'cancelled' | 'expired';
export type BattleRole = 'creator' | 'opponent';
export type StakeType = 'buzz' | 'clue' | 'energy';

// Main TRON Battle interface (maps to public.battles)
export interface Battle {
  id: string;
  status: BattleStatus;
  arena_name?: string;
  arena_lat?: number;
  arena_lng?: number;
  stake_type: StakeType;
  stake_amount: number;
  stake_percentage: number;
  creator_id: string;
  opponent_id?: string;
  created_at: string;
  accepted_at?: string;
  countdown_start_at?: string;
  flash_at?: string;
  resolved_at?: string;
  expires_at: string;
  winner_id?: string;
  creator_tap_at?: string;
  opponent_tap_at?: string;
  creator_reaction_ms?: number;
  opponent_reaction_ms?: number;
  creator_ping_ms?: number;
  opponent_ping_ms?: number;
  server_compensation_ms?: number;
  creator_ghost_until?: string;
  opponent_ghost_until?: string;
  metadata?: Record<string, any>;
}

// Legacy alias for backwards compatibility (maps to Battle)
export type BattleSession = Battle;

// Battle Participants (maps to public.battle_participants)
export interface BattleParticipant {
  id: string;
  battle_id: string;
  user_id: string;
  role: BattleRole;
  tap_timestamp?: string;
  reaction_ms?: number;
  ping_ms?: number;
  is_winner: boolean;
  created_at: string;
}

// Battle Transfers (maps to public.battle_transfers)
export interface BattleTransfer {
  id: string;
  battle_id: string;
  from_user_id: string;
  to_user_id: string;
  transfer_type: StakeType;
  amount: number;
  created_at: string;
  metadata?: Record<string, any>;
}

// Battle Audit Log (maps to public.battle_audit)
export interface BattleAudit {
  id: string;
  battle_id: string;
  event_type: string;
  user_id?: string;
  timestamp: string;
  payload: Record<string, any>;
  rng_seed?: string; // Phase 7: RNG seed tracking
}

// Battle Energy Traces (maps to public.battle_energy_traces)
export interface BattleEnergyTrace {
  id: string;
  battle_id: string;
  winner_id: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  intensity: number;
  created_at: string;
  expires_at: string;
}

// Phase 7: Battle Audit Report (from RPC audit_battle)
export interface BattleAuditReport {
  battle_id: string;
  status: BattleStatus;
  creator_id: string;
  opponent_id?: string;
  winner_id?: string;
  rng_seed?: string;
  rng_check: 'ok' | 'mismatch' | 'missing';
  ledger_check: 'ok' | 'incomplete' | 'mismatch';
  audit_log_entries: BattleAudit[];
  transfers: BattleTransfer[];
  participants: BattleParticipant[];
  tamper_flags: string[];
  metadata?: Record<string, any>;
}

// Legacy types for backwards compatibility with Phase 1/2 code
export interface StartBattleResponse {
  success: boolean;
  session_id?: string;
  battle_id?: string;
  expires_at?: string;
  message?: string;
  error?: string;
}

export interface MyBattle {
  session_id: string;
  battle_id?: string;
  role: BattleRole;
  opponent_id?: string;
  status: BattleStatus;
  created_at: string;
  expires_at: string;
  resolved_at?: string;
  winner_id?: string;
}

export interface MyCooldown {
  cooldown_key: string;
  until_ts: string;
  seconds_remaining: number;
}

export interface WeaponCatalogItem {
  weapon_key: string;
  key?: string;
  name: string;
  description?: string;
  power: number;
  m1u_cost?: number;
  cost?: number;
  cooldown_sec: number;
  effect_key: string;
  min_rank: number;
}

// Realtime Event Types
export interface BattleRealtimeEvent {
  type: 'attack_started' | 'defense_registered' | 'resolved';
  session_id: string;
  payload: Record<string, any>;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
