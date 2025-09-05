-- ===============================
-- 1) SCHEMA WEB PUSH
-- ===============================
create table if not exists public.webpush_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  platform text check (platform in ('ios','android','desktop','web','unknown')) default 'desktop',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.webpush_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='webpush_subscriptions' and policyname='own_webpush'
  ) then
    create policy "own_webpush" on public.webpush_subscriptions
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- ===============================
-- 2) RPC UPSERT (SECURITY DEFINER)
-- ===============================
create or replace function public.upsert_webpush_subscription(
  p_user_id uuid,
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_platform text default 'desktop'
) returns webpush_subscriptions
language plpgsql
security definer
as $$
declare rec webpush_subscriptions;
begin
  if length(p_endpoint) < 16 then
    raise exception 'Endpoint too short';
  end if;
  if p_p256dh is null or p_auth is null then
    raise exception 'Missing keys';
  end if;

  insert into public.webpush_subscriptions(user_id, endpoint, p256dh, auth, platform)
  values (p_user_id, p_endpoint, p_p256dh, p_auth, coalesce(p_platform,'desktop'))
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh  = excluded.p256dh,
        auth    = excluded.auth,
        platform= excluded.platform,
        is_active = true
  returning * into rec;

  return rec;
end;
$$;