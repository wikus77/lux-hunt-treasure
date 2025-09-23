-- M1SSION™ FREE PLAN RPC (idempotente) - DROP AND RECREATE
DROP FUNCTION IF EXISTS public.create_free_subscription();

create or replace function public.create_free_subscription()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_now  timestamptz := now();
begin
  -- utente autenticato
  select auth.uid() into v_user;
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  -- se esiste già una sub FREE attiva → idempotente
  if exists (
    select 1 from subscriptions
    where user_id = v_user
      and tier = 'FREE'
      and status = 'active'
  ) then
    return json_build_object('status','already_active');
  end if;

  -- crea/attiva la FREE
  insert into subscriptions (user_id, tier, status, start_date)
  values (v_user, 'FREE', 'active', v_now)
  on conflict (user_id, tier)
  do update set status='active', start_date=excluded.start_date;

  return json_build_object('status','created');

exception
  when unique_violation then
    -- altro client l'ha creata in gara → ok
    return json_build_object('status','already_active');
  when others then
    raise;
end;
$$;

-- permessi strettamente necessari
grant execute on function public.create_free_subscription() to authenticated;
revoke execute on function public.create_free_subscription() from anon;

-- Un solo record FREE attivo per utente
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname='public'
      and indexname='idx_unique_free_active_per_user'
  ) then
    create unique index idx_unique_free_active_per_user
      on public.subscriptions (user_id)
      where (tier = 'FREE' and status = 'active');
  end if;
end $$;