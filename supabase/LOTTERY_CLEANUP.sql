-- ═══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY CLEANUP — ESEGUI PRIMA DELLA MIGRAZIONE COMPLETA
-- Rimuove eventuali oggetti parzialmente creati
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Drop funzioni (se esistono)
DROP FUNCTION IF EXISTS public.buy_lottery_tickets(UUID, INT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_lottery_status(UUID);
DROP FUNCTION IF EXISTS public.get_active_lottery_cycle();
DROP FUNCTION IF EXISTS public.get_user_lottery_tickets(UUID);
DROP FUNCTION IF EXISTS public.finalize_cycle_and_draw(UUID, TEXT);
DROP FUNCTION IF EXISTS public.cancel_lottery_cycle(UUID, TEXT);

-- 2. Drop tabelle (in ordine per le FK)
DROP TABLE IF EXISTS public.lottery_draws CASCADE;
DROP TABLE IF EXISTS public.lottery_audit_logs CASCADE;
DROP TABLE IF EXISTS public.lottery_purchases CASCADE;
DROP TABLE IF EXISTS public.lottery_tickets CASCADE;
DROP TABLE IF EXISTS public.mission_cycles CASCADE;

-- 3. Conferma
SELECT 'CLEANUP COMPLETATO ✅ - Ora esegui FULL_LOTTERY_MIGRATION.sql' AS messaggio;

