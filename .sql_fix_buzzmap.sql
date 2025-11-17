ALTER TABLE IF EXISTS public.buzz_map_actions
  ADD COLUMN IF NOT EXISTS payment_intent_id text;

ALTER TABLE IF EXISTS public.buzz_logs
  ADD COLUMN IF NOT EXISTS metadata jsonb;
