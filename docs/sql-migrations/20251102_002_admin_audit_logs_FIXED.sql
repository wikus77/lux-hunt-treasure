-- Migration: Admin Audit Logs System (A2 - Universal Audit Trail) - FIXED VERSION
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
--
-- Purpose: Create separate admin_audit_logs table for admin operations audit trail
-- Note: Does NOT modify existing admin_logs table (system logging)
--
-- SAFETY: Does NOT modify Buzz/Map/Push/Stripe/Norah functionality

-- ============================================================================
-- STEP 1: Create admin_audit_logs table (separate from system admin_logs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_table TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_table ON public.admin_audit_logs(target_table);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_record_id ON public.admin_audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- Comments
COMMENT ON TABLE public.admin_audit_logs IS 'Audit trail for admin/moderator operations on sensitive tables';
COMMENT ON COLUMN public.admin_audit_logs.admin_id IS 'User who performed the operation';
COMMENT ON COLUMN public.admin_audit_logs.action IS 'Operation performed (e.g., INSERT on prizes)';
COMMENT ON COLUMN public.admin_audit_logs.target_table IS 'Table that was modified';
COMMENT ON COLUMN public.admin_audit_logs.record_id IS 'UUID of the affected record';
COMMENT ON COLUMN public.admin_audit_logs.old_data IS 'Previous state of record (UPDATE/DELETE only)';
COMMENT ON COLUMN public.admin_audit_logs.new_data IS 'New state of record (INSERT/UPDATE only)';

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

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
  
  -- Skip logging if no user authenticated
  IF _user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Only log if user has admin or moderator role
  IF NOT (
    public.has_role(_user_id, 'admin') OR 
    public.has_role(_user_id, 'moderator')
  ) THEN
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
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Insert log entry
  INSERT INTO public.admin_audit_logs (
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
    RAISE WARNING 'Failed to log admin operation on %.%: %', TG_TABLE_SCHEMA, TG_TABLE_NAME, SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.trigger_log_admin_operation() IS 
  'Universal trigger function that logs all INSERT/UPDATE/DELETE operations by admin/moderator users';

-- ============================================================================
-- STEP 3: Attach triggers to sensitive tables
-- ============================================================================
DO $$
DECLARE
  _table TEXT;
  _trigger_name TEXT;
BEGIN
  FOR _table IN 
    SELECT unnest(ARRAY[
      'profiles',
      'user_roles',
      'prizes',
      'user_clues',
      'subscriptions',
      'user_xp',
      'agent_ranks',
      'm1_units_balance',
      'missions',
      'achievements',
      'user_stats',
      'leaderboards',
      'rewards',
      'notifications',
      'referrals',
      'user_map_areas'
    ])
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = _table
    ) THEN
      _trigger_name := 'audit_' || _table || '_changes';
      
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', _trigger_name, _table);
      
      EXECUTE format(
        'CREATE TRIGGER %I 
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW 
         EXECUTE FUNCTION public.trigger_log_admin_operation()',
        _trigger_name,
        _table
      );
      
      RAISE NOTICE 'Attached audit trigger to table: %', _table;
    ELSE
      RAISE NOTICE 'Table does not exist, skipping: %', _table;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 4: Create readable view
-- ============================================================================
CREATE OR REPLACE VIEW public.admin_audit_logs_readable AS
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
  CASE 
    WHEN al.old_data IS NOT NULL AND al.new_data IS NOT NULL THEN
      (
        SELECT jsonb_object_agg(key, value)
        FROM (
          SELECT key, al.new_data->>key AS value
          FROM jsonb_each(al.new_data)
          WHERE al.new_data->>key IS DISTINCT FROM al.old_data->>key
        ) diff
      )
    ELSE NULL
  END AS changed_fields
FROM public.admin_audit_logs al
LEFT JOIN auth.users au ON au.id = al.admin_id
LEFT JOIN auth.users tu ON tu.id = al.target_user_id
ORDER BY al.created_at DESC;

COMMENT ON VIEW public.admin_audit_logs_readable IS 
  'Human-readable view of admin audit logs with email addresses and field diffs';

GRANT SELECT ON public.admin_audit_logs_readable TO authenticated;

-- ============================================================================
-- STEP 5: Create statistics view
-- ============================================================================
CREATE OR REPLACE VIEW public.admin_audit_logs_stats AS
SELECT 
  DATE_TRUNC('day', created_at) AS log_date,
  target_table,
  SPLIT_PART(action, ' ', 1) AS operation,
  COUNT(*) AS operation_count,
  COUNT(DISTINCT admin_id) AS unique_admins,
  MIN(created_at) AS first_operation,
  MAX(created_at) AS last_operation
FROM public.admin_audit_logs
WHERE target_table IS NOT NULL
GROUP BY DATE_TRUNC('day', created_at), target_table, SPLIT_PART(action, ' ', 1)
ORDER BY log_date DESC, operation_count DESC;

COMMENT ON VIEW public.admin_audit_logs_stats IS 
  'Daily statistics of admin operations by table and operation type';

GRANT SELECT ON public.admin_audit_logs_stats TO authenticated;

-- ============================================================================
-- STEP 6: RLS Policies
-- ============================================================================

-- Only admins can view all logs
DROP POLICY IF EXISTS "Admins can view all logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view all logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Moderators can view their own logs
DROP POLICY IF EXISTS "Moderators can view own logs" ON public.admin_audit_logs;
CREATE POLICY "Moderators can view own logs"
  ON public.admin_audit_logs
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'moderator') AND 
    admin_id = auth.uid()
  );

-- Service role and triggers can insert
DROP POLICY IF EXISTS "Service can insert logs" ON public.admin_audit_logs;
CREATE POLICY "Service can insert logs"
  ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Logs are immutable
DROP POLICY IF EXISTS "Logs are immutable" ON public.admin_audit_logs;
CREATE POLICY "Logs are immutable"
  ON public.admin_audit_logs
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Logs cannot be deleted" ON public.admin_audit_logs;
CREATE POLICY "Logs cannot be deleted"
  ON public.admin_audit_logs
  FOR DELETE
  USING (false);

-- ============================================================================
-- STEP 7: Helper functions
-- ============================================================================

-- Manual logging for custom actions
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
  IF NOT (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins/moderators can log actions';
  END IF;

  INSERT INTO public.admin_audit_logs (
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
  'Log custom admin actions not captured by automatic triggers';

-- Cleanup old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_admin_audit_logs(
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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can cleanup logs';
  END IF;

  DELETE FROM public.admin_audit_logs
  WHERE created_at < NOW() - (_days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS _deleted_count = ROW_COUNT;
  
  PERFORM public.log_custom_admin_action(
    'CLEANUP_ADMIN_AUDIT_LOGS',
    jsonb_build_object(
      'deleted_count', _deleted_count,
      'days_to_keep', _days_to_keep,
      'cleanup_date', NOW()
    )
  );

  RETURN _deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_old_admin_audit_logs(INTEGER) TO authenticated;

COMMENT ON FUNCTION public.cleanup_old_admin_audit_logs(INTEGER) IS 
  'Delete admin audit logs older than specified days (default 365). Returns count of deleted rows.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify:

-- 1. Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name = 'admin_audit_logs'
-- ORDER BY ordinal_position;

-- 2. Check triggers attached
-- SELECT 
--   trigger_name,
--   event_object_table,
--   action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name LIKE 'audit_%'
-- ORDER BY event_object_table;

-- 3. View recent logs (after performing some admin operations)
-- SELECT * FROM public.admin_audit_logs_readable LIMIT 10;

-- 4. View statistics
-- SELECT * FROM public.admin_audit_logs_stats WHERE log_date >= CURRENT_DATE - 7;

-- 5. Test manual log
-- SELECT public.log_custom_admin_action('SYSTEM_TEST_A2', '{"test": true}'::jsonb);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ A2 Admin Audit Logs System installed successfully!';
  RAISE NOTICE 'Table: admin_audit_logs';
  RAISE NOTICE 'Triggers: Check with SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE ''audit_%%''';
  RAISE NOTICE 'Views: admin_audit_logs_readable, admin_audit_logs_stats';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
