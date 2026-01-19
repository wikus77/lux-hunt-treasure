-- ═══════════════════════════════════════════════════════════════════════════════
-- SYNC LOTTERY CYCLE WITH MISSION DEADLINE
-- Sincronizza il ciclo della lotteria con la fine della missione corrente
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Verifica il ciclo attuale
SELECT 
  id,
  status,
  starts_at,
  ends_at,
  (ends_at - now()) as time_remaining,
  total_tickets,
  min_tickets_required
FROM public.mission_cycles
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 1;

-- Step 2: La MISSION DEADLINE è: 30 gennaio 2026 alle 23:59:59 (11 giorni da oggi 19 gennaio 2026)
-- Aggiorna il ciclo attivo per finire con la missione

UPDATE public.mission_cycles
SET 
  ends_at = '2026-01-30T23:59:59.000Z'::timestamptz,
  updated_at = now()
WHERE status = 'active';

-- Step 3: Verifica l'aggiornamento
SELECT 
  id,
  status,
  starts_at,
  ends_at,
  EXTRACT(DAY FROM (ends_at - now())) as days_remaining,
  EXTRACT(HOUR FROM (ends_at - now())) as hours_remaining,
  total_tickets,
  min_tickets_required
FROM public.mission_cycles
WHERE status = 'active';

-- Output conferma
SELECT 'Ciclo lotteria sincronizzato con la missione! ✅' as status;

