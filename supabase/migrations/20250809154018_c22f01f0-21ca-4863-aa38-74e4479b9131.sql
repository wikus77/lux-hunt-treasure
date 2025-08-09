-- Align qr_redeem to use public.qr_codes and public.qr_redemption_logs (keep parameter name p_lon to avoid drop)
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes (code);
CREATE INDEX IF NOT EXISTS idx_qr_redemption_logs_code_user ON public.qr_redemption_logs (qr_code_id, user_id);

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
  qc RECORD;
  v_uid uuid := auth.uid();
  v_dist_m double precision := NULL;
  v_max_m int := 100; -- default threshold
  v_already boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('status','error','message','not_authenticated');
  END IF;

  SELECT id, code, reward_type, message, lat, lng, is_active
  INTO qc
  FROM public.qr_codes
  WHERE code = p_code
  LIMIT 1;

  IF qc.id IS NULL THEN
    RETURN jsonb_build_object('status','not_found');
  END IF;

  IF qc.is_active = false THEN
    RETURN jsonb_build_object('status','inactive');
  END IF;

  -- Distance check if both user and QR coordinates are available
  IF p_lat IS NOT NULL AND p_lon IS NOT NULL AND qc.lat IS NOT NULL AND qc.lng IS NOT NULL THEN
    v_dist_m := 2 * 6371000 * asin(
      sqrt(
        pow(sin(radians((p_lat - qc.lat) / 2)), 2) +
        cos(radians(qc.lat)) * cos(radians(p_lat)) *
        pow(sin(radians((p_lon - qc.lng) / 2)), 2)
      )
    );

    IF v_dist_m > v_max_m THEN
      INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, user_lat, user_lng, distance_meters, success, failure_reason)
      VALUES (qc.id, v_uid, p_lat, p_lon, v_dist_m, false, 'out_of_range');

      RETURN jsonb_build_object(
        'status','out_of_range',
        'code_id', qc.id, 'code', qc.code,
        'reward_type', qc.reward_type, 'message', qc.message,
        'lat', qc.lat, 'lng', qc.lng,
        'max_distance_meters', v_max_m,
        'distance_m', v_dist_m
      );
    END IF;
  END IF;

  -- Idempotency
  SELECT true INTO v_already
  FROM public.qr_redemption_logs
  WHERE qr_code_id = qc.id AND user_id = v_uid AND success = true
  LIMIT 1;

  IF COALESCE(v_already, false) THEN
    RETURN jsonb_build_object(
      'status','already_claimed',
      'code_id', qc.id, 'code', qc.code,
      'reward_type', qc.reward_type, 'message', qc.message
    );
  END IF;

  INSERT INTO public.qr_redemption_logs (qr_code_id, user_id, user_lat, user_lng, distance_meters, success, failure_reason, reward_granted)
  VALUES (qc.id, v_uid, p_lat, p_lon, v_dist_m, true, NULL, jsonb_build_object('reward_type', qc.reward_type));

  RETURN jsonb_build_object(
    'status','ok',
    'code_id', qc.id, 'code', qc.code,
    'reward_type', qc.reward_type, 'message', qc.message,
    'lat', qc.lat, 'lng', qc.lng,
    'max_distance_meters', v_max_m,
    'distance_m', v_dist_m
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message', sqlerrm);
END;
$$;