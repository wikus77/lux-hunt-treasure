-- =========================================================
-- M1SSION™ – Piano FREE backend (NO-TOUCH push) 
-- © 2025 Joseph Mulé – M1SSION™ – Tutti i diritti riservati
-- Esegui in produzione UNA VOLTA.
-- Idempotente: non rompe se gli oggetti esistono già.
-- =========================================================

-- 1) Crea/aggiorna il tier "free" (se usi tabella subscription_tiers)
do $$
begin
  if not exists (
    select 1 from information_schema.tables 
    where table_schema='public' and table_name='subscription_tiers'
  ) then
    -- se non hai la tabella, salta: la logica userà la colonna 'tier' nella subscriptions
    raise notice 'Tabella subscription_tiers non presente: skip creazione tier.';
  else
    if not exists (select 1 from public.subscription_tiers where code = 'free') then
      insert into public.subscription_tiers (code, name, price_cents, currency, is_active, sort_order, metadata)
      values ('free','Free (Base)', 0, 'EUR', true, 0, jsonb_build_object('notes','created by SQL free tier'));
    end if;
  end if;
end$$;

-- 2) Unique parziale: un solo FREE attivo per utente
create unique index if not exists idx_unique_free_active_per_user
on public.subscriptions (user_id)
where (status = 'active' and (tier = 'free' or tier = 'FREE'));

-- 3) Funzione per creare la sottoscrizione FREE senza Stripe
create or replace function public.create_free_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_now timestamptz := now();
  v_sub record;
begin
  -- Utente chiamante
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Se ha già un abbonamento attivo (qualsiasi), non creare doppioni
  select * into v_sub
  from public.subscriptions
  where user_id = v_uid and status = 'active'
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object('ok', true, 'already_active', true, 'subscription_id', v_sub.id);
  end if;

  -- Crea FREE attivo
  insert into public.subscriptions (
    user_id, tier, status, provider, started_at, created_at, metadata
  ) values (
    v_uid, 'free', 'active', 'internal', v_now, v_now,
    jsonb_build_object('source','create_free_subscription','note','piano free senza Stripe')
  )
  returning id into v_sub;

  return jsonb_build_object('ok', true, 'subscription_id', v_sub.id);
end
$$;

-- 4) Permessi minimi: consenti la chiamata agli utenti autenticati
revoke all on function public.create_free_subscription() from public;
grant execute on function public.create_free_subscription() to authenticated;

-- 5) Verifica rapida
with d as (
  select user_id, count(*) n
  from public.subscriptions
  where tier ilike 'free' and status='active'
  group by 1
)
select
  'OK' as status,
  (select count(*) from d where n>1) as users_with_multiple_free,
  (select count(*) from public.subscriptions where tier ilike 'free' and status='active') as total_free_active;