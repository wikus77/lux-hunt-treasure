-- Rimuovi constraint troppo restrittivi sulla tabella fcm_subscriptions
-- per consentire più flessibilità nei token push

-- Modifica constraint platform per includere 'web' 
ALTER TABLE public.fcm_subscriptions DROP CONSTRAINT IF EXISTS fcm_subscriptions_platform_check;
ALTER TABLE public.fcm_subscriptions 
ADD CONSTRAINT fcm_subscriptions_platform_check 
CHECK (platform IN ('ios', 'android', 'desktop', 'web', 'unknown'));

-- Aggiorna la funzione upsert per gestire meglio i token web push
CREATE OR REPLACE FUNCTION public.upsert_fcm_subscription(
  p_user_id uuid, 
  p_token text, 
  p_platform text, 
  p_device_info jsonb default '{}'::jsonb
) 
RETURNS jsonb
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result_record RECORD;
BEGIN
  -- Validazione base - no pattern troppo rigidi
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id è richiesto');
  END IF;
  
  IF p_token IS NULL OR length(trim(p_token)) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'token deve essere almeno 10 caratteri');
  END IF;
  
  -- Normalizza platform - accetta più valori
  p_platform := lower(trim(coalesce(p_platform, 'web')));
  IF p_platform NOT IN ('ios', 'android', 'desktop', 'web', 'unknown') THEN
    p_platform := 'web';
  END IF;
  
  -- Upsert semplice senza validazioni pattern
  INSERT INTO public.fcm_subscriptions (user_id, token, platform, device_info, is_active, created_at, updated_at)
  VALUES (p_user_id, p_token, p_platform, COALESCE(p_device_info, '{}'::jsonb), true, now(), now())
  ON CONFLICT (token) 
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    platform = EXCLUDED.platform,
    device_info = EXCLUDED.device_info,
    is_active = true,
    updated_at = now()
  RETURNING * INTO result_record;
  
  RETURN jsonb_build_object(
    'success', true, 
    'id', result_record.id,
    'token_prefix', left(result_record.token, 30) || '...',
    'platform', result_record.platform,
    'created_at', result_record.created_at,
    'message', 'Token salvato con successo'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'sqlstate', SQLSTATE,
    'detail', CASE 
      WHEN SQLSTATE = '23505' THEN 'Token già esistente - aggiornato'
      WHEN SQLSTATE = '23502' THEN 'Campo obbligatorio mancante'
      WHEN SQLSTATE = '23514' THEN 'Errore validazione: ' || SQLERRM
      ELSE 'Errore database: ' || SQLERRM
    END
  );
END;
$function$;