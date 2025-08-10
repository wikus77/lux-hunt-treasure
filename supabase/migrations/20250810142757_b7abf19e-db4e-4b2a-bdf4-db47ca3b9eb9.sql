-- Funzione admin sicura (solo profiles.role)
create or replace function public.is_admin_secure()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and coalesce(p.role,'') = 'admin'
  );
$$;

grant execute on function public.is_admin_secure() to authenticated;

create or replace function public.is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$ select public.is_admin_secure(); $$;

grant execute on function public.is_admin_user() to authenticated;

-- user_balances RLS
alter table if exists public.user_balances enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_balances' AND policyname='ub_select_own'
  ) THEN
    CREATE POLICY ub_select_own ON public.user_balances
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_balances' AND policyname='ub_update_own'
  ) THEN
    CREATE POLICY ub_update_own ON public.user_balances
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END$$;
REVOKE INSERT, DELETE ON public.user_balances FROM authenticated, anon;

-- user_custom_rewards RLS
alter table if exists public.user_custom_rewards enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_custom_rewards' AND policyname='ucr_select_own'
  ) THEN
    CREATE POLICY ucr_select_own ON public.user_custom_rewards
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END$$;
REVOKE INSERT, UPDATE, DELETE ON public.user_custom_rewards FROM authenticated, anon;

-- api_rate_limits RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='api_rate_limits') THEN
    ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='api_rate_limits' AND policyname='arl_select_admin'
    ) THEN
      CREATE POLICY arl_select_admin ON public.api_rate_limits FOR SELECT TO authenticated USING (public.is_admin_secure());
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='api_rate_limits' AND policyname='arl_writes_service'
    ) THEN
      CREATE POLICY arl_writes_service ON public.api_rate_limits FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'service_role') WITH CHECK (auth.jwt()->>'role' = 'service_role');
    END IF;
    REVOKE INSERT, UPDATE, DELETE ON public.api_rate_limits FROM authenticated, anon;
  END IF;
END$$;

-- blocked_ips RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='blocked_ips') THEN
    ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='blocked_ips' AND policyname='bip_select_admin'
    ) THEN
      CREATE POLICY bip_select_admin ON public.blocked_ips FOR SELECT TO authenticated USING (public.is_admin_secure());
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='blocked_ips' AND policyname='bip_writes_service'
    ) THEN
      CREATE POLICY bip_writes_service ON public.blocked_ips FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'service_role') WITH CHECK (auth.jwt()->>'role' = 'service_role');
    END IF;
    REVOKE INSERT, UPDATE, DELETE ON public.blocked_ips FROM authenticated, anon;
  END IF;
END$$;

-- qr_redemption_logs RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='qr_redemption_logs') THEN
    ALTER TABLE public.qr_redemption_logs ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_redemption_logs' AND policyname='qrl_select_own_or_admin'
    ) THEN
      CREATE POLICY qrl_select_own_or_admin ON public.qr_redemption_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin_secure());
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='qr_redemption_logs' AND policyname='qrl_insert_owner_or_service'
    ) THEN
      CREATE POLICY qrl_insert_owner_or_service ON public.qr_redemption_logs FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()) OR (auth.jwt()->>'role' = 'service_role'));
    END IF;
    REVOKE UPDATE, DELETE ON public.qr_redemption_logs FROM authenticated, anon;
  END IF;
END$$;

-- FK su qr_redemption_logs -> qr_codes (guardata e idempotente)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='qr_redemption_logs') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = rel.relnamespace
      WHERE n.nspname='public' AND rel.relname='qr_redemption_logs' AND con.conname='qr_redemption_logs_qr_fk'
    ) THEN
      ALTER TABLE public.qr_redemption_logs
        ADD CONSTRAINT qr_redemption_logs_qr_fk
        FOREIGN KEY (qr_code_id) REFERENCES public.qr_codes(id) ON DELETE CASCADE;
    END IF;
  END IF;
END$$;

-- Indice unico su qr_redemption_logs (se esiste la tabella)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='qr_redemption_logs') THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_redemptions_qr_user ON public.qr_redemption_logs(qr_code_id, user_id);
  END IF;
END$$;

-- Indici su qr_codes (se esiste la tabella)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='qr_codes') THEN
    CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);
    CREATE INDEX IF NOT EXISTS idx_qr_codes_active_expiry ON public.qr_codes(is_active, expires_at);
  END IF;
END$$;