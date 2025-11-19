-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- SQL SETUP per marker rosso agente + geolocalizzazione
-- DA ESEGUIRE IN SUPABASE PRODUCTION

-- ============================================
-- 1) FUNZIONE RPC per aggiornare posizione agente
-- ============================================
CREATE OR REPLACE FUNCTION public.set_my_agent_location(
  p_lat double precision,
  p_lng double precision,
  p_accuracy double precision DEFAULT NULL,
  p_status text DEFAULT 'online'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert nella tabella user_locations
  INSERT INTO public.user_locations (user_id, lat, lng, accuracy, status, updated_at)
  VALUES (
    auth.uid(),
    p_lat,
    p_lng,
    p_accuracy,
    p_status,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    accuracy = EXCLUDED.accuracy,
    status = EXCLUDED.status,
    updated_at = NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.set_my_agent_location(double precision, double precision, double precision, text) TO authenticated;

-- ============================================
-- 2) VIEW di compatibilità per marker rosso
-- ============================================
CREATE OR REPLACE VIEW public.agent_locations AS
SELECT 
  l.user_id AS agent_id, 
  l.lat, 
  l.lng, 
  l.updated_at
FROM public.user_locations l;

CREATE OR REPLACE VIEW public.online_agents AS
SELECT 
  agent_id AS user_id, 
  lat, 
  lng, 
  updated_at,
  'online'::text AS status,
  updated_at AS last_seen,
  NULL::double precision AS accuracy
FROM public.agent_locations;

CREATE OR REPLACE VIEW public.v_online_agents AS
SELECT * FROM public.online_agents;

-- Grant permissions
GRANT SELECT ON public.agent_locations TO authenticated;
GRANT SELECT ON public.online_agents TO authenticated;
GRANT SELECT ON public.v_online_agents TO authenticated;

-- ============================================
-- 3) INDICE per performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_locations_updated_at
  ON public.user_locations(updated_at DESC);

-- ============================================
-- 4) VERIFICA (opzionale)
-- ============================================
-- Per testare la funzione dopo l'esecuzione:
-- SELECT public.set_my_agent_location(43.8129, 7.6099, NULL, 'online');
-- SELECT * FROM public.v_online_agents WHERE user_id = auth.uid();

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
