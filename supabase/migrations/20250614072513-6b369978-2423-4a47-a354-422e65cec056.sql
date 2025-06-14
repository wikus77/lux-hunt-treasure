
-- Fix RLS policies for user_roles table to allow proper role assignment
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only authenticated users can view roles" ON public.user_roles;

-- Create comprehensive policies for user_roles
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow developer user to insert roles" 
    ON public.user_roles 
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE email = 'wikus77@hotmail.it' AND id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all roles" 
    ON public.user_roles 
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Ensure the developer role exists for wikus77@hotmail.it
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'developer'
FROM auth.users 
WHERE email = 'wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure they have admin role for full access
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;
