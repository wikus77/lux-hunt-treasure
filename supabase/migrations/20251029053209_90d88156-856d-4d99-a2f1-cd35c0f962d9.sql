-- Add cookie_consent field to profiles for cross-device sync
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cookie_consent jsonb DEFAULT NULL;

COMMENT ON COLUMN public.profiles.cookie_consent IS 'User cookie consent preferences for GDPR compliance and cross-device sync';

-- No new RLS policies needed - existing owner-based policies cover this column
-- Verify existing policies allow SELECT/UPDATE:
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles';