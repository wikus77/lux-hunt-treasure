-- ============================================================================
-- READ-ONLY: Verifica schema public.user_notifications (PGRST204 notification_type)
-- Eseguire in Supabase SQL Editor (produzione). Nessuna modifica al DB.
-- ============================================================================

-- A1) Colonne reali
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_notifications'
ORDER BY ordinal_position;

-- A2) Esiste notification_type? (true/false)
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_notifications'
    AND column_name = 'notification_type'
) AS has_notification_type;

-- A3) Ultime 5 righe (created_at; se non esiste, usare la variante commentata)
SELECT *
FROM public.user_notifications
ORDER BY created_at DESC
LIMIT 5;

-- Se created_at non esiste, eseguire invece:
-- SELECT * FROM public.user_notifications ORDER BY id DESC LIMIT 5;
