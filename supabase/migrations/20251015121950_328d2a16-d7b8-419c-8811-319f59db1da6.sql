-- © 2025 Joseph MULÉ – M1SSION™ – Supabase Health RPC (Read-Only)
-- Provides diagnostics for Norah AI / content counts

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
    'ai_events_count', coalesce((select count(*)::int from public.ai_events), 0),
    'ai_memories_count', coalesce((select count(*)::int from public.ai_memories_user), 0)
  );
$$;

-- Grant access to anon and authenticated users (read-only, no sensitive data)
grant execute on function public.supabase_client_health() to anon, authenticated;