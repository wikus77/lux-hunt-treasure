-- ═══════════════════════════════════════════════════════════════════════════════
-- DIAGNOSI FORENSE ERRORE 400 - LOTTERIA
-- Esegui TUTTO questo SQL e inviami l'output completo
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. STRUTTURA lottery_purchases (cerca colonne GENERATED o NOT NULL senza default)
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  is_generated,
  generation_expression
FROM information_schema.columns 
WHERE table_name = 'lottery_purchases' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. STRUTTURA lottery_tickets
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  is_generated
FROM information_schema.columns 
WHERE table_name = 'lottery_tickets' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. CONSTRAINTS su lottery_purchases
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'lottery_purchases' AND tc.table_schema = 'public';

-- 4. VERIFICA FUNZIONE ESISTE
SELECT 
  routine_name,
  data_type AS return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'buy_lottery_tickets';

-- 5. VERIFICA PARAMETRI FUNZIONE
SELECT 
  p.parameter_name,
  p.data_type,
  p.parameter_mode,
  p.ordinal_position
FROM information_schema.parameters p
JOIN information_schema.routines r ON p.specific_name = r.specific_name
WHERE r.routine_name = 'buy_lottery_tickets' AND r.routine_schema = 'public'
ORDER BY p.ordinal_position;

-- 6. VERIFICA CICLO ATTIVO
SELECT 
  id, 
  status, 
  ticket_price_m1u,
  max_tickets_per_user,
  total_tickets,
  starts_at,
  ends_at,
  now() BETWEEN starts_at AND ends_at AS is_within_dates
FROM public.mission_cycles 
WHERE status = 'active';

-- 7. TRIGGER su lottery_purchases
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'lottery_purchases';

-- 8. RLS POLICIES su lottery_purchases
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'lottery_purchases';

-- 9. TEST MANUALE INSERT (simula cosa fa la funzione)
-- Questo fallirà se c'è un problema con la tabella
DO $$
DECLARE
  v_test_id UUID;
BEGIN
  -- Prova insert senza total_m1u
  INSERT INTO public.lottery_purchases (
    cycle_id, 
    user_id, 
    tickets_count, 
    unit_price_m1u, 
    source, 
    status
  )
  VALUES (
    (SELECT id FROM public.mission_cycles WHERE status = 'active' LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid, -- fake user
    1,
    10,
    'test',
    'test'
  )
  RETURNING id INTO v_test_id;
  
  -- Se arrivi qui, l'insert funziona
  RAISE NOTICE 'INSERT OK - ID: %', v_test_id;
  
  -- Cancella il record di test
  DELETE FROM public.lottery_purchases WHERE id = v_test_id;
  RAISE NOTICE 'Test record deleted';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRORE INSERT: % - %', SQLSTATE, SQLERRM;
END $$;

SELECT 'DIAGNOSI COMPLETATA - Invia questo output!' AS status;

