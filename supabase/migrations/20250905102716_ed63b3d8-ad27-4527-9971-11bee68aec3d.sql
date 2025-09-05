-- Remove any pattern constraints on FCM tokens
ALTER TABLE public.fcm_subscriptions 
  ALTER COLUMN token TYPE text;

-- Remove any existing CHECK constraints on token format
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT conname 
        FROM pg_constraint pc
        JOIN pg_class pc2 ON pc.conrelid = pc2.oid
        WHERE pc2.relname = 'fcm_subscriptions' 
        AND pc.contype = 'c'
        AND pg_get_constraintdef(pc.oid) LIKE '%token%'
    LOOP
        EXECUTE 'ALTER TABLE public.fcm_subscriptions DROP CONSTRAINT ' || quote_ident(constraint_name);
    END LOOP;
END $$;

-- Ensure proper indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_fcm_token_unique 
ON public.fcm_subscriptions (token);

CREATE INDEX IF NOT EXISTS idx_fcm_user_active 
ON public.fcm_subscriptions (user_id, is_active);