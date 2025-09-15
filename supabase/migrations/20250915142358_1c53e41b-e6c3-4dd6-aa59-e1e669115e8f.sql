-- M1SSION™ FREE PLAN – DB FIX ADATTATO ALLO SCHEMA REALE
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1) Vincolo: un solo abbonamento attivo per utente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
     WHERE schemaname='public'
       AND indexname='idx_unique_active_sub_per_user'
  ) THEN
    CREATE UNIQUE INDEX idx_unique_active_sub_per_user
      ON subscriptions (user_id)
      WHERE (status IN ('active', 'trialing'));
  END IF;
END$$;

-- 2) Funzione RPC: create_free_subscription() – bypass RLS in modo sicuro
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_payload jsonb;
BEGIN
  -- Prendi l'utente loggato
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  -- Se l'utente ha già un abbonamento attivo, idempotente: restituisci OK
  IF EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = v_uid AND s.status IN ('active', 'trialing')) THEN
    RETURN jsonb_build_object('status','ok','already_active',true);
  END IF;

  -- Disattiva eventuali abbonamenti attivi rimasti (sanity)
  UPDATE subscriptions
     SET status = 'canceled', updated_at = now()
   WHERE user_id = v_uid AND status IN ('active', 'trialing');

  -- Crea FREE attivo
  INSERT INTO subscriptions (user_id, tier, status, start_date, provider, created_at, updated_at)
  VALUES (
    v_uid,
    'FREE',
    'active',
    now(),
    'internal',
    now(),
    now()
  );

  -- Risposta
  RETURN jsonb_build_object(
    'status','ok',
    'plan','FREE',
    'active',true
  );
END
$$;

-- 3) Permessi di esecuzione per utenti loggati
GRANT EXECUTE ON FUNCTION public.create_free_subscription() TO authenticated;

-- 4) Policy di sola lettura per l'utente sulle proprie subscriptions (se non esiste)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname='public' AND tablename='subscriptions' AND policyname='sub_read_own'
  ) THEN
    CREATE POLICY sub_read_own ON public.subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END$$;

-- Test della funzione creata
SELECT 
  (SELECT 1 FROM pg_proc WHERE proname='create_free_subscription') AS fn_exists,
  has_function_privilege('authenticated', 'public.create_free_subscription()', 'EXECUTE') AS auth_can_exec;