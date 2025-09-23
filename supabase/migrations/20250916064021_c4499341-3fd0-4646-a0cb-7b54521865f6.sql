-- ===========================================
-- M1SSION™ FREE PLAN – DB SAFETY PACK (FIXED VERSION)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- VINCOLI: NON toccare tabelle/viste di push/geofence/FCM/Stripe.
-- ===========================================

-- 0) Normalizza i tier "base/Free" -> 'free' (idempotente)
update public.subscriptions
set tier = 'free'
where tier ilike 'base' or tier ilike 'free';

-- 1) Una sola subscription ACTIVE per utente (unique parziale)
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='uniq_active_subscription_per_user'
  ) then
    create unique index uniq_active_subscription_per_user
    on public.subscriptions(user_id)
    where status = 'active';
  end if;
end$$;

-- 2) Colonna di controllo prima-visita (se manca)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='choose_plan_seen'
  ) then
    alter table public.profiles add column choose_plan_seen boolean default false;
  end if;
end$$;

-- 3) RPC: mark_choose_plan_seen (idempotente)
create or replace function public.mark_choose_plan_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set choose_plan_seen = true
   where id = auth.uid();
end;
$$;
grant execute on function public.mark_choose_plan_seen() to authenticated;

-- 4) Drop e ricrea create_free_subscription per risolvere il type conflict
drop function if exists public.create_free_subscription();

create function public.create_free_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_sub record;
begin
  -- Se esiste già una ACTIVE, restituiscila (idempotente)
  select id, tier, status, created_at
    into v_sub
    from public.subscriptions
   where user_id = v_user and status = 'active'
   order by created_at desc
   limit 1;

  if found then
    return jsonb_build_object('id', v_sub.id, 'tier', v_sub.tier, 'status', v_sub.status);
  end if;

  -- Inserisci FREE attivo
  insert into public.subscriptions (user_id, tier, status)
  values (v_user, 'free', 'active')
  on conflict do nothing;

  -- Ritorna lo stato finale
  select id, tier, status, created_at
    into v_sub
    from public.subscriptions
   where user_id = v_user and status = 'active'
   order by created_at desc
   limit 1;

  return jsonb_build_object('id', v_sub.id, 'tier', v_sub.tier, 'status', v_sub.status);
end;
$$;
grant execute on function public.create_free_subscription() to authenticated;

-- 5) Policy SELECT sulle proprie subscriptions (se non c'è già)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='subscriptions' and policyname='subscriptions_select_own'
  ) then
    create policy subscriptions_select_own
      on public.subscriptions
      for select
      using (user_id = auth.uid());
  end if;
end$$;