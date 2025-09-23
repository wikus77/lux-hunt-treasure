-- Drop existing function and recreate with correct return type
DROP FUNCTION IF EXISTS public.create_free_subscription() CASCADE;

-- =====================================================================
-- M1SSION™ / FREE PLAN — DB FIX PACK (NO-TOUCH PUSH/GEOFENCE/STRIPE)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

-- 0) Preparazione: tutto su schema public
set search_path = public;

-- 1) Flag per mostrare la pagina piani SOLO la prima volta
alter table public.profiles
  add column if not exists choose_plan_seen boolean not null default false;

-- 2) Indice: 1 sola subscription "attiva" per utente (idempotenza)
-- (se esiste già con altro nome, questa CREATE IF NOT EXISTS lo salta)
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='idx_unique_active_sub_per_user'
  ) then
    execute $i$
      create unique index idx_unique_active_sub_per_user
      on public.subscriptions (user_id)
      where status = 'active'
    $i$;
  end if;
end$$;

-- 3) RPC robusta e idempotente per attivare il piano FREE
create or replace function public.create_free_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _sid uuid;
begin
  if _uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- se esiste già un'active → restituisco successo
  select id into _sid
  from public.subscriptions
  where user_id = _uid and status = 'active'
  limit 1;

  if _sid is null then
    -- crea FREE attivo, senza Stripe
    insert into public.subscriptions
      (id, user_id, plan, status, is_active, started_at, ends_at, source)
    values
      (gen_random_uuid(), _uid, 'free', 'active', true, now(), now() + interval '100 years', 'free_rpc')
    on conflict do nothing
    returning id into _sid;
  end if;

  -- marca che l'utente ha visto/gestito la scelta piano la prima volta
  update public.profiles
     set choose_plan_seen = true
   where id = _uid
     and choose_plan_seen = false;

  -- ritorno sempre successo con info piano
  return jsonb_build_object(
    'ok', true,
    'plan', 'free',
    'subscription_id', _sid
  );
exception
  when unique_violation then
    -- un altro vincolo ha vinto la gara: prendo la sub attiva e ritorno ok
    select id into _sid
    from public.subscriptions
    where user_id = _uid and status = 'active'
    limit 1;

    return jsonb_build_object(
      'ok', true,
      'plan', 'free',
      'subscription_id', _sid,
      'note', 'unique_violation_treated_as_success'
    );
end;
$$;

-- 4) Permessi esecuzione RPC (solo utenti autenticati)
grant execute on function public.create_free_subscription() to authenticated;

-- 5) RPC utility (facoltativa) per segnare visto il choose-plan (usata dal client al mount)
create or replace function public.mark_choose_plan_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
begin
  if _uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  update public.profiles
     set choose_plan_seen = true
   where id = _uid;
end;
$$;

grant execute on function public.mark_choose_plan_seen() to authenticated;