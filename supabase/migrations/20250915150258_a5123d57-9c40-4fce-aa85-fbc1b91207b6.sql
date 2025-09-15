-- Drop the existing function first
DROP FUNCTION IF EXISTS public.mark_choose_plan_seen();

-- Then run the complete migration script
-- ==========================================================
-- M1SSION™ FREE PLAN • DB & RPC HARDENING
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Vincoli: NO-TOUCH push/geofence/FCM/Stripe. Solo DB auth/subscriptions/profiles.
-- ==========================================================

-- 0) Sicurezza transazionale
begin;

-- 1) Colonna "choose_plan_seen" su profiles (idempotente)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='choose_plan_seen'
  ) then
    alter table public.profiles add column choose_plan_seen boolean default false;
  end if;
end$$;

-- 2) Unique gate per FREE attivo per utente (idempotente)
--   Prova a supportare più nomi di colonne tipici della tabella subscriptions.
do $$
declare
  has_subs boolean := (to_regclass('public.subscriptions') is not null);
  has_plan_code boolean;
  has_tier boolean;
  has_status boolean;
  has_is_active boolean;
begin
  if has_subs then
    select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='plan_code'
    ) into has_plan_code;

    select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='tier'
    ) into has_tier;

    select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='status'
    ) into has_status;

    select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='is_active'
    ) into has_is_active;

    -- indice unico parziale: 1 FREE attivo per user
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname='idx_unique_free_active_per_user'
    ) then
      execute format(
        'create unique index idx_unique_free_active_per_user on public.subscriptions(user_id)
         where %s = ''free'' and %s in (''active'',''trialing'') and %s = true;',
         case when has_plan_code then 'coalesce(plan_code, tier::text)'
              when has_tier then 'tier::text'
              else 'coalesce(plan_code, ''free'')' end,
         case when has_status then 'coalesce(status,''active'')' else 'coalesce(status,''active'')' end,
         case when has_is_active then 'coalesce(is_active,true)' else 'true' end
      );
    end if;
  end if;
end$$;

-- 3) RPC: mark_choose_plan_seen (idempotente, sicura)
create or replace function public.mark_choose_plan_seen()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  updated int := 0;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'no_auth', 'message', 'auth.uid() is null');
  end if;

  update public.profiles p
     set choose_plan_seen = true
   where (p.id = uid or p.user_id = uid)
     and coalesce(choose_plan_seen,false) = false;

  get diagnostics updated = row_count;

  return jsonb_build_object('ok', true, 'updated', updated);
end$$;

grant execute on function public.mark_choose_plan_seen() to authenticated;

-- 4) RPC: create_free_subscription (idempotente + controlli)
create or replace function public.create_free_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  has_subs boolean := (to_regclass('public.subscriptions') is not null);
  v_status text := 'active';
  v_now timestamptz := now();
  v_inserted boolean := false;
  exists_active int := 0;
  has_plan_code boolean;
  has_tier boolean;
  has_status boolean;
  has_is_active boolean;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'no_auth', 'message', 'auth.uid() is null');
  end if;

  -- protezione profilo esistente
  if not exists (select 1 from public.profiles where id = uid or user_id = uid) then
    return jsonb_build_object('ok', false, 'error', 'no_profile', 'message', 'profile not found for user');
  end if;

  if not has_subs then
    -- fallback minimale: segna choose_plan_seen e restituisci OK (per evitare blocchi UX)
    perform public.mark_choose_plan_seen();
    return jsonb_build_object('ok', true, 'status', 'no_subscriptions_table');
  end if;

  select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='plan_code'
  ) into has_plan_code;

  select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='tier'
  ) into has_tier;

  select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='status'
  ) into has_status;

  select exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='subscriptions' and column_name='is_active'
  ) into has_is_active;

  -- esiste già FREE attivo?
  execute format(
    'select count(*) from public.subscriptions
      where user_id = $1
        and ( %s = ''free'' )
        and ( %s in (''active'',''trialing'') )
        and ( %s )',
     case when has_plan_code then 'coalesce(plan_code, tier::text)'
          when has_tier then 'tier::text' else 'coalesce(plan_code,''free'')' end,
     case when has_status then 'coalesce(status,''active'')' else 'coalesce(status,''active'')' end,
     case when has_is_active then 'coalesce(is_active,true)=true' else 'true' end
  )
  into exists_active
  using uid;

  if exists_active > 0 then
    perform public.mark_choose_plan_seen();
    return jsonb_build_object('ok', true, 'status', 'already_active');
  end if;

  -- prova inserimento dinamico
  begin
    if has_plan_code and has_status and has_is_active then
      execute
        'insert into public.subscriptions(user_id, plan_code, status, is_active, created_at)
         values ($1, ''free'', ''active'', true, $2)'
      using uid, v_now;
      v_inserted := true;

    elsif has_tier and has_status and has_is_active then
      execute
        'insert into public.subscriptions(user_id, tier, status, is_active, created_at)
         values ($1, ''free'', ''active'', true, $2)'
      using uid, v_now;
      v_inserted := true;

    elsif has_plan_code and has_status and not has_is_active then
      execute
        'insert into public.subscriptions(user_id, plan_code, status, created_at)
         values ($1, ''free'', ''active'', $2)'
      using uid, v_now;
      v_inserted := true;

    else
      -- estrema compatibilità: prova solo (user_id, created_at)
      execute
        'insert into public.subscriptions(user_id, created_at)
         values ($1, $2)'
      using uid, v_now;
      v_inserted := true;
    end if;
  exception
    when unique_violation then
      -- idempotenza
      v_inserted := false;
  end;

  perform public.mark_choose_plan_seen();
  return jsonb_build_object('ok', true, 'status', case when v_inserted then 'created' else 'idempotent' end);
end$$;

grant execute on function public.create_free_subscription() to authenticated;

-- 5) Policy RLS minime per permettere a authenticated di leggere la propria sottoscrizione
--    (NON tocca nulla di push/geofence; solo sicurezza subscriptions/profiles)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='subscriptions' and policyname='read_own_subscriptions'
  ) then
    create policy read_own_subscriptions on public.subscriptions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='update_choose_plan_seen'
  ) then
    create policy update_choose_plan_seen on public.profiles
      for update to authenticated
      using (auth.uid() in (id, user_id))
      with check (auth.uid() in (id, user_id));
  end if;
end$$;

commit;