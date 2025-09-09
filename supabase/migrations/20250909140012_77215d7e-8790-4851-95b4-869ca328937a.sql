-- Fix Security Definer View Issue - Convert to Security Invoker
-- M1SSION™ - Final Security Fix

-- Drop and recreate the buzz_map_markers view with SECURITY INVOKER
DROP VIEW IF EXISTS public.buzz_map_markers;

CREATE VIEW public.buzz_map_markers 
WITH (security_invoker = true)
AS SELECT 
    qr_buzz_codes.id,
    qr_buzz_codes.location_name AS title,
    qr_buzz_codes.lat AS latitude,
    qr_buzz_codes.lng AS longitude,
    (NOT qr_buzz_codes.is_used) AS active
FROM qr_buzz_codes
WHERE (NOT qr_buzz_codes.is_used);

-- Ensure the view has proper RLS
-- Since it's based on qr_buzz_codes table, RLS will be enforced at table level