-- Update qr_redeem to support optional lat/lon and return out_of_range
-- Safe, idempotent migration: only replaces function and ensures helpful indexes

-- Helpful indexes (no-op if they already exist)
CREATE INDEX IF NOT EXISTS idx_qr_rewards_code ON public.qr_rewards (code);
CREATE INDEX IF NOT EXISTS idx_qr_rewards_attivo ON public.qr_rewards (attivo);
CREATE INDEX IF NOT EXISTS idx_qr_redemption_logs_qr_user ON public.qr_redemption_logs (qr_id, user_id);

-- Function: public.qr_redeem(p_code text, p_lat double precision, p_lon double precision)
CREATE OR REPLACE FUNCTION public.qr_redeem(
  p_code text,
  p_lat double precision DEFAULT NULL,
  p_lon double precision DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_qr RECORD;
  v_distance double precision := NULL;
  v_already boolean := false;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('status','error','message','not_authenticated');
  END IF;

  SELECT * INTO v_qr
  FROM public.qr_rewards
  WHERE code = p_code AND attivo = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status','not_found');
  END IF;

  -- Optional distance check when both client location and QR coordinates are available
  IF p_lat IS NOT NULL AND p_lon IS NOT NULL AND v_qr.lat IS NOT NULL AND v_qr.lon IS NOT NULL THEN
    v_distance := public.calculate_qr_distance(p_lat, p_lon, v_qr.lat, v_qr.lon);
    IF v_qr.max_distance_meters IS NOT NULL AND v_distance > v_qr.max_distance_meters THEN
      -- Soft log and return out_of_range without consuming the QR
      INSERT INTO public.qr_redemption_logs(qr_id, user_id, status, redeemed_at)
      VALUES (v_qr.id, v_user, 'out_of_range', now())
      ON CONFLICT DO NOTHING;

      RETURN jsonb_build_object(
        'status', 'out_of_range',
        'id', v_qr.id,
        'code', v_qr.code,
        'reward_type', v_qr.reward_type,
        'message', v_qr.message,
        'distance', v_distance,
        'max_distance', v_qr.max_distance_meters
      );
    END IF;
  END IF;

  -- Idempotency: if already claimed by this user
  SELECT true INTO v_already
  FROM public.qr_redemption_logs
  WHERE qr_id = v_qr.id AND user_id = v_user AND status = 'ok'
  LIMIT 1;

  IF COALESCE(v_already, false) THEN
    RETURN jsonb_build_object(
      'status','already_claimed',
      'id', v_qr.id,
      'code', v_qr.code,
      'reward_type', v_qr.reward_type,
      'message', v_qr.message
    );
  END IF;

  -- Atomic insert + increment
  INSERT INTO public.qr_redemption_logs(qr_id, user_id, status, redeemed_at)
  VALUES (v_qr.id, v_user, 'ok', now());

  UPDATE public.qr_rewards
  SET scansioni = COALESCE(scansioni,0) + 1
  WHERE id = v_qr.id;

  RETURN jsonb_build_object(
    'status','ok',
    'id', v_qr.id,
    'code', v_qr.code,
    'reward_type', v_qr.reward_type,
    'message', v_qr.message
  );
END;
$$;