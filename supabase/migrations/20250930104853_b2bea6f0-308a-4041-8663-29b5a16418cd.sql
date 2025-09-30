-- Fix security warning: Function Search Path per la nuova funzione
ALTER FUNCTION public.upsert_prize_category(text) SET search_path = 'public';