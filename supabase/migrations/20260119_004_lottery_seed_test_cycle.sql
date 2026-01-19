-- ══════════════════════════════════════════════════════════════════════════════
-- M1SSION™ LOTTERY SYSTEM — SEED TEST CYCLE
-- Date: 2026-01-19
-- © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- CREA UN CICLO DI TEST INIZIALE PER SVILUPPO
-- ══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- Crea ciclo di test (30 giorni da oggi)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.mission_cycles (
  starts_at,
  ends_at,
  status,
  ticket_price_m1u,
  min_tickets_required,
  max_tickets_per_user,
  prizes_json,
  created_by
)
VALUES (
  now(),
  now() + interval '30 days',
  'active',
  10,                                    -- 10 M1U per ticket
  4000,                                  -- Soglia minima
  100,                                   -- Max per utente
  '[
    {"rank": 1, "percent": 50, "label": "1° Premio - Il Grande Vincitore"},
    {"rank": 2, "percent": 30, "label": "2° Premio - Il Secondo"},
    {"rank": 3, "percent": 20, "label": "3° Premio - Il Terzo"}
  ]'::jsonb,
  NULL                                   -- Creato da sistema
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Log creazione
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_cycle_id UUID;
BEGIN
  SELECT id INTO v_cycle_id FROM public.mission_cycles WHERE status = 'active' LIMIT 1;
  
  IF v_cycle_id IS NOT NULL THEN
    INSERT INTO public.lottery_audit_logs (
      cycle_id, event_type, event_details
    )
    VALUES (
      v_cycle_id,
      'cycle_created',
      jsonb_build_object(
        'source', 'seed_migration',
        'note', 'Test cycle created for development'
      )
    );
    
    RAISE NOTICE 'Test lottery cycle created: %', v_cycle_id;
  END IF;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
-- ══════════════════════════════════════════════════════════════════════════════
-- © 2026 Joseph MULÉ – M1SSION™ – LOTTERY TEST SEED v1.0
-- ══════════════════════════════════════════════════════════════════════════════

