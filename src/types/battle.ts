// Battle System Types - FASE 1
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

export type BattleStatus = 'await_defense' | 'resolved' | 'cancelled';
export type BattleRole = 'attacker' | 'defender';
export type BattleActionType = 'attack' | 'defend';
export type ArsenalItemType = 'weapon' | 'defense' | 'stealth';

export interface BattleSession {
  id: string;
  attacker_id: string;
  defender_id: string;
  status: BattleStatus;
  started_at: string;
  expires_at: string;
  ended_at?: string;
  winner_id?: string;
  weapon_key: string;
  defense_key?: string;
  audit_seed_hash?: string;
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BattleAction {
  id: string;
  session_id: string;
  user_id: string;
  role: BattleRole;
  action_type: BattleActionType;
  item_key: string;
  energy_cost_m1u: number;
  nonce: string;
  result?: Record<string, any>;
  created_at: string;
}

export interface UserArsenal {
  id: string;
  user_id: string;
  item_type: ArsenalItemType;
  item_key: string;
  quantity: number;
  acquired_at: string;
  updated_at: string;
}

export interface WeaponCatalog {
  id: string;
  key: string;
  name: string;
  description?: string;
  power: number;
  m1u_cost: number;
  cooldown_sec: number;
  effect_key: string;
  min_rank: number;
  enabled: boolean;
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface UserCooldown {
  id: string;
  user_id: string;
  cooldown_key: string;
  until_ts: string;
  created_at: string;
}

// RPC Response Types
export interface StartBattleResponse {
  success: boolean;
  session_id?: string;
  expires_at?: string;
  effect_key?: string;
  weapon_name?: string;
  defender_id?: string;
  message?: string;
  error?: string;
  error_code?: string;
}

export interface MyBattle {
  session_id: string;
  role: BattleRole;
  opponent_id: string;
  status: BattleStatus;
  weapon_key: string;
  defense_key?: string;
  started_at: string;
  expires_at: string;
  ended_at?: string;
  winner_id?: string;
}

export interface MyCooldown {
  cooldown_key: string;
  until_ts: string;
  seconds_remaining: number;
}

export interface WeaponCatalogItem {
  weapon_key: string;
  name: string;
  description?: string;
  power: number;
  m1u_cost: number;
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
