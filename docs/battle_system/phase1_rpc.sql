-- FASE 1 - BATTLE SYSTEM RPC BASE
-- Implementazione start_battle minimale (senza economia completa)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- ============================================================================
-- HELPER FUNCTION: Genera seed deterministico per RNG audit
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_battle_seed(
  p_session_id uuid,
  p_attacker_id uuid,
  p_defender_id uuid,
  p_weapon_key text,
  p_version integer DEFAULT 1
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seed text;
  v_timestamp text;
BEGIN
  v_timestamp := extract(epoch from now())::text;
  v_seed := p_session_id::text || '|' || 
            p_attacker_id::text || '|' || 
            p_defender_id::text || '|' || 
            p_weapon_key || '|' || 
            v_timestamp || '|' || 
            p_version::text;
  
  RETURN encode(digest(v_seed, 'sha256'), 'hex');
END;
$$;

-- ============================================================================
-- HELPER FUNCTION: Verifica se utente è attackable
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_user_attackable(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_online boolean;
  v_stealth boolean;
  v_has_active_battle boolean;
BEGIN
  -- Verifica se l'utente è online (da agent_locations)
  SELECT EXISTS (
    SELECT 1 FROM public.agent_locations
    WHERE user_id = p_user_id
      AND status = 'online'
      AND last_seen >= now() - interval '5 minutes'
  ) INTO v_online;
  
  IF NOT v_online THEN
    RETURN false;
  END IF;
  
  -- Verifica stealth (assumiamo campo in profiles, da verificare con utente)
  -- Per ora: assume non in stealth se non esiste il campo
  v_stealth := false;
  
  IF v_stealth THEN
    RETURN false;
  END IF;
  
  -- Verifica se ha già una battaglia attiva come difensore
  SELECT EXISTS (
    SELECT 1 FROM public.battle_sessions
    WHERE defender_id = p_user_id
      AND status = 'await_defense'
  ) INTO v_has_active_battle;
  
  IF v_has_active_battle THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- HELPER FUNCTION: Verifica cooldown
-- ============================================================================
CREATE OR REPLACE FUNCTION public.has_active_cooldown(
  p_user_id uuid,
  p_cooldown_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_until timestamptz;
BEGIN
  SELECT until_ts INTO v_until
  FROM public.user_cooldowns
  WHERE user_id = p_user_id
    AND cooldown_key = p_cooldown_key
    AND until_ts > now();
  
  RETURN v_until IS NOT NULL;
END;
$$;

-- ============================================================================
-- MAIN RPC: start_battle (versione base FASE 1)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.start_battle(
  p_defender_id uuid,
  p_weapon_key text,
  p_client_nonce text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attacker_id uuid;
  v_session_id uuid;
  v_weapon record;
  v_expires_at timestamptz;
  v_audit_seed text;
  v_has_active_battle boolean;
  v_cooldown_key text;
  v_nonce text;
BEGIN
  -- 1. Identifica attaccante
  v_attacker_id := auth.uid();
  
  IF v_attacker_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF v_attacker_id = p_defender_id THEN
    RAISE EXCEPTION 'Cannot attack yourself';
  END IF;
  
  -- 2. Verifica che difensore sia attackable
  IF NOT public.is_user_attackable(p_defender_id) THEN
    RAISE EXCEPTION 'Target is not attackable (offline, in stealth, or busy)';
  END IF;
  
  -- 3. Verifica che attaccante non abbia già battaglia attiva
  SELECT EXISTS (
    SELECT 1 FROM public.battle_sessions
    WHERE attacker_id = v_attacker_id
      AND status = 'await_defense'
  ) INTO v_has_active_battle;
  
  IF v_has_active_battle THEN
    RAISE EXCEPTION 'You already have an active battle';
  END IF;
  
  -- 4. Verifica arma nel catalogo
  SELECT * INTO v_weapon
  FROM public.weapons_catalog
  WHERE key = p_weapon_key
    AND enabled = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or disabled weapon: %', p_weapon_key;
  END IF;
  
  -- 5. Verifica cooldown arma
  v_cooldown_key := 'weapon:' || p_weapon_key;
  IF public.has_active_cooldown(v_attacker_id, v_cooldown_key) THEN
    RAISE EXCEPTION 'Weapon is on cooldown';
  END IF;
  
  -- 6. Verifica inventario (user_arsenal)
  -- FASE 1: assume arma disponibile, gestione inventario in FASE 2
  -- TODO FASE 2: decrementare quantity da user_arsenal
  
  -- 7. Verifica M1U (user_wallet)
  -- FASE 1: skip economia, gestione in FASE 2
  -- TODO FASE 2: addebitare m1u_cost da user_wallet via ledger
  
  -- 8. Genera ID sessione e seed audit
  v_session_id := gen_random_uuid();
  v_audit_seed := public.generate_battle_seed(
    v_session_id,
    v_attacker_id,
    p_defender_id,
    p_weapon_key,
    1
  );
  
  -- 9. Calcola scadenza (60 secondi)
  v_expires_at := now() + interval '60 seconds';
  
  -- 10. Genera nonce unico
  v_nonce := COALESCE(p_client_nonce, gen_random_uuid()::text);
  
  -- 11. Crea sessione battaglia
  INSERT INTO public.battle_sessions (
    id,
    attacker_id,
    defender_id,
    status,
    started_at,
    expires_at,
    weapon_key,
    audit_seed_hash,
    version
  ) VALUES (
    v_session_id,
    v_attacker_id,
    p_defender_id,
    'await_defense',
    now(),
    v_expires_at,
    p_weapon_key,
    v_audit_seed,
    1
  );
  
  -- 12. Registra azione attacco
  INSERT INTO public.battle_actions (
    session_id,
    user_id,
    role,
    action_type,
    item_key,
    energy_cost_m1u,
    nonce,
    result
  ) VALUES (
    v_session_id,
    v_attacker_id,
    'attacker',
    'attack',
    p_weapon_key,
    v_weapon.m1u_cost,
    v_nonce,
    jsonb_build_object(
      'weapon_power', v_weapon.power,
      'effect_key', v_weapon.effect_key
    )
  );
  
  -- 13. Imposta cooldown arma
  INSERT INTO public.user_cooldowns (user_id, cooldown_key, until_ts)
  VALUES (v_attacker_id, v_cooldown_key, now() + (v_weapon.cooldown_sec || ' seconds')::interval)
  ON CONFLICT (user_id, cooldown_key) 
  DO UPDATE SET until_ts = EXCLUDED.until_ts;
  
  -- 14. TODO FASE 2: Invia notifica push al difensore
  -- Riusare pipeline esistente (non toccare SW/FCM)
  
  -- 15. Return payload per UI
  RETURN jsonb_build_object(
    'success', true,
    'session_id', v_session_id,
    'expires_at', v_expires_at,
    'effect_key', v_weapon.effect_key,
    'weapon_name', v_weapon.name,
    'defender_id', p_defender_id,
    'message', 'Attack initiated! Waiting for defender response...'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error e ritorna payload errore
    RAISE NOTICE 'start_battle ERROR: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.start_battle TO authenticated;

-- ============================================================================
-- UTILITY RPC: get_my_battles (per UI)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_battles(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  session_id uuid,
  role text,
  opponent_id uuid,
  status text,
  weapon_key text,
  defense_key text,
  started_at timestamptz,
  expires_at timestamptz,
  ended_at timestamptz,
  winner_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    bs.id as session_id,
    CASE 
      WHEN bs.attacker_id = v_user_id THEN 'attacker'
      ELSE 'defender'
    END as role,
    CASE 
      WHEN bs.attacker_id = v_user_id THEN bs.defender_id
      ELSE bs.attacker_id
    END as opponent_id,
    bs.status,
    bs.weapon_key,
    bs.defense_key,
    bs.started_at,
    bs.expires_at,
    bs.ended_at,
    bs.winner_id
  FROM public.battle_sessions bs
  WHERE (bs.attacker_id = v_user_id OR bs.defender_id = v_user_id)
    AND (p_status IS NULL OR bs.status = p_status)
  ORDER BY bs.started_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_battles TO authenticated;

-- ============================================================================
-- UTILITY RPC: get_my_cooldowns (per UI)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_cooldowns()
RETURNS TABLE (
  cooldown_key text,
  until_ts timestamptz,
  seconds_remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    uc.cooldown_key,
    uc.until_ts,
    GREATEST(0, EXTRACT(EPOCH FROM (uc.until_ts - now()))::integer) as seconds_remaining
  FROM public.user_cooldowns uc
  WHERE uc.user_id = v_user_id
    AND uc.until_ts > now()
  ORDER BY uc.until_ts;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_cooldowns TO authenticated;

-- ============================================================================
-- UTILITY RPC: get_weapons_catalog (per UI)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_weapons_catalog()
RETURNS TABLE (
  weapon_key text,
  name text,
  description text,
  power numeric,
  m1u_cost numeric,
  cooldown_sec integer,
  effect_key text,
  min_rank integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    key as weapon_key,
    name,
    description,
    power,
    m1u_cost,
    cooldown_sec,
    effect_key,
    min_rank
  FROM public.weapons_catalog
  WHERE enabled = true
  ORDER BY min_rank, power;
$$;

GRANT EXECUTE ON FUNCTION public.get_weapons_catalog TO authenticated;

-- ============================================================================
-- FINE RPC FASE 1
-- ============================================================================

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
