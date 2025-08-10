-- Deduplica qr_redemption_logs e valida vincoli
DO $$
DECLARE
  has_table BOOLEAN;
  has_created_at BOOLEAN := FALSE;
  deleted_count INTEGER := 0;
  dup_exists BOOLEAN := FALSE;
  sql_text TEXT;
BEGIN
  -- Verifica esistenza tabella
  SELECT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='qr_redemption_logs'
  ) INTO has_table;

  IF NOT has_table THEN
    RAISE NOTICE 'Table public.qr_redemption_logs not found, skipping.';
    RETURN;
  END IF;

  -- Verifica presenza created_at
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='qr_redemption_logs' AND column_name='created_at'
  ) INTO has_created_at;

  -- Elimina duplicati mantenendo la prima occorrenza per (qr_code_id, user_id)
  IF has_created_at THEN
    sql_text := $$
      DELETE FROM public.qr_redemption_logs q
      USING (
        SELECT ctid
        FROM (
          SELECT ctid, ROW_NUMBER() OVER (
            PARTITION BY qr_code_id, user_id
            ORDER BY created_at ASC NULLS LAST, id ASC
          ) AS rn
          FROM public.qr_redemption_logs
        ) t
        WHERE t.rn > 1
      ) d
      WHERE q.ctid = d.ctid;
    $$;
  ELSE
    sql_text := $$
      DELETE FROM public.qr_redemption_logs q
      USING (
        SELECT ctid
        FROM (
          SELECT ctid, ROW_NUMBER() OVER (
            PARTITION BY qr_code_id, user_id
            ORDER BY id ASC
          ) AS rn
          FROM public.qr_redemption_logs
        ) t
        WHERE t.rn > 1
      ) d
      WHERE q.ctid = d.ctid;
    $$;
  END IF;

  EXECUTE sql_text;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Duplicate rows removed from qr_redemption_logs: %', deleted_count;

  -- Se non ci sono più duplicati, crea indice univoco
  SELECT EXISTS (
    SELECT 1 FROM (
      SELECT qr_code_id, user_id, COUNT(*) c
      FROM public.qr_redemption_logs
      GROUP BY 1,2
      HAVING COUNT(*) > 1
    ) dup
  ) INTO dup_exists;

  IF NOT dup_exists THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_qr_redemptions_qr_user ON public.qr_redemption_logs(qr_code_id, user_id)';
  ELSE
    RAISE NOTICE 'TODO: Ancora duplicati presenti su (qr_code_id, user_id); verificare dati anomali prima di creare indice unico.';
  END IF;
END$$;

-- Prova a VALIDARE la FK (se esiste); se fallisce, lascia TODO
DO $$
DECLARE
  has_fk BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE n.nspname='public' AND rel.relname='qr_redemption_logs' AND con.conname='qr_redemption_logs_qr_fk'
  ) INTO has_fk;

  IF has_fk THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.qr_redemption_logs VALIDATE CONSTRAINT qr_redemption_logs_qr_fk';
      RAISE NOTICE 'FK qr_redemption_logs_qr_fk validated successfully.';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'TODO: FK validation failed (probabili righe orfane). Pulire righe con qr_code_id inesistenti e rilanciare VALIDATE.';
    END;
  END IF;
END$$;