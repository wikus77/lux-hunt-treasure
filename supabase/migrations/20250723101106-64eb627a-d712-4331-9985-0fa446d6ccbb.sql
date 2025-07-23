-- M1SSION™ User Synchronization System
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- 1. Create user_logs table for tracking all user actions
CREATE TABLE IF NOT EXISTS public.user_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_permissions table for dynamic access control
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- 'early_access', 'app_access', 'premium_features'
  permission_value BOOLEAN DEFAULT FALSE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_type)
);

-- 3. Create user_notifications table for tracking notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'email', 'push', 'in_app'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'sent' -- 'sent', 'delivered', 'failed'
);

-- 4. Update plans config check constraint to include Titanium
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_plan_check 
CHECK (plan IN ('base', 'silver', 'gold', 'black', 'titanium'));

-- 5. Add early access columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS can_access_app BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS early_access_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_plan_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS on new tables
ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_logs
CREATE POLICY "Users can view their own logs"
ON public.user_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs"
ON public.user_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all logs"
ON public.user_logs FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage permissions"
ON public.user_permissions FOR ALL
WITH CHECK (true);

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications"
ON public.user_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.user_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage notifications"
ON public.user_notifications FOR INSERT
WITH CHECK (true);

-- Functions for user synchronization

-- Function to log user actions
CREATE OR REPLACE FUNCTION public.log_user_action(
  p_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_logs (user_id, action, details, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user permissions based on plan
CREATE OR REPLACE FUNCTION public.sync_user_permissions(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_plan TEXT;
  early_hours INTEGER := 0;
  can_access BOOLEAN := FALSE;
BEGIN
  -- Get current user plan
  SELECT COALESCE(plan, 'base') INTO user_plan
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Calculate early access hours based on plan
  CASE user_plan
    WHEN 'silver' THEN early_hours := 2;
    WHEN 'gold' THEN early_hours := 24;
    WHEN 'black' THEN early_hours := 48;
    WHEN 'titanium' THEN early_hours := 72;
    ELSE early_hours := 0;
  END CASE;
  
  -- Determine app access
  can_access := (user_plan != 'base');
  
  -- Update profile with calculated permissions
  UPDATE public.profiles
  SET 
    can_access_app = can_access,
    early_access_hours = early_hours,
    last_plan_change = NOW()
  WHERE id = p_user_id;
  
  -- Upsert permission records
  INSERT INTO public.user_permissions (user_id, permission_type, permission_value)
  VALUES 
    (p_user_id, 'early_access', (early_hours > 0)),
    (p_user_id, 'app_access', can_access),
    (p_user_id, 'premium_features', (user_plan != 'base'))
  ON CONFLICT (user_id, permission_type) 
  DO UPDATE SET 
    permission_value = EXCLUDED.permission_value,
    granted_at = NOW();
    
  -- Log the permission sync
  PERFORM public.log_user_action(
    p_user_id,
    'permissions_synced',
    jsonb_build_object(
      'plan', user_plan,
      'early_access_hours', early_hours,
      'can_access_app', can_access
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle plan changes
CREATE OR REPLACE FUNCTION public.handle_plan_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if plan actually changed
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    -- Sync permissions for the new plan
    PERFORM public.sync_user_permissions(NEW.id);
    
    -- Log the plan change
    PERFORM public.log_user_action(
      NEW.id,
      'plan_changed',
      jsonb_build_object(
        'old_plan', OLD.plan,
        'new_plan', NEW.plan,
        'changed_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS trigger_plan_change ON public.profiles;
CREATE TRIGGER trigger_plan_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.plan IS DISTINCT FROM NEW.plan)
  EXECUTE FUNCTION public.handle_plan_change();

-- Function to send notification
CREATE OR REPLACE FUNCTION public.send_user_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.user_notifications (
    user_id, notification_type, title, message, metadata
  )
  VALUES (p_user_id, p_notification_type, p_title, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user sync status
CREATE OR REPLACE FUNCTION public.get_user_sync_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  profile_data RECORD;
  permissions_data JSONB;
  recent_logs JSONB;
BEGIN
  -- Get profile data
  SELECT * INTO profile_data
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Get permissions
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', permission_type,
      'value', permission_value,
      'granted_at', granted_at
    )
  ) INTO permissions_data
  FROM public.user_permissions
  WHERE user_id = p_user_id;
  
  -- Get recent logs (last 10)
  SELECT jsonb_agg(
    jsonb_build_object(
      'action', action,
      'details', details,
      'created_at', created_at
    )
  ) INTO recent_logs
  FROM (
    SELECT action, details, created_at
    FROM public.user_logs
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 10
  ) recent;
  
  -- Build result
  result := jsonb_build_object(
    'user_id', p_user_id,
    'plan', profile_data.plan,
    'can_access_app', profile_data.can_access_app,
    'early_access_hours', profile_data.early_access_hours,
    'last_plan_change', profile_data.last_plan_change,
    'permissions', COALESCE(permissions_data, '[]'::jsonb),
    'recent_logs', COALESCE(recent_logs, '[]'::jsonb),
    'sync_timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;