-- Migration: Admin Logs Extended System (A2 - Universal Audit Trail)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- Purpose: Extend admin_logs with automatic trigger-based logging for all sensitive tables
-- - Universal trigger function for INSERT/UPDATE/DELETE operations
-- - Granular tracking: table_name, action, record_id, payload (JSON diff)
-- - Automatic logging without manual function calls
-- - Compatible with user_roles + has_role() from A1
--
-- SAFETY: Does NOT modify Buzz/Map/Push/Stripe/Norah functionality

-- ============================================================================
-- STEP 1: Extend admin_logs table schema (if needed)
-- ============================================================================
-- Note: admin_logs was created in A1, but we ensure required columns exist

DO $$ 
BEGIN
  -- Add record_id column if missing (stores PK of modified row)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_logs' 
    AND column_name = 'record_id'
  ) THEN
    ALTER TABLE public.admin_logs ADD COLUMN record_id UUID;
    CREATE INDEX idx_admin_logs_record_id ON public.admin_logs(record_id);
  END IF;

  -- Add old_data column for UPDATE operations (stores previous state)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_logs' 
    AND column_name = 'old_data'
  ) THEN
    ALTER TABLE public.admin_logs ADD COLUMN old_data JSONB;
  END IF;

  -- Add new_data column for INSERT/UPDATE operations (stores new state)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_logs' 
    AND column_name = 'new_data'
  ) THEN
    ALTER TABLE public.admin_logs ADD COLUMN new_data JSONB;
  END IF;

  -- Rename 'action' to be more descriptive if it was generic
  -- Keep compatibility with A1 if already exists
END $$;

-- Update comments
COMMENT ON COLUMN public.admin_logs.record_id IS 'UUID of the affected record (if applicable)';
COMMENT ON COLUMN public.admin_logs.old_data IS 'Previous state of record (UPDATE/DELETE only)';
COMMENT ON COLUMN public.admin_logs.new_data IS 'New state of record (INSERT/UPDATE only)';

-- ============================================================================
-- STEP 2: Create universal trigger function for automatic logging
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_log_admin_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action TEXT;
  _record_id UUID;
  _old_data JSONB;
  _new_data JSONB;
  _user_id UUID;
BEGIN
  -- Get current user ID
  _user_id := auth.uid();
  
  -- Skip logging if no user authenticated (shouldn't happen with RLS, but safety check)
  IF _user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Only log if user has admin or moderator role
  IF NOT (
    public.has_role(_user_id, 'admin') OR 
    public.has_role(_user_id, 'moderator')
  ) THEN
    -- Regular users don't trigger audit logs
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    _action := 'INSERT';
    _record_id := NEW.id;
    _new_data := to_jsonb(NEW);
    _old_data := NULL;
  ELSIF (TG_OP = 'UPDATE') THEN
    _action := 'UPDATE';
    _record_id := NEW.id;
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'DELETE') THEN
    _action := 'DELETE';
    _record_id := OLD.id;
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
  ELSE
    -- Unknown operation, skip
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Insert log entry
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    target_table,
    record_id,
    old_data,
    new_data,
    details,
    ip_address,
    user_agent
  ) VALUES (
    _user_id,
    _action || ' on ' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    _record_id,
    _old_data,
    _new_data,
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'timestamp', NOW()
    ),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- If logging fails, don't block the operation
    -- Log error to PostgreSQL logs but continue
    RAISE WARNING 'Failed to log admin operation on %.%: %', TG_TABLE_SCHEMA, TG_TABLE_NAME, SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.trigger_log_admin_operation() IS 
  'Universal trigger function that logs all INSERT/UPDATE/DELETE operations by admin/moderator users';

-- ============================================================================
-- STEP 3: Attach triggers to sensitive tables
-- ============================================================================

-- Helper function to attach audit trigger to a table
CREATE OR REPLACE FUNCTION public.attach_audit_trigger(_table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  _trigger_name TEXT;
BEGIN
  _trigger_name := 'audit_' || _table_name || '_changes';
  
  -- Drop existing trigger if present
  EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', _trigger_name, _table_name);
  
  -- Create new trigger
  EXECUTE format(
    'CREATE TRIGGER %I 
     AFTER INSERT OR UPDATE OR DELETE ON public.%I
     FOR EACH ROW 
     EXECUTE FUNCTION public.trigger_log_admin_operation()',
    _trigger_name,
    _table_name
  );
  
  RAISE NOTICE 'Attached audit trigger to table: %', _table_name;
END;
$$;

-- Attach triggers to all sensitive tables
-- IMPORTANT: Add/remove tables based on your schema
-- DO NOT add tables related to Buzz/Map/Push/Stripe per safety clause

DO $$
DECLARE
  _table TEXT;
BEGIN
  -- List of sensitive tables requiring audit logging
  -- Excluded: user_buzz_counter, user_buzz_map, battle_*, webpush_*, device_tokens (per safety clause)
  FOR _table IN 
    SELECT unnest(ARRAY[
      'profiles',           -- User profile modifications
      'user_roles',         -- Role changes (already has trigger, but ensure)
      'prizes',             -- Prize management
      'user_clues',         -- Clue assignments
      'subscriptions',      -- Subscription changes
      'user_xp',            -- XP modifications
      'agent_ranks',        -- Rank changes
      'm1_units_balance',   -- Currency modifications
      'missions',           -- Mission management
      'achievements',       -- Achievement grants
      'user_stats',         -- Stats modifications
      'leaderboards',       -- Leaderboard changes
      'rewards',            -- Reward distribution
      'notifications',      -- Admin notifications
      'referrals',          -- Referral system
      'user_map_areas'      -- Map area unlocks (NOT buzz_map)
    ])
  LOOP
    -- Only attach if table exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = _table
    ) THEN
      PERFORM public.attach_audit_trigger(_table);
    ELSE
      RAISE NOTICE 'Table does not exist, skipping: %', _table;
    END IF;
  END LOOP;
END $$;

-- Clean up helper function (no longer needed after setup)
DROP FUNCTION IF EXISTS public.attach_audit_trigger(TEXT);

-- ============================================================================
-- STEP 4: Create helper view for readable audit logs
-- ============================================================================
CREATE OR REPLACE VIEW public.admin_logs_readable AS
SELECT 
  al.id,
  al.action,
  al.target_table,
  al.record_id,
  au.email AS admin_email,
  COALESCE(tu.email, al.target_user_id::text) AS target_email,
  al.details,
  al.old_data,
  al.new_data,
  al.ip_address,
  al.user_agent,
  al.created_at,
  -- Compute JSON diff for UPDATE operations
  CASE 
    WHEN al.old_data IS NOT NULL AND al.new_data IS NOT NULL THEN
      (
        SELECT jsonb_object_agg(key, value)
        FROM (
          SELECT key, new_data->>key AS value
          FROM jsonb_each(al.new_data)
          WHERE new_data->>key IS DISTINCT FROM old_data->>key
        ) diff
      )
    ELSE NULL
  END AS changed_fields
FROM public.admin_logs al
LEFT JOIN auth.users au ON au.id = al.admin_id
LEFT JOIN auth.users tu ON tu.id = al.target_user_id
ORDER BY al.created_at DESC;

COMMENT ON VIEW public.admin_logs_readable IS 
  'Human-readable view of admin logs with email addresses and field diffs';

-- Grant SELECT on view to admins only
REVOKE ALL ON public.admin_logs_readable FROM PUBLIC;
GRANT SELECT ON public.admin_logs_readable TO authenticated;

-- Create policy for view (only admins)
-- Note: Views inherit RLS from underlying tables, but we add explicit check
CREATE OR REPLACE FUNCTION public.can_view_admin_logs()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- ============================================================================
-- STEP 5: Create convenience functions for manual logging
-- ============================================================================

-- Function to log custom admin actions (when trigger doesn't apply)
CREATE OR REPLACE FUNCTION public.log_custom_admin_action(
  _action TEXT,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  -- Only admins/moderators can log
  IF NOT (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins/moderators can log actions';
  END IF;

  INSERT INTO public.admin_logs (
    admin_id,
    action,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    _action,
    _details,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  )
  RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_custom_admin_action(TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION public.log_custom_admin_action(TEXT, JSONB) IS 
  'Log custom admin actions that are not captured by automatic triggers';

-- ============================================================================
-- STEP 6: Create cleanup function (optional - for data retention)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_admin_logs(
  _days_to_keep INTEGER DEFAULT 365
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deleted_count INTEGER;
BEGIN
  -- Only admins can cleanup logs
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can cleanup logs';
  END IF;

  DELETE FROM public.admin_logs
  WHERE created_at < NOW() - (_days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS _deleted_count = ROW_COUNT;
  
  -- Log the cleanup operation itself
  PERFORM public.log_custom_admin_action(
    'CLEANUP_ADMIN_LOGS',
    jsonb_build_object(
      'deleted_count', _deleted_count,
      'days_to_keep', _days_to_keep,
      'cleanup_date', NOW()
    )
  );

  RETURN _deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_old_admin_logs(INTEGER) TO authenticated;

COMMENT ON FUNCTION public.cleanup_old_admin_logs(INTEGER) IS 
  'Delete admin logs older than specified days (default 365). Returns count of deleted rows.';

-- ============================================================================
-- STEP 7: Create statistics view
-- ============================================================================
CREATE OR REPLACE VIEW public.admin_logs_stats AS
SELECT 
  DATE_TRUNC('day', created_at) AS log_date,
  target_table,
  SPLIT_PART(action, ' ', 1) AS operation,  -- Extract INSERT/UPDATE/DELETE
  COUNT(*) AS operation_count,
  COUNT(DISTINCT admin_id) AS unique_admins,
  MIN(created_at) AS first_operation,
  MAX(created_at) AS last_operation
FROM public.admin_logs
WHERE target_table IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at), target_table, SPLIT_PART(action, ' ', 1)
ORDER BY log_date DESC, operation_count DESC;

COMMENT ON VIEW public.admin_logs_stats IS 
  'Daily statistics of admin operations by table and operation type';

GRANT SELECT ON public.admin_logs_stats TO authenticated;

-- ============================================================================
-- STEP 8: Update RLS policies for new columns
-- ============================================================================
-- Note: Base policies were created in A1, but we ensure they work with extended schema

-- Ensure only admins can view logs (including new columns)
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;
CREATE POLICY "Admins can view logs"
  ON public.admin_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Moderators can view their own actions only
DROP POLICY IF EXISTS "Moderators can view own logs" ON public.admin_logs;
CREATE POLICY "Moderators can view own logs"
  ON public.admin_logs
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'moderator') AND 
    admin_id = auth.uid()
  );

-- Service role and triggers can insert
DROP POLICY IF EXISTS "Service can insert logs" ON public.admin_logs;
CREATE POLICY "Service can insert logs"
  ON public.admin_logs
  FOR INSERT
  WITH CHECK (true);  -- Service role bypasses RLS, triggers execute as SECURITY DEFINER

-- No one can update/delete logs (immutable audit trail)
DROP POLICY IF EXISTS "Logs are immutable" ON public.admin_logs;
CREATE POLICY "Logs are immutable"
  ON public.admin_logs
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Logs cannot be deleted" ON public.admin_logs;
CREATE POLICY "Logs cannot be deleted"
  ON public.admin_logs
  FOR DELETE
  USING (
    -- Only allow cleanup function (executed as SECURITY DEFINER by admin)
    false
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the system is working:

-- 1. Check triggers are attached
-- SELECT 
--   trigger_name,
--   event_object_table,
--   action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE 'audit_%'
-- ORDER BY event_object_table;

-- 2. Check admin_logs table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name = 'admin_logs'
-- ORDER BY ordinal_position;

-- 3. View recent logs
-- SELECT * FROM public.admin_logs_readable LIMIT 10;

-- 4. View statistics
-- SELECT * FROM public.admin_logs_stats WHERE log_date >= CURRENT_DATE - 7;

-- 5. Test manual log
-- SELECT public.log_custom_admin_action('SYSTEM_TEST_A2', '{"test": true}'::jsonb);

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- DROP VIEW IF EXISTS public.admin_logs_stats CASCADE;
-- DROP VIEW IF EXISTS public.admin_logs_readable CASCADE;
-- DROP FUNCTION IF EXISTS public.cleanup_old_admin_logs(INTEGER);
-- DROP FUNCTION IF EXISTS public.log_custom_admin_action(TEXT, JSONB);
-- DROP FUNCTION IF EXISTS public.can_view_admin_logs();
-- DROP FUNCTION IF EXISTS public.trigger_log_admin_operation() CASCADE;
-- ALTER TABLE public.admin_logs DROP COLUMN IF EXISTS record_id;
-- ALTER TABLE public.admin_logs DROP COLUMN IF EXISTS old_data;
-- ALTER TABLE public.admin_logs DROP COLUMN IF EXISTS new_data;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
