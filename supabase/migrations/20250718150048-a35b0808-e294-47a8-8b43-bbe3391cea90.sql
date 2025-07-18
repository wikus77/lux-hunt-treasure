-- Funzione per reset completo missione M1SSION™
CREATE OR REPLACE FUNCTION public.reset_user_mission_full(user_id_input UUID)
RETURNS void AS $$
BEGIN
  -- 1. Reset missione base (contatori, radius, etc.)
  PERFORM public.reset_user_mission(user_id_input);
  
  -- 2. Elimina tutti gli indizi trovati dall'utente
  DELETE FROM public.user_clues WHERE user_id = user_id_input;
  
  -- 3. Elimina tutte le aree generate dall'utente  
  DELETE FROM public.user_map_areas WHERE user_id = user_id_input;
  
  -- 4. Elimina tutti i BUZZ dall'utente
  DELETE FROM public.user_buzz_counter WHERE user_id = user_id_input;
  
  -- 5. Elimina tutte le notifiche dell'utente
  DELETE FROM public.user_notifications WHERE user_id = user_id_input;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;