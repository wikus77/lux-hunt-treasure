-- Fix FCM subscriptions table constraint and user_id field
-- First make user_id NOT NULL since it's required for RLS
ALTER TABLE public.fcm_subscriptions 
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id and token combination
ALTER TABLE public.fcm_subscriptions 
ADD CONSTRAINT fcm_subscriptions_user_token_unique 
UNIQUE (user_id, token);