-- M1SSION™ FREE PLAN – DB FIX (IDEMPOTENTE, NO-TOUCH PUSH)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 0) Sicurezza: lavoriamo nello schema public
set search_path = public;

-- 1) Assicurati che la riga del TIER "FREE" esista (adatta il nome tabella se diverso)
--    Se usi 'subscription_tiers' con colonna 'code', crea/aggiorna qui:
do $$
begin
  if to_regclass('public.subscription_tiers') is not null then
    insert into subscription_tiers (code, name, price_cents, currency, is_active)
    values ('FREE', 'Free (Base)', 0, 'EUR', true)
    on conflict (code) do update
      set name='Free (Base)', price_cents=0, currency='EUR', is_active=true;
  end if;
end$$;

-- 2) Vincolo: un solo abbonamento attivo per utente
do $$
begin
  if not exists (
    select 1 from pg_indexes
     where schemaname='public'
       and indexname='idx_unique_active_sub_per_user'
  ) then
    create unique index idx_unique_active_sub_per_user
      on subscriptions (user_id)
      where (is_active is true);
  end if;
end$$;

-- 3) Funzione RPC: create_free_subscription() – bypass RLS in modo sicuro
create or replace function public.create_free_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_tier_id uuid;
  v_payload jsonb;
begin
  -- 3.1) Prendi l'utente loggato
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  -- 3.2) Trova il tier FREE, se esiste (opzionale)
  if to_regclass('public.subscription_tiers') is not null then
    select id into v_tier_id
      from subscription_tiers
     where code='FREE' and is_active is true
     limit 1;
  end if;

  -- 3.3) Se l’utente ha già un abbonamento attivo, idempotente: restituisci OK
  if exists (select 1 from subscriptions s where s.user_id = v_uid and s.is_active is true) then
    return jsonb_build_object('status','ok','already_active',true);
  end if;

  -- 3.4) Disattiva eventuali abbonamenti attivi rimasti (sanity)
  update subscriptions
     set is_active = false, ended_at = now()
   where user_id = v_uid and is_active is true;

  -- 3.5) Crea FREE attivo (senza Stripe)
  insert into subscriptions (user_id, plan_code, tier_id, is_active, started_at)
  values (
    v_uid,
    'FREE',
    v_tier_id,        -- può essere null se non usi la tabella tiers
    true,
    now()
  )
  on conflict do nothing;

  -- 3.6) Ricontrolla esito (copre il caso di race/unique violation)
  if not exists (select 1 from subscriptions where user_id=v_uid and is_active is true) then
    -- Prova una seconda volta gestendo race
    insert into subscriptions (user_id, plan_code, tier_id, is_active, started_at)
    values (v_uid, 'FREE', v_tier_id, true, now())
    on conflict do nothing;

    if not exists (select 1 from subscriptions where user_id=v_uid and is_active is true) then
      raise exception 'FREE_CREATE_FAILED';
    end if;
  end if;

  -- 3.7) Risposta
  select jsonb_build_object(
    'status','ok',
    'plan','FREE',
    'active',true
  ) into v_payload;

  return v_payload;
end
$$;

-- 4) Permessi di esecuzione per utenti loggati
grant execute on function public.create_free_subscription() to authenticated;

-- 5) (Facoltativo ma utile) Policy di sola lettura per l’utente sulle proprie subscriptions
do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='subscriptions' and policyname='sub_read_own'
  ) then
    create policy sub_read_own on public.subscriptions
      for select using (auth.uid() = user_id);
  end if;
end$$;

-- 6) TEST RAPIDO: esegui come utente (nel client verrà passato il JWT); qui tornerà null per auth.uid()
--    Quindi non testare da SQL anonimo. Il vero test è dal client.
--    Tuttavia verifichiamo che la funzione esista e i permessi ci siano:
select
  (select 1 from pg_proc where proname='create_free_subscription') as fn_exists,
  has_function_privilege('authenticated', 'public.create_free_subscription()', 'EXECUTE') as auth_can_exec;
