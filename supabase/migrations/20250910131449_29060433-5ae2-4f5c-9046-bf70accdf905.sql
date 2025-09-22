-- Fix RLS policy for notification_preferences to allow admin operations
-- And seed test user preferences

-- First, ensure the admin user can manage preferences
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;

-- Create comprehensive RLS policies
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences
FOR ALL
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
))
WITH CHECK (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Seed preferences for test user (admin can do this)
DELETE FROM public.notification_preferences
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180';

INSERT INTO public.notification_preferences (user_id, category, enabled) VALUES
('495246c1-9154-4f01-a428-7f37fe230180', 'Luxury & moda', true),
('495246c1-9154-4f01-a428-7f37fe230180', 'Tecnologia', true);