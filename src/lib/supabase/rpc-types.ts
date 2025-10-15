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
}
