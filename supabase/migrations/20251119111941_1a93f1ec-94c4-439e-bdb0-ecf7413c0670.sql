-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Creazione tabella user_map_areas e fix RPC buzz_map_spend_m1u

-- 1. Crea tabella user_map_areas se non esiste
CREATE TABLE IF NOT EXISTS public.user_map_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION NOT NULL,
  week INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'buzz_map',
  level INTEGER,
  price_eur NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_user_map_areas_user_id ON public.user_map_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_map_areas_source ON public.user_map_areas(source);
CREATE INDEX IF NOT EXISTS idx_user_map_areas_created_at ON public.user_map_areas(created_at DESC);

-- RLS policies
ALTER TABLE public.user_map_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own map areas" ON public.user_map_areas;
CREATE POLICY "Users can view own map areas" 
  ON public.user_map_areas
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own map areas" ON public.user_map_areas;
CREATE POLICY "Users can insert own map areas" 
  ON public.user_map_areas
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Fix RPC buzz_map_spend_m1u - RIMUOVE INSERT, solo verifica/sottrae M1U
CREATE OR REPLACE FUNCTION public.buzz_map_spend_m1u(
  p_user_id UUID,
  p_cost_m1u INT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION
)
RETURNS TABLE(area_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
BEGIN
  -- Verifica saldo M1U
  SELECT m1_units INTO v_balance FROM public.profiles WHERE id = p_user_id;
  
  IF v_balance IS NULL OR v_balance < p_cost_m1u THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Saldo M1U insufficiente';
    RETURN;
  END IF;
  
  -- Sottrai M1U (l'INSERT lo fa l'edge function)
  UPDATE public.profiles 
  SET m1_units = m1_units - p_cost_m1u 
  WHERE id = p_user_id;
  
  -- Ritorna successo (area_id sarà NULL, edge function crea l'area)
  RETURN QUERY SELECT NULL::UUID, TRUE, 'Pagamento M1U riuscito';
END;
$$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™