-- ============================================================================
-- RISIKO DOMINATION — RPC Functions
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- SCOPO: API per leggere e gestire stato dominio
-- ROLLBACK: DROP FUNCTION <nome>;
-- ============================================================================

-- ============================================================================
-- 1. RPC: get_country_domination_state
-- Ritorna stato dominio di tutti i paesi conquistati/contested
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_country_domination_state()
RETURNS TABLE (
  country_code CHAR(2),
  owner_id UUID,
  owner_name TEXT,
  owner_agent_code TEXT,
  win_progress INTEGER,
  conquest_threshold INTEGER,
  status TEXT,
  conquered_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.country_code,
    cd.owner_id,
    COALESCE(p.full_name, p.username, p.agent_code, 'Agent') as owner_name,
    p.agent_code as owner_agent_code,
    cd.win_progress,
    cd.conquest_threshold,
    cd.status,
    cd.conquered_at
  FROM country_domination cd
  LEFT JOIN profiles p ON p.id = cd.owner_id
  WHERE cd.status IN ('contested', 'conquered')
  ORDER BY cd.status DESC, cd.win_progress DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_country_domination_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_country_domination_state() TO anon;

-- ============================================================================
-- 2. RPC: get_user_domination_stats
-- Statistiche dominio per un utente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_domination_stats(p_user_id UUID)
RETURNS TABLE (
  countries_owned INTEGER,
  countries_contested INTEGER,
  total_wins INTEGER,
  continents_owned TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owned_countries TEXT[];
  v_continents TEXT[];
BEGIN
  -- Paesi posseduti
  SELECT ARRAY_AGG(country_code) INTO v_owned_countries
  FROM country_domination
  WHERE owner_id = p_user_id AND status = 'conquered';
  
  -- Verifica continenti completi
  SELECT ARRAY_AGG(DISTINCT cc.continent_code) INTO v_continents
  FROM continent_countries cc
  WHERE NOT EXISTS (
    SELECT 1 FROM continent_countries cc2
    WHERE cc2.continent_code = cc.continent_code
    AND cc2.country_code NOT IN (
      SELECT cd.country_code 
      FROM country_domination cd 
      WHERE cd.owner_id = p_user_id AND cd.status = 'conquered'
    )
  );
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM country_domination WHERE owner_id = p_user_id AND status = 'conquered'),
    (SELECT COUNT(*)::INTEGER FROM country_domination WHERE owner_id = p_user_id AND status = 'contested'),
    (SELECT COUNT(*)::INTEGER FROM country_battle_wins WHERE winner_id = p_user_id AND is_valid_for_domination = true),
    COALESCE(v_continents, ARRAY[]::TEXT[]);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_domination_stats(UUID) TO authenticated;

-- ============================================================================
-- 3. RPC: award_domination_reward
-- Assegna reward PE in modo idempotente
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_domination_reward(
  p_user_id UUID,
  p_reward_type TEXT,
  p_country_code CHAR(2) DEFAULT NULL,
  p_continent_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pe_amount INTEGER;
  v_result JSONB;
  v_already_awarded BOOLEAN := false;
BEGIN
  -- Determina importo PE
  CASE p_reward_type
    WHEN 'country' THEN v_pe_amount := 1000;
    WHEN 'three_countries' THEN v_pe_amount := 3000;
    WHEN 'continent' THEN v_pe_amount := 10000;
    ELSE RAISE EXCEPTION 'Invalid reward type: %', p_reward_type;
  END CASE;
  
  -- Verifica se già assegnato oggi (idempotenza)
  SELECT EXISTS(
    SELECT 1 FROM domination_rewards
    WHERE user_id = p_user_id
    AND reward_type = p_reward_type
    AND DATE_TRUNC('day', awarded_at) = DATE_TRUNC('day', NOW())
    AND (
      (p_reward_type = 'country' AND country_code = p_country_code) OR
      (p_reward_type = 'continent' AND continent_code = p_continent_code) OR
      (p_reward_type = 'three_countries')
    )
  ) INTO v_already_awarded;
  
  IF v_already_awarded THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_awarded_today',
      'pe_amount', 0
    );
  END IF;
  
  -- Inserisci record reward
  INSERT INTO domination_rewards (user_id, reward_type, country_code, continent_code, pe_amount)
  VALUES (p_user_id, p_reward_type, p_country_code, p_continent_code, v_pe_amount);
  
  -- Assegna PE usando funzione esistente
  SELECT award_pulse_energy(
    p_user_id,
    v_pe_amount,
    'domination_' || p_reward_type,
    jsonb_build_object(
      'country_code', p_country_code,
      'continent_code', p_continent_code
    )
  ) INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'reward_type', p_reward_type,
    'pe_amount', v_pe_amount,
    'pe_result', v_result
  );
  
EXCEPTION WHEN unique_violation THEN
  -- Già assegnato (race condition)
  RETURN jsonb_build_object(
    'success', false,
    'reason', 'duplicate_prevented',
    'pe_amount', 0
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_domination_reward(UUID, TEXT, CHAR, TEXT) TO authenticated;

-- ============================================================================
-- 4. RPC: check_and_award_domination_bonuses
-- Verifica e assegna bonus per 3 paesi e continenti
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_and_award_domination_bonuses(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_countries_count INTEGER;
  v_completed_continents TEXT[];
  v_result JSONB := '{"bonuses": []}'::jsonb;
  v_bonus_result JSONB;
  v_continent TEXT;
BEGIN
  -- Conta paesi conquistati
  SELECT COUNT(*) INTO v_countries_count
  FROM country_domination
  WHERE owner_id = p_user_id AND status = 'conquered';
  
  -- Bonus 3 paesi
  IF v_countries_count >= 3 THEN
    SELECT award_domination_reward(p_user_id, 'three_countries') INTO v_bonus_result;
    IF (v_bonus_result->>'success')::boolean THEN
      v_result := jsonb_set(v_result, '{bonuses}', 
        (v_result->'bonuses') || jsonb_build_object('type', 'three_countries', 'pe', 3000));
    END IF;
  END IF;
  
  -- Verifica continenti completi
  FOR v_continent IN
    SELECT DISTINCT cc.continent_code
    FROM continent_countries cc
    WHERE NOT EXISTS (
      SELECT 1 FROM continent_countries cc2
      WHERE cc2.continent_code = cc.continent_code
      AND cc2.country_code NOT IN (
        SELECT cd.country_code 
        FROM country_domination cd 
        WHERE cd.owner_id = p_user_id AND cd.status = 'conquered'
      )
    )
  LOOP
    SELECT award_domination_reward(p_user_id, 'continent', NULL, v_continent) INTO v_bonus_result;
    IF (v_bonus_result->>'success')::boolean THEN
      v_result := jsonb_set(v_result, '{bonuses}', 
        (v_result->'bonuses') || jsonb_build_object('type', 'continent', 'continent', v_continent, 'pe', 10000));
    END IF;
  END LOOP;
  
  v_result := jsonb_set(v_result, '{countries_owned}', to_jsonb(v_countries_count));
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_award_domination_bonuses(UUID) TO authenticated;

-- ============================================================================
-- COMMENTI
-- ============================================================================
COMMENT ON FUNCTION public.get_country_domination_state() IS 
  'Ritorna stato dominio di tutti i paesi contested/conquered per overlay mappa';

COMMENT ON FUNCTION public.get_user_domination_stats(UUID) IS 
  'Statistiche dominio per un utente: paesi, continenti, vittorie';

COMMENT ON FUNCTION public.award_domination_reward(UUID, TEXT, CHAR, TEXT) IS 
  'Assegna reward PE idempotente per conquista';

-- ============================================================================
-- ROLLBACK SCRIPT (commentato)
-- ============================================================================
-- DROP FUNCTION IF EXISTS public.check_and_award_domination_bonuses(UUID);
-- DROP FUNCTION IF EXISTS public.award_domination_reward(UUID, TEXT, CHAR, TEXT);
-- DROP FUNCTION IF EXISTS public.get_user_domination_stats(UUID);
-- DROP FUNCTION IF EXISTS public.get_country_domination_state();
-- ============================================================================

