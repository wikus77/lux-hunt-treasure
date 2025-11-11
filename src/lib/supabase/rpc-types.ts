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
}
