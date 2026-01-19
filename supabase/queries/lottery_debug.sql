-- ═══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY DEBUG - Verifica stato migrazioni
-- Esegui questo SQL per capire cosa manca
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Verifica tabelle esistenti
SELECT 'TABELLE' AS check_type, table_name, 
       CASE WHEN table_name IS NOT NULL THEN '✅ ESISTE' ELSE '❌ MANCANTE' END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('mission_cycles', 'lottery_tickets', 'lottery_purchases', 'lottery_draws', 'lottery_audit_logs')
ORDER BY table_name;

-- 2. Verifica funzioni esistenti
SELECT 'FUNZIONI' AS check_type, routine_name,
       CASE WHEN routine_name IS NOT NULL THEN '✅ ESISTE' ELSE '❌ MANCANTE' END AS status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('buy_lottery_tickets', 'get_lottery_status', 'get_active_lottery_cycle', 
                       'get_user_lottery_tickets', 'finalize_cycle_and_draw', 'cancel_lottery_cycle')
ORDER BY routine_name;

-- 3. Verifica se esiste un ciclo attivo
SELECT 'CICLI ATTIVI' AS info, COUNT(*) AS count 
FROM public.mission_cycles 
WHERE status = 'active';

-- 4. Visualizza tutti i cicli
SELECT id, status, starts_at, ends_at, total_tickets, ticket_price_m1u
FROM public.mission_cycles
ORDER BY created_at DESC
LIMIT 5;

-- 5. Test diretto della funzione (per vedere l'errore esatto)
DO $$
BEGIN
  RAISE NOTICE 'Test get_active_lottery_cycle: %', public.get_active_lottery_cycle();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRORE: % - %', SQLSTATE, SQLERRM;
END;
$$;

