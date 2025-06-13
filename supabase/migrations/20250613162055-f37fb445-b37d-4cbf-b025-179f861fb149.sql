
-- Create user roles table for developer privileges
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'developer', 'admin')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Only authenticated users can view roles" 
    ON public.user_roles 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND user_roles.role = $2
    );
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id uuid)
RETURNS TABLE(role text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.user_roles WHERE user_roles.user_id = $1;
$$;

-- Insert developer role for existing developer user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'developer'
FROM auth.users 
WHERE email = 'wikus77@hotmail.it'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
