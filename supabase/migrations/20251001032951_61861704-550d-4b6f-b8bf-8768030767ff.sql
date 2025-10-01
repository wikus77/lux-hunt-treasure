-- © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Support Tables (ADDITIVE ONLY - FIXED)
-- Optional tables for AI Analyst session tracking and message history

-- 1) Intel Sessions (optional telemetry)
create table if not exists public.intel_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  meta jsonb default '{}'::jsonb
);

-- 2) Intel Messages (optional server-side history)
create table if not exists public.intel_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.intel_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','analyst')),
  content text not null,
  created_at timestamptz not null default now()
);

-- 3) Enable RLS
alter table public.intel_sessions enable row level security;
alter table public.intel_messages enable row level security;

-- 4) RLS Policies - users see only their own data
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'intel_sessions' and policyname = 'intel_sessions_self'
  ) then
    create policy intel_sessions_self on public.intel_sessions
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'intel_messages' and policyname = 'intel_messages_self'
  ) then
    create policy intel_messages_self on public.intel_messages
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- 5) Optional read-only view for user clues (if needed)
-- NOTE: This is a placeholder - the AI analyst currently works locally without DB queries
create or replace view public.v_user_intel_clues as
select 
  c.id,
  c.title,
  c.description,
  c.created_at
from public.clues c
where exists (
  select 1 from public.user_clues uc 
  where uc.clue_id = c.id and uc.user_id = auth.uid()
);

-- Grant select on view
grant select on public.v_user_intel_clues to authenticated;