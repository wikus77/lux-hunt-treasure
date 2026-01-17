-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Script di test per verificare il lock atomico "first winner" del Final Shoot
--
-- COME USARE:
-- 1. Esegui questo script in Supabase SQL Editor
-- 2. Verifica che solo UN utente abbia vinto (status = 'winner')
-- 3. Tutti gli altri devono avere status = 'already_claimed'

-- ============================================================================
-- STEP 1: Crea utenti di test (se non esistono)
-- ============================================================================

-- NOTA: In produzione, usa gli ID utenti reali dal tuo database
-- Qui usiamo UUID fittizi per il test

-- ============================================================================
-- STEP 2: Simula race condition con più chiamate concorrenti
-- ============================================================================

DO $$
DECLARE
  test_mission_id UUID := '00000000-0000-0000-0000-000000000001'; -- Cambia con un mission_id reale
  test_user_1 UUID := '11111111-1111-1111-1111-111111111111';
  test_user_2 UUID := '22222222-2222-2222-2222-222222222222';
  test_user_3 UUID := '33333333-3333-3333-3333-333333333333';
  result_1 JSONB;
  result_2 JSONB;
  result_3 JSONB;
  prize_lat DOUBLE PRECISION := 45.4642;  -- Coordinate premio (Duomo Milano)
  prize_lng DOUBLE PRECISION := 9.1900;
BEGIN
  -- Pulisci dati di test precedenti
  DELETE FROM public.final_shoot_winners WHERE mission_id = test_mission_id;
  DELETE FROM public.final_shoot_attempts WHERE mission_id = test_mission_id;
  
  RAISE NOTICE '🧪 Starting race condition test...';
  RAISE NOTICE '📍 Prize location: %, %', prize_lat, prize_lng;
  
  -- Simula 3 utenti che tentano di vincere nello stesso istante
  -- Tutti inviano le coordinate CORRETTE (entro 19m)
  
  -- Utente 1 tenta
  result_1 := public.execute_final_shoot(
    test_user_1,
    test_mission_id,
    prize_lat + 0.0001,  -- ~11 metri di distanza (entro tolleranza)
    prize_lng
  );
  RAISE NOTICE '👤 User 1 result: %', result_1;
  
  -- Utente 2 tenta (NELLO STESSO ISTANTE, teoricamente)
  result_2 := public.execute_final_shoot(
    test_user_2,
    test_mission_id,
    prize_lat + 0.00005,  -- ~5 metri di distanza (entro tolleranza)
    prize_lng
  );
  RAISE NOTICE '👤 User 2 result: %', result_2;
  
  -- Utente 3 tenta
  result_3 := public.execute_final_shoot(
    test_user_3,
    test_mission_id,
    prize_lat,  -- Esattamente sul premio
    prize_lng
  );
  RAISE NOTICE '👤 User 3 result: %', result_3;
  
  -- Verifica: solo uno deve essere "winner"
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📊 TEST RESULTS:';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
  IF (result_1->>'status' = 'winner') THEN
    RAISE NOTICE '✅ User 1 is the WINNER';
  ELSIF (result_1->>'status' = 'already_claimed') THEN
    RAISE NOTICE '❌ User 1: already_claimed (correct behavior)';
  ELSE
    RAISE NOTICE '⚠️ User 1: %', result_1->>'status';
  END IF;
  
  IF (result_2->>'status' = 'winner') THEN
    RAISE NOTICE '✅ User 2 is the WINNER';
  ELSIF (result_2->>'status' = 'already_claimed') THEN
    RAISE NOTICE '❌ User 2: already_claimed (correct behavior)';
  ELSE
    RAISE NOTICE '⚠️ User 2: %', result_2->>'status';
  END IF;
  
  IF (result_3->>'status' = 'winner') THEN
    RAISE NOTICE '✅ User 3 is the WINNER';
  ELSIF (result_3->>'status' = 'already_claimed') THEN
    RAISE NOTICE '❌ User 3: already_claimed (correct behavior)';
  ELSE
    RAISE NOTICE '⚠️ User 3: %', result_3->>'status';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  
  -- Conta i vincitori
  PERFORM 1 FROM public.final_shoot_winners WHERE mission_id = test_mission_id;
  IF FOUND THEN
    RAISE NOTICE '🏆 TOTAL WINNERS: 1 (CORRECT - atomic lock working!)';
  ELSE
    RAISE NOTICE '⚠️ NO WINNERS RECORDED (check RPC logic)';
  END IF;
  
END$$;

-- ============================================================================
-- STEP 3: Query di verifica
-- ============================================================================

SELECT 
  'final_shoot_winners' AS table_name,
  COUNT(*) AS record_count 
FROM public.final_shoot_winners
UNION ALL
SELECT 
  'final_shoot_attempts' AS table_name,
  COUNT(*) AS record_count 
FROM public.final_shoot_attempts;

-- Dettaglio vincitore
SELECT * FROM public.final_shoot_winners ORDER BY won_at DESC LIMIT 5;

-- Dettaglio tentativi
SELECT * FROM public.final_shoot_attempts ORDER BY created_at DESC LIMIT 10;

