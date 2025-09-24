-- ============================================
-- M1SSION™ BUZZ FREE OVERRIDE - FIX FUNCTION CONFLICT
-- Drop existing function first, then recreate
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================

-- Drop existing consume_free_buzz function if it exists
DROP FUNCTION IF EXISTS public.consume_free_buzz();

-- Drop existing type if it exists
DROP TYPE IF EXISTS public.consume_free_buzz_result;

-- 1) TABLLA OVERRIDE (se manca)
create table if not exists public.admin_buzz_overrides (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cooldown_disabled boolean not null default false,
  free_quota integer not null default 0,
  free_used integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) TRIGGER updated_at
create or replace function public._set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_set_updated_at_buzz_overrides on public.admin_buzz_overrides;
create trigger trg_set_updated_at_buzz_overrides
before update on public.admin_buzz_overrides
for each row execute function public._set_updated_at();

-- 3) RLS
alter table public.admin_buzz_overrides enable row level security;

-- 4) RPC: get_buzz_override()
create or replace function public.get_buzz_override()
returns table (
  cooldown_disabled boolean,
  free_remaining integer,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cooldown boolean := false;
  v_free_quota int := 0;
  v_free_used int := 0;
  v_expires timestamptz := null;
begin
  if v_uid is null then
    return query select false::boolean, 0::int, null::timestamptz;
    return;
  end if;

  select o.cooldown_disabled, o.free_quota, o.free_used, o.expires_at
    into v_cooldown, v_free_quota, v_free_used, v_expires
  from public.admin_buzz_overrides o
  where o.user_id = v_uid
    and (o.expires_at is null or o.expires_at > now())
  limit 1;

  if not found then
    return query select false::boolean, 0::int, null::timestamptz;
  else
    return query
      select v_cooldown,
             greatest(v_free_quota - v_free_used, 0),
             v_expires;
  end if;
end
$$;

-- 5) Recreate type and function
create type public.consume_free_buzz_result as (
  ok boolean,
  free_remaining integer,
  message text
);

create or replace function public.consume_free_buzz()
returns public.consume_free_buzz_result
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.admin_buzz_overrides%rowtype;
  v_remaining int;
  v_result public.consume_free_buzz_result;
begin
  if v_uid is null then
    v_result := (false, 0, 'not_authenticated');
    return v_result;
  end if;

  select * into v_row
  from public.admin_buzz_overrides
  where user_id = v_uid
    and (expires_at is null or expires_at > now())
  for update;

  if not found then
    v_result := (false, 0, 'no_override');
    return v_result;
  end if;

  v_remaining := greatest(v_row.free_quota - v_row.free_used, 0);

  if v_remaining <= 0 then
    v_result := (false, 0, 'no_free_remaining');
    return v_result;
  end if;

  update public.admin_buzz_overrides
     set free_used = free_used + 1
   where user_id = v_uid;

  v_remaining := v_remaining - 1;
  v_result := (true, v_remaining, 'consumed');
  return v_result;
end
$$;

-- 6) PERMESSI
grant execute on function public.get_buzz_override() to anon, authenticated;
grant execute on function public.consume_free_buzz() to anon, authenticated;

-- 7) SEED per wikus77@hotmail.it
insert into public.admin_buzz_overrides as o (
  user_id, cooldown_disabled, free_quota, free_used, expires_at
) values (
  '495246c1-9154-4f01-a428-7f37fe230180',
  true,
  10,
  0,
  '2025-10-08T23:59:59Z'
)
on conflict (user_id) do update
  set cooldown_disabled = excluded.cooldown_disabled,
      free_quota        = excluded.free_quota,
      expires_at        = excluded.expires_at;