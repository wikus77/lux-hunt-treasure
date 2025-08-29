-- Create push_subscriptions table with proper schema and RLS
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid null,
  p256dh text not null,
  auth text not null,
  ua text null,
  created_at timestamptz not null default now()
);

-- Create index for user lookups
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- Allow insert for own or anonymous subscriptions
create policy "insert own or anonymous" on public.push_subscriptions
for insert to authenticated, anon
with check ((auth.uid() is null and user_id is null) or (user_id = auth.uid()));

-- Allow select for own or anonymous subscriptions  
create policy "select own or anonymous" on public.push_subscriptions
for select to authenticated, anon
using ((auth.uid() is null and user_id is null) or (user_id = auth.uid()));

-- Allow delete for cleanup on failed sends
create policy "delete own or anonymous" on public.push_subscriptions
for delete to authenticated, anon
using ((auth.uid() is null and user_id is null) or (user_id = auth.uid()));