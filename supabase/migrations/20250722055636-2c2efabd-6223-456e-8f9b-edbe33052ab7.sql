-- M1SSION™ Enable Realtime for Critical Tables
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Enable replica identity full for realtime updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;
ALTER TABLE public.checkout_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication for instant updates
SELECT pg_catalog.set_config('supabase.ignore_dup_table_warning', 'true', false);
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkout_sessions;