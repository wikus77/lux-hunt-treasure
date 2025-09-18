-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Add Supabase secrets for Edge Functions
DO $$
BEGIN
  -- Verificare se i secrets sono configurati correttamente
  RAISE NOTICE 'Per completare la configurazione, aggiungi questi secrets nelle Edge Functions:';
  RAISE NOTICE 'SUPABASE_URL = https://vkjrqirvdvjbemsfzxof.supabase.co';
  RAISE NOTICE 'SUPABASE_SERVICE_ROLE_KEY = <service_role_key>';
  RAISE NOTICE 'Quindi redeploy la function create-random-markers';
END $$;

-- Verificare schema ENUM reward_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_type') THEN
    CREATE TYPE reward_type AS ENUM ('BUZZ_FREE','MESSAGE','XP_POINTS','EVENT_TICKET','BADGE');
    RAISE NOTICE 'Created reward_type ENUM';
  ELSE
    RAISE NOTICE 'reward_type ENUM already exists';
  END IF;
END $$;

-- Test ENUM insertion
INSERT INTO public.markers (title, lat, lng, active, reward_type)
VALUES ('TEST_ENUM_DEBUG', 45.0, 9.0, true, 'BUZZ_FREE'::reward_type)
ON CONFLICT DO NOTHING
RETURNING id, reward_type, created_at;

-- Ensure RLS policy for authenticated users to read markers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'markers' 
    AND policyname = 'markers_read_auth'
  ) THEN
    CREATE POLICY markers_read_auth
    ON public.markers
    FOR SELECT
    TO authenticated
    USING (true);
    RAISE NOTICE 'Created markers_read_auth policy';
  ELSE
    RAISE NOTICE 'markers_read_auth policy already exists';
  END IF;
END $$;