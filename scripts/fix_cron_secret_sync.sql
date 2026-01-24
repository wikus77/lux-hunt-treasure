-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FIX COMPLETO: CRON_SECRET Single Source of Truth
-- 
-- ESEGUI IN: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/sql/new
-- 
-- PREREQUISITO: Prima di eseguire, assicurati che CRON_SECRET in Edge Function env
-- sia impostato a: c0585c71cb3fc28a7cb72edc309ff80fb88dd6832f3e6281453faa9a7fc9e322
-- (Dashboard → Edge Functions → auto-push-cron → Secrets)

-- ================================================================
-- STEP 1: Aggiungi colonna cron_secret se non esiste
-- ================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auto_push_config' 
    AND column_name = 'cron_secret'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.auto_push_config 
    ADD COLUMN cron_secret text;
    RAISE NOTICE 'Colonna cron_secret aggiunta a auto_push_config';
  ELSE
    RAISE NOTICE 'Colonna cron_secret già esistente';
  END IF;
END $$;

-- ================================================================
-- STEP 2: Imposta il valore canonico del secret
-- IMPORTANTE: Questo valore DEVE corrispondere a CRON_SECRET in Edge Function
-- ================================================================
UPDATE public.auto_push_config 
SET cron_secret = 'c0585c71cb3fc28a7cb72edc309ff80fb88dd6832f3e6281453faa9a7fc9e322'
WHERE id IS NOT NULL;

-- Verifica
SELECT 
  'Secret impostato' as status,
  LEFT(cron_secret, 8) || '...' || RIGHT(cron_secret, 4) as cron_secret_masked
FROM auto_push_config LIMIT 1;

-- ================================================================
-- STEP 3: Ricrea la funzione invoke_auto_push_cron
-- Legge il secret dalla tabella (non più hardcoded)
-- ================================================================
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron();
DROP FUNCTION IF EXISTS public.invoke_auto_push_cron(jsonb);

CREATE OR REPLACE FUNCTION public.invoke_auto_push_cron(p_body jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_id bigint;
  v_cron_secret text;
  v_url text := 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/auto-push-cron';
BEGIN
  -- 🔑 LEGGI SECRET DALLA TABELLA (single source of truth)
  SELECT cron_secret INTO v_cron_secret
  FROM auto_push_config
  LIMIT 1;

  IF v_cron_secret IS NULL OR v_cron_secret = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CRON_SECRET non configurato in auto_push_config',
      'timestamp', now()
    );
  END IF;

  -- 📡 CHIAMA EDGE FUNCTION via pg_net
  SELECT net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', v_cron_secret
    ),
    body := COALESCE(p_body, jsonb_build_object('trigger', 'cron', 'dryRun', false))
  ) INTO request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Auto-push cron invoked (secret from config table)',
    'timestamp', now()
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'timestamp', now()
  );
END;
$$;

-- ================================================================
-- STEP 4: Grant permissions
-- ================================================================
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.invoke_auto_push_cron(jsonb) TO service_role;

COMMENT ON FUNCTION public.invoke_auto_push_cron(jsonb) IS 
'Invokes auto-push-cron Edge Function. Secret read from auto_push_config.cron_secret. Updated 2026-01-23.';

-- ================================================================
-- STEP 5: Verifica la funzione creata
-- ================================================================
SELECT 
  proname as function_name,
  prosrc LIKE '%auto_push_config%' as reads_from_config,
  'Funzione ricreata con successo' as status
FROM pg_proc 
WHERE proname = 'invoke_auto_push_cron';

-- ================================================================
-- STEP 6: TEST - Simula chiamata cron (DRY RUN)
-- Decommenta ed esegui per testare
-- ================================================================
-- SELECT public.invoke_auto_push_cron(
--   jsonb_build_object('trigger', 'test', 'dryRun', true, 'bypassQuietHours', true)
-- );

-- Poi controlla Edge Function logs per verificare:
-- - Status: 200
-- - Log: "Auth check passed (method: cron_secret)"

-- ================================================================
-- RIEPILOGO
-- ================================================================
SELECT 
  'FIX COMPLETATO' as status,
  'Ora la funzione legge il secret dalla tabella auto_push_config' as description,
  'Per rotare il secret: UPDATE auto_push_config SET cron_secret = ''nuovo_secret''; + aggiorna Edge env' as rotation_note;
