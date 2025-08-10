-- =========================
-- 1) Helper: funzione admin sicura (usa public.profiles)
-- =========================
create or replace function public.is_admin_secure()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        coalesce(p.is_admin, false) = true
        or coalesce(p.role, '') = 'admin'
      )
  );
$$;

grant execute on function public.is_admin_secure() to authenticated;

-- Compatibilità: wrapper sicuro
create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin_secure();
$$;
grant execute on function public.is_admin_user() to authenticated;

-- =========================
-- 2) RLS: user_balances
-- =========================
alter table if exists public.user_balances enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_balances' and policyname='ub_select_own'
  ) then
    create policy ub_select_own on public.user_balances
      for select to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_balances' and policyname='ub_update_own'
  ) then
    create policy ub_update_own on public.user_balances
      for update to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- I client non devono inserire/cancellare direttamente
revoke insert, delete on public.user_balances from authenticated, anon;

-- =========================
-- 3) RLS: user_custom_rewards (rinomina se il nome reale è diverso)
-- =========================
alter table if exists public.user_custom_rewards enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_custom_rewards' and policyname='ucr_select_own'
  ) then
    create policy ucr_select_own on public.user_custom_rewards
      for select to authenticated
      using (user_id = auth.uid());
  end if;
end$$;

-- Solo via funzioni SECURITY DEFINER / service_role: niente scritture dirette dai client
revoke insert, update, delete on public.user_custom_rewards from authenticated, anon;

-- =========================
-- 4) Tabelle “di sistema” – chiudi i buchi
-- =========================

-- api_rate_limits
do $$
begin
  perform 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname='public' and c.relname='api_rate_limits';
  if found then
    alter table public.api_rate_limits enable row level security;

    -- SELECT solo admin
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='api_rate_limits' and policyname='arl_select_admin'
    ) then
      create policy arl_select_admin on public.api_rate_limits
        for select to authenticated
        using (public.is_admin_secure());
    end if;

    -- Scritture solo service_role
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='api_rate_limits' and policyname='arl_writes_service'
    ) then
      create policy arl_writes_service on public.api_rate_limits
        for all to authenticated
        using (auth.jwt()->>'role' = 'service_role')
        with check (auth.jwt()->>'role' = 'service_role');
    end if;

    revoke insert, update, delete on public.api_rate_limits from authenticated, anon;
  end if;
end$$;

-- blocked_ips
do $$
begin
  perform 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname='public' and c.relname='blocked_ips';
  if found then
    alter table public.blocked_ips enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='blocked_ips' and policyname='bip_select_admin'
    ) then
      create policy bip_select_admin on public.blocked_ips
        for select to authenticated
        using (public.is_admin_secure());
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='blocked_ips' and policyname='bip_writes_service'
    ) then
      create policy bip_writes_service on public.blocked_ips
        for all to authenticated
        using (auth.jwt()->>'role' = 'service_role')
        with check (auth.jwt()->>'role' = 'service_role');
    end if;

    revoke insert, update, delete on public.blocked_ips from authenticated, anon;
  end if;
end$$;

-- qr_redemption_logs
do $$
begin
  perform 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname='public' and c.relname='qr_redemption_logs';
  if found then
    alter table public.qr_redemption_logs enable row level security;

    -- SELECT: proprietario o admin
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='qr_redemption_logs' and policyname='qrl_select_own_or_admin'
    ) then
      create policy qrl_select_own_or_admin on public.qr_redemption_logs
        for select to authenticated
        using (user_id = auth.uid() or public.is_admin_secure());
    end if;

    -- INSERT: owner (via app) o service_role
    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='qr_redemption_logs' and policyname='qrl_insert_owner_or_service'
    ) then
      create policy qrl_insert_owner_or_service on public.qr_redemption_logs
        for insert to authenticated
        with check ((user_id = auth.uid()) or (auth.jwt()->>'role' = 'service_role'));
    end if;

    -- UPDATE/DELETE: di norma vietati ai client
    revoke update, delete on public.qr_redemption_logs from authenticated, anon;
  end if;
end$$;

-- =========================
-- 5) Integrità & idempotenza QR
-- =========================

-- FK verso qr_codes (se non c'è già)
do $$
begin
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='public' and c.relname='qr_redemption_logs') then
    alter table public.qr_redemption_logs
      add constraint if not exists qr_redemption_logs_qr_fk
      foreign key (qr_code_id) references public.qr_codes(id) on delete cascade;
  end if;
end$$;

-- Unicità (qr_code_id, user_id) per impedire doppie redemption concorrenti
create unique index if not exists idx_qr_redemptions_qr_user
  on public.qr_redemption_logs(qr_code_id, user_id);

-- Indici utili
create index if not exists idx_qr_codes_code on public.qr_codes(code);
create index if not exists idx_qr_codes_active_expiry on public.qr_codes(is_active, expires_at);

-- =========================
-- 6) Best practice funzioni SECURITY DEFINER (nota)
-- =========================
-- Assicurarsi che tutte le funzioni SECURITY DEFINER abbiano:
--   SECURITY DEFINER
--   SET search_path = public
--   GRANT EXECUTE solo ai ruoli necessari (authenticated) e mai ad anon se scrivono.

-- =========================
-- 7) Verifiche rapide (opzionali)
-- =========================
-- select * from pg_policies where schemaname='public' and tablename in ('user_balances','user_custom_rewards','api_rate_limits','blocked_ips','qr_redemption_logs');