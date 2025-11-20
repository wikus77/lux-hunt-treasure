-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Migration: Add missing columns to user_notifications table

SET search_path = public;

-- Add type column for notification categorization
ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'info';

-- Add title column for notification headline
ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS title text;

-- Add is_deleted column for soft delete functionality
ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Create index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_notifications_type 
  ON public.user_notifications(type) 
  WHERE is_deleted = false;

-- Create index on user_id + is_deleted for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_active 
  ON public.user_notifications(user_id, is_deleted) 
  WHERE is_deleted = false;

-- Add comments for documentation
COMMENT ON COLUMN public.user_notifications.type IS 'Notification type: info, warning, error, success, clue, reward, mission, etc.';
COMMENT ON COLUMN public.user_notifications.title IS 'Notification title/headline';
COMMENT ON COLUMN public.user_notifications.is_deleted IS 'Soft delete flag - true means notification is deleted but kept in DB';