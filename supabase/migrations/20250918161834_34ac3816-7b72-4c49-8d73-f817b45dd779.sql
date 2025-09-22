-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Verifica e aggiorna ENUM reward_type se necessario
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_type') THEN
    CREATE TYPE reward_type AS ENUM ('BUZZ_FREE','MESSAGE','XP_POINTS','EVENT_TICKET','BADGE');
  END IF;
END $$;

-- Verifica e crea policy RLS per markers se mancante
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='markers' AND policyname='markers_read_auth'
  ) THEN
    CREATE POLICY markers_read_auth
    ON public.markers FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Test inserimento ENUM per verificare funzionamento
INSERT INTO public.markers (title, lat, lng, active, reward_type)
VALUES ('TEST_ENUM_DEBUG', 45.0, 9.0, true, 'BUZZ_FREE'::reward_type)
ON CONFLICT DO NOTHING;