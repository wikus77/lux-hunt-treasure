-- =========================================================
-- M1SSION™ – Piano FREE backend FIXED (NO-TOUCH push) 
-- © 2025 Joseph Mulé – M1SSION™ – Tutti i diritti riservati
-- =========================================================

-- 1) Unique parziale: un solo FREE attivo per utente
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_free_active_per_user
ON public.subscriptions (user_id)
WHERE (status = 'active' AND (tier = 'free' OR tier = 'FREE'));

-- 2) Funzione per creare la sottoscrizione FREE senza Stripe
CREATE OR REPLACE FUNCTION public.create_free_subscription()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_now timestamptz := now();
  v_sub record;
BEGIN
  -- Utente chiamante
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Se ha già un abbonamento attivo (qualsiasi), non creare doppioni
  SELECT * INTO v_sub
  FROM public.subscriptions
  WHERE user_id = v_uid AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object('ok', true, 'already_active', true, 'subscription_id', v_sub.id);
  END IF;

  -- Crea FREE attivo
  INSERT INTO public.subscriptions (
    user_id, tier, status, provider, started_at, created_at, metadata
  ) VALUES (
    v_uid, 'free', 'active', 'internal', v_now, v_now,
    jsonb_build_object('source','create_free_subscription','note','piano free senza Stripe')
  )
  RETURNING id INTO v_sub;

  RETURN jsonb_build_object('ok', true, 'subscription_id', v_sub.id);
END
$$;

-- 3) Permessi minimi: consenti la chiamata agli utenti autenticati
REVOKE ALL ON FUNCTION public.create_free_subscription() FROM public;
GRANT EXECUTE ON FUNCTION public.create_free_subscription() TO authenticated;