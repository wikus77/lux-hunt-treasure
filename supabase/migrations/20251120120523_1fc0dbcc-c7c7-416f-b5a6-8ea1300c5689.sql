-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- P2 Migrations: Notification Center + Counter Compatibility (corrected)

-- 1) Counter compatibility views (map daily_count to buzz_count for legacy code)
CREATE OR REPLACE VIEW public.v_user_buzz_counter_compat AS
SELECT 
  user_id, 
  daily_count as buzz_count, 
  updated_at, 
  counter_date
FROM public.user_buzz_counter;

CREATE OR REPLACE VIEW public.v_user_buzz_map_counter_compat AS
SELECT 
  user_id, 
  daily_count as buzz_map_count, 
  updated_at, 
  counter_date
FROM public.user_buzz_map_counter;

-- 2) Performance indices for notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_arch 
ON public.user_notifications(user_id, archived_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_created 
ON public.user_notifications(created_at DESC);

-- 3) Inbox view (non-archived notifications)
CREATE OR REPLACE VIEW public.v_user_inbox AS
SELECT 
  id, 
  user_id, 
  created_at, 
  archived_at, 
  is_read,
  read_at,
  title,
  message,
  type
FROM public.user_notifications
WHERE archived_at IS NULL;

-- 4) RPC: Get my notifications (paginated)
CREATE OR REPLACE FUNCTION public.get_my_notifications(
  p_limit int DEFAULT 20, 
  p_before timestamptz DEFAULT now()
)
RETURNS SETOF public.user_notifications
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.user_notifications
  WHERE user_id = auth.uid()
    AND created_at < p_before
  ORDER BY created_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_notifications TO authenticated;

-- 5) RPC: Archive/unarchive notification
CREATE OR REPLACE FUNCTION public.set_notification_archived(
  p_id uuid, 
  p_archived boolean
)
RETURNS boolean
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_notifications
  SET archived_at = CASE WHEN p_archived THEN now() ELSE NULL END
  WHERE id = p_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_notification_archived TO authenticated;

-- 6) Add prefs column to user_notification_prefs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_notification_prefs' 
    AND column_name = 'prefs'
  ) THEN
    ALTER TABLE public.user_notification_prefs 
    ADD COLUMN prefs jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™