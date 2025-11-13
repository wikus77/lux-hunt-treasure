// © 2025 Joseph MULÉ – M1SSION™ – Custom RPC Function Types
// Extension to Supabase types for custom RPC functions

export interface RpcFunctions {
  supabase_client_health: {
    Args: Record<string, never>;
    Returns: {
      timestamp: string;
      ai_docs_count: number;
      ai_embeddings_count: number;
      ai_sessions_count: number;
      ai_events_count: number;
      ai_memories_count: number;
    };
  };
  get_agent_dna_visual: {
    Args: { user_id: string };
    Returns: {
      dna: {
        intuito: number;
        audacia: number;
        etica: number;
        rischio: number;
        vibrazione: number;
      };
      targets: {
        ETICA: { x: number; y: number; z: number };
        INTUITO: { x: number; y: number; z: number };
        AUDACIA: { x: number; y: number; z: number };
        VIBRAZIONE: { x: number; y: number; z: number };
        RISCHIO: { x: number; y: number; z: number };
      };
      seed: string;
    };
  };
  has_role: {
    Args: { _user_id: string; _role: 'admin' | 'moderator' | 'agent' };
    Returns: boolean;
  };
  current_user_role: {
    Args: Record<string, never>;
    Returns: 'admin' | 'moderator' | 'agent' | null;
  };
  log_admin_action: {
    Args: {
      _action: string;
      _target_user_id?: string;
      _target_table?: string;
      _details?: Record<string, any>;
    };
    Returns: string;
  };
  audit_battle: {
    Args: { p_battle_id: string };
    Returns: {
      battle_id: string;
      status: string;
      creator_id: string;
      opponent_id?: string;
      winner_id?: string;
      stake_type: string;
      stake_amount: number;
      created_at: string;
      resolved_at?: string;
      rng_seed?: string;
      rng_check: 'ok' | 'mismatch' | 'missing';
      ledger_check: 'ok' | 'incomplete' | 'mismatch';
      audit_log_entries: any[];
      transfers: any[];
      participants: any[];
      tamper_flags: string[];
      audit_summary: {
        total_audit_entries: number;
        total_transfers: number;
        flags_count: number;
        is_clean: boolean;
      };
    };
  };
  flag_battle_suspicious: {
    Args: {
      p_battle_id: string;
      p_reason: string;
    };
    Returns: {
      success: boolean;
      error?: string;
      battle_id?: string;
      action?: string;
      reason?: string;
    };
  };
}
