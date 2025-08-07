-- ✅ Fix security warning - Set search_path for function
ALTER FUNCTION public.update_qr_rewards_updated_at() SET search_path = 'public';