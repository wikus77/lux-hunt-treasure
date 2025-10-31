-- docs/sql-migrations/20251031_007_set_founder_mcp.sql
-- Forza grado MCP al fondatore + audit coerenza
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

DO $$
DECLARE
  v_user_id uuid;
  v_mcp_id  int;
  v_current_rank_id int;
BEGIN
  -- 1) Risolve utente by email
  SELECT u.id INTO v_user_id 
  FROM auth.users u
  WHERE u.email = 'wikus77@hotmail.it' 
  LIMIT 1;
  
  -- Fallback by agent_code se email non trovata
  IF v_user_id IS NULL THEN
    SELECT p.id INTO v_user_id
    FROM profiles p
    WHERE p.agent_code = 'AG-X0197'
    LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Founder profile not found by email/referral.';
  END IF;

  -- 2) Id grado MCP (SRC-∞)
  SELECT id INTO v_mcp_id FROM agent_ranks WHERE code = 'SRC-∞' LIMIT 1;
  IF v_mcp_id IS NULL THEN
    RAISE EXCEPTION 'MCP rank (SRC-∞) not found in agent_ranks.';
  END IF;

  -- 3) Get current rank_id before update
  SELECT rank_id INTO v_current_rank_id FROM profiles WHERE id = v_user_id;

  -- 4) Forza PE e grado
  UPDATE profiles
  SET pulse_energy   = GREATEST(pulse_energy, 1000000000),
      rank_id        = v_mcp_id,
      rank_updated_at = NOW(),
      updated_at     = NOW()
  WHERE id = v_user_id;

  -- 5) Storico (insert only if rank changed)
  IF v_current_rank_id IS NULL OR v_current_rank_id != v_mcp_id THEN
    INSERT INTO rank_history (user_id, from_rank_id, to_rank_id, delta_pe, source, meta)
    VALUES (
      v_user_id,
      v_current_rank_id,
      v_mcp_id,
      1000000000,
      'founder_grant',
      jsonb_build_object('by','system','note','Founder MCP assignment')
    );
  END IF;

  RAISE NOTICE 'Founder promoted to MCP (SRC-∞): user_id=%, pe>=1B', v_user_id;
END$$;

-- (Facoltativo) Hardening lettura ranks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='agent_ranks' AND policyname='agent_ranks_public_read'
  ) THEN
    CREATE POLICY agent_ranks_public_read ON public.agent_ranks FOR SELECT USING (true);
  END IF;
END$$;

-- POST-RUN VERIFICATION (run manually after migration):
-- SELECT p.email, p.agent_code, p.pulse_energy, ar.code, ar.name_it
-- FROM profiles p
-- JOIN agent_ranks ar ON ar.id = p.rank_id
-- WHERE p.email = 'wikus77@hotmail.it' OR p.agent_code = 'AG-X0197';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
