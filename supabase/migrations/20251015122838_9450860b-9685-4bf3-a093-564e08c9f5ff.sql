-- © 2025 Joseph MULÉ – M1SSION™ – Supabase Health RPC (Corrected Tables)
-- Fix table references: norah_events instead of ai_events, norah_memory_episodes instead of ai_memories_user

create or replace function public.supabase_client_health()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'timestamp', now(),
    'ai_docs_count', coalesce((select count(*)::int from public.ai_docs), 0),
    'ai_embeddings_count', coalesce((select count(*)::int from public.ai_docs_embeddings), 0),
    'ai_sessions_count', coalesce((select count(*)::int from public.ai_sessions), 0),
    'ai_events_count', coalesce((select count(*)::int from public.norah_events), 0),
    'ai_memories_count', coalesce((select count(*)::int from public.norah_memory_episodes), 0)
  );
$$;

-- Grant remains the same
grant execute on function public.supabase_client_health() to anon, authenticated;