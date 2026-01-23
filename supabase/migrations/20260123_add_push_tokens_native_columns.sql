-- =====================================================
-- MIGRATION: Add native push columns to push_tokens
-- Date: 2026-01-23
-- Purpose: Support iOS APNs and Android FCM tokens
-- =====================================================

-- Add platform column (ios, android, web)
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';

-- Add endpoint_type column (apns, fcm, web_push)
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS endpoint_type TEXT DEFAULT 'web_push';

-- Add device_info JSONB for metadata
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}';

-- Add last_used_at for tracking
ALTER TABLE public.push_tokens 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for platform queries
CREATE INDEX IF NOT EXISTS idx_push_tokens_platform 
ON public.push_tokens(platform);

-- Create index for user + platform queries
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_platform 
ON public.push_tokens(user_id, platform);

-- Update constraint to allow one token per user per platform
-- First drop the old unique constraint if exists
ALTER TABLE public.push_tokens 
DROP CONSTRAINT IF EXISTS push_tokens_token_key;

-- Add new unique constraint (one token per user per platform)
ALTER TABLE public.push_tokens 
ADD CONSTRAINT push_tokens_user_platform_unique 
UNIQUE (user_id, platform);

-- =====================================================
-- MIGRATION COMPLETE ✅
-- =====================================================
