-- © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
-- FCM Push Tokens table with proper RLS policies

-- Create push_tokens table if not exists
create table if not exists public.push_tokens (
  user_id uuid,
  token text primary key,
  platform text not null default 'web',
  created_at timestamptz default now()
);

-- Create index for user lookup
create index if not exists idx_push_tokens_user on public.push_tokens(user_id);

-- Enable RLS
alter table public.push_tokens enable row level security;

-- Drop existing policies if they exist
drop policy if exists "insert own token" on public.push_tokens;
drop policy if exists "insert anonymous" on public.push_tokens;
drop policy if exists "anon can insert token" on public.push_tokens;

-- Policy: authenticated users can upsert their own token
create policy "insert own token"
on public.push_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: allow anonymous users to insert tokens (for testing)
create policy "insert anonymous"
on public.push_tokens
for insert
to anon
with check (user_id is null or user_id::text like 'anon:%');

-- Policy: users can view their own tokens
create policy "view own tokens"
on public.push_tokens
for select
to authenticated
using (auth.uid() = user_id);

-- Policy: allow upsert (update existing tokens)
create policy "update own token"
on public.push_tokens
for update
to authenticated
using (auth.uid() = user_id);

-- Policy: anonymous can view tokens they created
create policy "view anonymous tokens"
on public.push_tokens
for select
to anon
using (user_id is null or user_id::text like 'anon:%');