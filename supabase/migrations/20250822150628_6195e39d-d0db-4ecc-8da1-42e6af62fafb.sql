-- Create push_tokens table for FCM
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  token text not null,
  platform text not null default 'web',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create unique index
create unique index if not exists push_tokens_user_token_idx on public.push_tokens(user_id, token);

-- Enable RLS
alter table public.push_tokens enable row level security;

-- Create policies
create policy "allow anon insert" on public.push_tokens
  for insert to anon with check (true);

create policy "allow anon select own" on public.push_tokens
  for select to anon using (true);