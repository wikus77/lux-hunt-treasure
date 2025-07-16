-- © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
-- M1SSION™ Database Security Fix - Final Function Search Path Correction

-- Fix remaining database functions to have secure search_path
CREATE OR REPLACE FUNCTION public.setup_developer_user(uid uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, auth
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{developer}', 'true')
  WHERE id = uid;

  UPDATE public.profiles
  SET role = 'developer'
  WHERE id = uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_referral_credits(user_email text, credits_to_add integer)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET credits = credits + credits_to_add
  WHERE email = user_email;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user(new_user_id uuid, user_email text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new_user_id, user_email)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_subscription_tier(target_user_id uuid, new_tier text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET tier = new_tier
  WHERE user_id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_abuse_limit(p_event_type text, p_user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_count INTEGER;
BEGIN
  -- Conta gli eventi dello stesso tipo negli ultimi 30 secondi
  SELECT COUNT(*) INTO event_count
  FROM public.abuse_logs
  WHERE user_id = p_user_id
    AND event_type = p_event_type
    AND timestamp >= NOW() - INTERVAL '30 seconds';
  
  -- Restituisce true se superato il limite di 5 eventi
  RETURN event_count >= 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_potential_abuse(p_event_type text, p_user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_abuse BOOLEAN;
  current_count INTEGER;
BEGIN
  -- Inserisci il log dell'evento
  INSERT INTO public.abuse_logs (user_id, event_type)
  VALUES (p_user_id, p_event_type);
  
  -- Verifica se è abuso
  SELECT public.check_abuse_limit(p_event_type, p_user_id) INTO is_abuse;
  
  -- Se è abuso, crea un alert
  IF is_abuse THEN
    -- Conta gli eventi attuali
    SELECT COUNT(*) INTO current_count
    FROM public.abuse_logs
    WHERE user_id = p_user_id
      AND event_type = p_event_type
      AND timestamp >= NOW() - INTERVAL '30 seconds';
    
    -- Inserisci alert solo se non esiste già uno recente
    INSERT INTO public.abuse_alerts (user_id, event_type, event_count)
    SELECT p_user_id, p_event_type, current_count
    WHERE NOT EXISTS (
      SELECT 1 FROM public.abuse_alerts
      WHERE user_id = p_user_id
        AND event_type = p_event_type
        AND alert_timestamp >= NOW() - INTERVAL '1 minute'
    );
  END IF;
  
  RETURN is_abuse;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_abuse_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Rimuovi log più vecchi di 24 ore
  DELETE FROM public.abuse_logs
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Rimuovi alert più vecchi di 7 giorni
  DELETE FROM public.abuse_alerts
  WHERE alert_timestamp < NOW() - INTERVAL '7 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_buzz_map_counter(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert or update the counter for today
  INSERT INTO public.user_buzz_map_counter (user_id, date, buzz_map_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET buzz_map_count = user_buzz_map_counter.buzz_map_count + 1
  RETURNING buzz_map_count INTO new_count;
  
  RETURN new_count;
END;
$$;