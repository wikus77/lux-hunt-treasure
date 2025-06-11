
-- Create admin_prizes table
CREATE TABLE public.admin_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL CHECK (length(description) <= 120),
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 52),
  type TEXT NOT NULL CHECK (type IN ('auto', 'orologio', 'borsa', 'altro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_prizes ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can access admin_prizes" ON public.admin_prizes
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'wikus77@hotmail.it')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email = 'wikus77@hotmail.it')
    )
  );

-- Add index for better performance
CREATE INDEX idx_admin_prizes_week ON public.admin_prizes(week DESC);
CREATE INDEX idx_admin_prizes_city ON public.admin_prizes(city);
