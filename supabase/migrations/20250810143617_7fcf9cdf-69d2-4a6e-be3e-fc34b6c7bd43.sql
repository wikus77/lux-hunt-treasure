-- Deduplica qr_redemption_logs mantenendo la prima occorrenza
DO $$
DECLARE
  has_table BOOLEAN;
  has_created_at BOOLEAN := FALSE;
  order_clause TEXT;
  sql_text TEXT;
  deleted_count INTEGER := 0;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='qr_redemption_logs'
  ) INTO has_table;

  IF NOT has_table THEN
    RAISE NOTICE 'Table public.qr_redemption_logs not found, skipping.';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='qr_redemption_logs' AND column_name='created_at'
  ) INTO has_created_at;

  IF has_created_at THEN
    order_clause := 'created_at ASC NULLS LAST, id ASC';
  ELSE
    order_clause := 'id ASC';
  END IF;

  sql_text := format(
    'DELETE FROM public.qr_redemption_logs WHERE ctid IN (
       SELECT ctid FROM (
         SELECT ctid, ROW_NUMBER() OVER (
           PARTITION BY qr_code_id, user_id
           ORDER BY %s
         ) AS rn
         FROM public.qr_redemption_logs
       ) t WHERE rn > 1
     )', order_clause
  );

  EXECUTE sql_text;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Duplicate rows removed from qr_redemption_logs: %', deleted_count;
END$$;

-- Crea indice unico se non ci sono più duplicati
DO $$
DECLARE
  dup_count INTEGER := 0;
BEGIN
  PERFORM 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname='qr_redemption_logs';
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COUNT(*) INTO dup_count FROM (
    SELECT 1
    FROM public.qr_redemption_logs
    GROUP BY qr_code_id, user_id
    HAVING COUNT(*) > 1
  ) d;

  IF dup_count = 0 THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_redemptions_qr_user ON public.qr_redemption_logs(qr_code_id, user_id)';
  ELSE
    RAISE NOTICE 'TODO: Rimangono % duplicati, verificare dati prima di creare indice unico.', dup_count;
  END IF;
END$$;

-- Tenta VALIDATE CONSTRAINT della FK
DO $$
BEGIN
  PERFORM 1
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = rel.relnamespace
  WHERE n.nspname='public' AND rel.relname='qr_redemption_logs' AND con.conname='qr_redemption_logs_qr_fk';

  IF FOUND THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.qr_redemption_logs VALIDATE CONSTRAINT qr_redemption_logs_qr_fk';
      RAISE NOTICE 'FK validated successfully.';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'TODO: FK validation failed (righe orfane presenti). Pulire le righe con qr_code_id non presenti in public.qr_codes e riprovare.';
    END;
  END IF;
END$$;