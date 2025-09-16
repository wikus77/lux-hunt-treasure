-- ============================================
-- M1SSION™ FREE PLAN UNBLOCKER (SAFE / IDEMPOTENTE)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Vincoli: NO-TOUCH su push/geofence/FCM/Stripe/webhooks
-- Esegue: diagnosi → fix naming FREE/base → policy RLS selezione → idempotenza
--         abilita accesso immediato per FREE (senza cambiare altri piani)
-- ============================================

begin;

-- 0) DIAGNOSI RAPIDA (stampa stato)
with me as (select auth.uid() as uid)
select
  (select tier from public.subscriptions s join me on s.user_id = me.uid where (status='active') order by created_at desc limit 1) as current_tier,
  (select status from public.subscriptions s join me on s.user_id = me.uid order by created_at desc limit 1) as last_status,
  (select choose_plan_seen from public.profiles p join me on p.id = me.uid) as choose_plan_seen,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='subscriptions' and column_name='tier') as has_col_tier,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='subscriptions' and column_name='status') as has_col_status,
  (select count(*) from pg_policies where schemaname='public' and tablename='subscriptions' and policyname='subscriptions_select_own') as has_select_policy
;

-- 1) GARANTISCI COLONNA PROFILES.choose_plan_seen (se manca)
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='choose_plan_seen'
  ) then
    alter table public.profiles
      add column choose_plan_seen boolean not null default false;
  end if;
end $$;

-- 2) UNIQUE per una sola sub attiva per utente (idempotenza FREE)
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='idx_unique_active_sub_per_user'
  ) then
    create unique index idx_unique_active_sub_per_user
      on public.subscriptions(user_id)
      where status = 'active';
  end if;
end $$;

-- 3) RLS: SELECT delle proprie subscriptions (se manca)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='subscriptions'
      and policyname='subscriptions_select_own'
  ) then
    create policy "subscriptions_select_own"
    on public.subscriptions
    for select
    using (user_id = auth.uid());
  end if;
end $$;

-- 4) **NORMALIZZA TIER FREE**
update public.subscriptions
set tier = 'free'
where tier in ('base','FREE','Base','Free') and tier <> 'free';

-- 5) RPC FREE: crea se manca o forza idempotenza
create or replace function public.create_free_subscription()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_has_active boolean;
begin
  if v_uid is null then
    raise exception 'Auth required';
  end if;

  select exists(
    select 1 from public.subscriptions
    where user_id = v_uid and status = 'active'
  ) into v_has_active;

  if not v_has_active then
    insert into public.subscriptions (user_id, tier, status)
    values (v_uid, 'free', 'active')
    on conflict (user_id) do nothing; -- usa indice unico parziale
  end if;

  -- flag prima-visita visto
  update public.profiles
  set choose_plan_seen = true
  where id = v_uid;

  -- Sblocco accesso per piano FREE (solo se colonne esistono)
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='profiles' and column_name='access_enabled') then
    update public.profiles
    set access_enabled = coalesce(access_enabled,true)
    where id = v_uid;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='profiles' and column_name='access_start_date') then
    update public.profiles
    set access_start_date = coalesce(access_start_date, now() AT TIME ZONE 'utc')
    where id = v_uid;
  end if;

end
$$;

grant execute on function public.create_free_subscription() to authenticated;

-- 6) Vista di controllo rapido
create or replace view public.v_active_subscription_for_user
with (security_barrier)
as
select s.user_id,
       s.tier,
       s.status,
       s.created_at
from public.subscriptions s
where s.status = 'active';

commit;

-- 7) POST-CHECK
with me as (select auth.uid() as uid)
select
  'OK' as status,
  (select tier from v_active_subscription_for_user v join me on v.user_id=me.uid limit 1) as active_tier,
  (select choose_plan_seen from public.profiles p join me on p.id = me.uid) as choose_plan_seen_final;