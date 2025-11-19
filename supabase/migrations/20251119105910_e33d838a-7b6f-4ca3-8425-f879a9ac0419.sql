-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix BUZZ MAP: Creazione RPC mancanti per calcolo livello e spesa M1U

-- ============================================
-- 1) RPC: m1_get_next_buzz_level
-- Calcola il prossimo livello, raggio e costo M1U per BUZZ MAP
-- ============================================
CREATE OR REPLACE FUNCTION public.m1_get_next_buzz_level(p_user_id UUID)
RETURNS TABLE(level INT, radius_km FLOAT, cost_m1u INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_level_arrays INT[] := ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60];
  v_radius_arrays FLOAT[] := ARRAY[500,460,430,400,370,345,320,300,285,270,255,240,225,210,195,180,170,160,150,140,130,120,115,110,105,100,95,90,85,80,76,72,68,64,60,56,52,48,44,40,37,34,31,28,25,22,20,18,16,14,12,11,10,9,8,7,6,5,5,5];
  v_cost_arrays INT[] := ARRAY[4,5,6,7,8,9,9,9,9,9,14,15,16,17,18,19,29,30,31,32,33,34,49,50,55,59,69,79,89,99,119,199,249,299,349,399,449,499,549,599,699,799,899,999,1099,1199,1299,1399,1499,1599,1799,1999,2499,2999,3499,3999,4999,6999,8999,14999];
  v_idx INT;
BEGIN
  -- Conta quante aree BUZZ MAP ha già creato l'utente
  SELECT COUNT(*) INTO v_count
  FROM public.user_map_areas
  WHERE user_id = p_user_id AND source = 'buzz_map';
  
  -- Calcola l'indice (1-based, max 60)
  v_idx := LEAST(v_count + 1, 60);
  
  -- Ritorna livello, raggio e costo corrispondenti
  RETURN QUERY SELECT 
    v_level_arrays[v_idx],
    v_radius_arrays[v_idx],
    v_cost_arrays[v_idx];
END;
$$;

GRANT EXECUTE ON FUNCTION public.m1_get_next_buzz_level(UUID) TO authenticated;

-- ============================================
-- 2) RPC: buzz_map_spend_m1u
-- Sottrae M1U, crea area in user_map_areas, ritorna area_id
-- ============================================
CREATE OR REPLACE FUNCTION public.buzz_map_spend_m1u(
  p_user_id UUID,
  p_cost_m1u INT,
  p_latitude FLOAT,
  p_longitude FLOAT,
  p_radius_km FLOAT
)
RETURNS TABLE(area_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
  v_new_area_id UUID;
  v_week INT;
BEGIN
  -- Verifica saldo M1U dell'utente
  SELECT m1_units INTO v_balance FROM public.profiles WHERE id = p_user_id;
  
  IF v_balance IS NULL OR v_balance < p_cost_m1u THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Saldo M1U insufficiente';
    RETURN;
  END IF;
  
  -- Sottrai M1U dal saldo
  UPDATE public.profiles 
  SET m1_units = m1_units - p_cost_m1u 
  WHERE id = p_user_id;
  
  -- Calcola settimana corrente
  v_week := EXTRACT(WEEK FROM NOW());
  
  -- Crea nuova area in user_map_areas
  INSERT INTO public.user_map_areas (
    user_id, lat, lng, radius_km, week, source
  ) VALUES (
    p_user_id, p_latitude, p_longitude, p_radius_km, v_week, 'buzz_map'
  ) RETURNING id INTO v_new_area_id;
  
  -- Ritorna l'ID della nuova area
  RETURN QUERY SELECT v_new_area_id, TRUE, 'Area creata con successo';
END;
$$;

GRANT EXECUTE ON FUNCTION public.buzz_map_spend_m1u(UUID, INT, FLOAT, FLOAT, FLOAT) TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™