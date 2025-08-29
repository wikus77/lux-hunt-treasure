-- Create push_subscriptions table with proper structure and platform detection
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid null,
  p256dh text not null,
  auth text not null,
  ua text null,
  platform text null,
  created_at timestamptz not null default now()
);

-- Create index for user_id lookups
create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Drop existing policies if they exist
drop policy if exists ps_insert on public.push_subscriptions;
drop policy if exists ps_select on public.push_subscriptions;
drop policy if exists ps_delete_own on public.push_subscriptions;

-- Policy for inserting: allow anon and authenticated users
create policy ps_insert
  on public.push_subscriptions
  for insert
  to anon, authenticated
  with check (true);

-- Policy for selecting: only own subscriptions for authenticated users
create policy ps_select
  on public.push_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy for deleting: only own subscriptions for authenticated users
create policy ps_delete_own
  on public.push_subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);