-- Fix security issue: Set proper search_path for the function
CREATE OR REPLACE FUNCTION public.has_mission_started()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT now() >= '2025-08-19T05:00:00Z'::timestamptz;
$$;