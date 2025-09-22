-- Fix Final Security Issues - M1SSION™ Database Hardening Phase 3
-- Fix the remaining 6 functions without search_path

-- Function 1: haversine_m
CREATE OR REPLACE FUNCTION public.haversine_m(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
 RETURNS double precision
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = 'public'
AS $function$
DECLARE
    R CONSTANT DOUBLE PRECISION := 6371000; -- Earth's radius in meters
    dLat DOUBLE PRECISION;
    dLon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$function$;

-- Function 2: redeem_qr
CREATE OR REPLACE FUNCTION public.redeem_qr(code_input text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    qr_record RECORD;
    user_id UUID;
    redemption_id UUID;
BEGIN
    -- Get current user
    user_id := auth.uid();
    
    IF user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    -- Find QR code
    SELECT * INTO qr_record FROM public.qr_buzz_codes WHERE code = code_input AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'QR code not found or inactive');
    END IF;
    
    -- Check if already redeemed by this user
    IF EXISTS (SELECT 1 FROM public.qr_redemptions WHERE qr_code_id = qr_record.id AND user_id = user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'QR code already redeemed');
    END IF;
    
    -- Create redemption record
    INSERT INTO public.qr_redemptions (qr_code_id, user_id) 
    VALUES (qr_record.id, user_id)
    RETURNING id INTO redemption_id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'redemption_id', redemption_id,
        'points_awarded', qr_record.points_value
    );
END;
$function$;

-- Function 3: trg_qr_redemptions_to_logs
CREATE OR REPLACE FUNCTION public.trg_qr_redemptions_to_logs()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.qr_redemption_logs (
        user_id, 
        qr_code_id, 
        redemption_time, 
        points_awarded
    ) VALUES (
        NEW.user_id,
        NEW.qr_code_id,
        NEW.redeemed_at,
        (SELECT points_value FROM public.qr_buzz_codes WHERE id = NEW.qr_code_id)
    );
    RETURN NEW;
END;
$function$;

-- Function 4: update_markers_updated_at
CREATE OR REPLACE FUNCTION public.update_markers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function 5: update_push_subscriptions_updated_at
CREATE OR REPLACE FUNCTION public.update_push_subscriptions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function 6: update_push_tokens_updated_at
CREATE OR REPLACE FUNCTION public.update_push_tokens_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;