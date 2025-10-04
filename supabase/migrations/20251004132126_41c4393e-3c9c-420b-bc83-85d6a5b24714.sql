-- Reset onboarding tutorial flag per l'utente specifico
UPDATE public.user_flags 
SET hide_tutorial = false, 
    updated_at = now()
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180'::uuid;

-- Se il record non esiste, crealo
INSERT INTO public.user_flags (user_id, hide_tutorial, updated_at)
VALUES ('495246c1-9154-4f01-a428-7f37fe230180'::uuid, false, now())
ON CONFLICT (user_id) DO UPDATE
SET hide_tutorial = false, updated_at = now();