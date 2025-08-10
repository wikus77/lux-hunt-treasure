-- =========================================================
-- © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
-- Hardening RLS, cleanup duplicati, vincoli QR e report (fix EXECUTE quoting)
-- Eseguire in Production
-- =========================================================

set search_path = public;

-- 1) Funzioni critiche: forza search_path per tutte le SECURITY DEFINER note
DO $$
BEGIN
  EXECUTE 'alter function if exists public.qr_redeem(text,double precision,double precision) owner to postgres';
  EXECUTE 'alter function if exists public.qr_redeem(text,double precision,double precision) set search_path = public';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  EXECUTE 'alter function if exists public.get_my_balance() owner to postgres';
  EXECUTE 'alter function if exists public.get_my_balance() set search_path = public';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  EXECUTE 'alter function if exists public.qr_admin_upsert(text,text,text,int,int,int,double precision,double precision,int,boolean) owner to postgres';
  EXECUTE 'alter function if exists public.qr_admin_upsert(text,text,text,int,int,int,double precision,double precision,int,boolean) set search_path = public';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2) RLS ON sulle tabelle sensibili
ALTER TABLE IF EXISTS public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_custom_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.qr_redemption_logs ENABLE ROW LEVEL SECURITY;

-- 3) Policy minime sicure (crea se non esistono già)
-- user_balances: solo proprietario può leggere/aggiornare; niente INSERT da client
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_balances' AND policyname='ub_select_own'
  ) THEN
    EXECUTE 'create policy ub_select_own on public.user_balances for select to authenticated using (user_id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_balances' AND policyname='ub_update_own'
  ) THEN
    EXECUTE 'create policy ub_update_own on public.user_balances for update to authenticated using (user_id = auth.uid())';
  END IF;
END $$;

-- user_custom_rewards: read own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_custom_rewards' AND policyname='ucr_select_own'
  ) THEN
    EXECUTE 'create policy ucr_select_own on public.user_custom_rewards for select to authenticated using (user_id = auth.uid())';
  END IF;
END $$;

-- api_rate_limits / blocked_ips: solo service_role può mutare, admin può leggere
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='api_rate_limits' AND policyname='arl_select_admin'
  ) THEN
    EXECUTE 'create policy arl_select_admin on public.api_rate_limits for select to authenticated using (is_admin_secure())';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='api_rate_limits' AND policyname='arl_mutate_srv'
  ) THEN
    EXECUTE 'create policy arl_mutate_srv on public.api_rate_limits for all to public using ((auth.jwt()->>''role'') = ''service_role'') with check ((auth.jwt()->>''role'') = ''service_role'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blocked_ips' AND policyname='bip_select_admin'
  ) THEN
    EXECUTE 'create policy bip_select_admin on public.blocked_ips for select to authenticated using (is_admin_secure())';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='blocked_ips' AND policyname='bip_mutate_srv'
  ) THEN
    EXECUTE 'create policy bip_mutate_srv on public.blocked_ips for all to public using ((auth.jwt()->>''role'') = ''service_role'') with check ((auth.jwt()->>''role'') = ''service_role'')';
  END IF;
END $$;

-- qr_redemption_logs: insert utente o service_role; select own/admin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='qr_redemption_logs' AND policyname='qrrl_insert_user_or_srv'
  ) THEN
    EXECUTE 'create policy qrrl_insert_user_or_srv on public.qr_redemption_logs for insert to public with check ((user_id = auth.uid()) or ((auth.jwt()->>''role'') = ''service_role''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='qr_redemption_logs' AND policyname='qrrl_select_own'
  ) THEN
    EXECUTE 'create policy qrrl_select_own on public.qr_redemption_logs for select to authenticated using ((user_id = auth.uid()) or is_admin_secure())';
  END IF;
END $$;

-- 4) Indici / Vincoli
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.qr_redemption_logs'::regclass
      AND conname = 'qr_redemption_logs_qr_code_fk'
  ) THEN
    EXECUTE 'alter table public.qr_redemption_logs add constraint qr_redemption_logs_qr_code_fk foreign key (qr_code_id) references public.qr_codes(id) on delete cascade not valid';
  END IF;
END $$;

-- 5) Cleanup duplicati
WITH ranked AS (
  SELECT id, qr_code_id, user_id,
         row_number() over (partition by qr_code_id, user_id order by redeemed_at desc, id desc) as rn
  FROM public.qr_redemption_logs
)
DELETE FROM public.qr_redemption_logs
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 6) Unique index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname='public' AND tablename='qr_redemption_logs' AND indexname='uniq_qrrl_qrcode_user'
  ) THEN
    EXECUTE 'create unique index uniq_qrrl_qrcode_user on public.qr_redemption_logs(qr_code_id, user_id)';
  END IF;
END $$;

-- 7) Validate FK
DO $$
BEGIN
  EXECUTE 'alter table public.qr_redemption_logs validate constraint qr_redemption_logs_qr_code_fk';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'VALIDATE FK: %', SQLERRM;
END $$;
