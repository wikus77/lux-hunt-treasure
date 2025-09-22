-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1) Schema di sicurezza e tabella di audit per drop e insert
CREATE SCHEMA IF NOT EXISTS m1sec;

CREATE TABLE IF NOT EXISTS m1sec.marker_audit (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_time    timestamptz NOT NULL DEFAULT now(),
  actor_uid     uuid,
  actor_email   text,
  action        text CHECK (action IN ('DROP_REQUEST','MARKER_INSERT')),
  drop_id       uuid,
  details       jsonb
);

-- 2) Funzione sicura che decide se un utente è admin/owner
CREATE OR REPLACE FUNCTION m1sec.is_admin_secure(p_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_uid
      AND lower(coalesce(p.role,'')) IN ('admin','owner')
  );
$$;

REVOKE ALL ON FUNCTION m1sec.is_admin_secure(uuid) FROM public;
GRANT EXECUTE ON FUNCTION m1sec.is_admin_secure(uuid) TO authenticated;

-- 3) Abilita RLS su markers se non già abilitato
ALTER TABLE public.markers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS markers_public_write ON public.markers;
DROP POLICY IF EXISTS markers_public_delete ON public.markers;
DROP POLICY IF EXISTS markers_public_update ON public.markers;
DROP POLICY IF EXISTS markers_no_insert ON public.markers;
DROP POLICY IF EXISTS markers_no_update ON public.markers;
DROP POLICY IF EXISTS markers_no_delete ON public.markers;

-- Lettura consentita agli authenticated (se già esiste lasciare com'è)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='markers' AND policyname='markers_read_auth'
  ) THEN
    CREATE POLICY markers_read_auth ON public.markers
      FOR SELECT TO authenticated USING (true);
  END IF;
END$$;

-- Niente insert/update/delete da authenticated (verranno fatti via RPC security definer)
CREATE POLICY markers_no_insert ON public.markers
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY markers_no_update ON public.markers
  FOR UPDATE TO authenticated USING (false);
CREATE POLICY markers_no_delete ON public.markers
  FOR DELETE TO authenticated USING (false);

-- 4) RPC ufficiale per insert marker con SECURITY DEFINER + validazioni
CREATE OR REPLACE FUNCTION public.fn_markers_secure_insert(
  p_drop_id uuid,
  p_title   text,
  p_lat     double precision,
  p_lng     double precision,
  p_reward_type public.reward_type,
  p_reward_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  -- gate admin/owner
  IF NOT m1sec.is_admin_secure(v_uid) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  -- vincoli lat/lng "server-side"
  IF p_lat IS NULL OR p_lng IS NULL
     OR p_lat < -90 OR p_lat > 90
     OR p_lng < -180 OR p_lng > 180
  THEN
     RAISE EXCEPTION 'INVALID_COORDS';
  END IF;

  INSERT INTO public.markers (drop_id, title, lat, lng, active, reward_type, reward_payload)
  VALUES (p_drop_id, p_title, p_lat, p_lng, true, p_reward_type, coalesce(p_reward_payload,'{}'::jsonb))
  RETURNING id INTO v_id;

  INSERT INTO m1sec.marker_audit (actor_uid, action, drop_id, details)
  VALUES (v_uid, 'MARKER_INSERT', p_drop_id, jsonb_build_object('marker_id', v_id, 'reward', p_reward_type));

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_markers_secure_insert(uuid,text,double precision,double precision,public.reward_type,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_markers_secure_insert(uuid,text,double precision,double precision,public.reward_type,jsonb) TO authenticated;

-- 5) Constraint sugli estremi (se non presenti) con nome stabile markers_lat_valid/markers_lng_valid
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='markers_lat_valid') THEN
    ALTER TABLE public.markers
      ADD CONSTRAINT markers_lat_valid CHECK (lat BETWEEN -90 AND 90);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='markers_lng_valid') THEN
    ALTER TABLE public.markers
      ADD CONSTRAINT markers_lng_valid CHECK (lng BETWEEN -180 AND 180);
  END IF;
END$$;

-- 6) Audit del DROP request (consigliato: chiamato dalla Edge Function all'inizio)
CREATE OR REPLACE FUNCTION m1sec.audit_drop_request(p_drop_id uuid, p_payload jsonb)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO m1sec.marker_audit (actor_uid, action, drop_id, details)
  VALUES (auth.uid(), 'DROP_REQUEST', p_drop_id, p_payload);
$$;