-- Add Apple Push Notification service configuration
CREATE TABLE IF NOT EXISTS public.apple_push_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL,
  key_id TEXT NOT NULL,
  private_key TEXT NOT NULL,
  bundle_id TEXT NOT NULL DEFAULT 'app.lovable.2716f91b957c47ba91e06f572f3ce00d',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.apple_push_config ENABLE ROW LEVEL SECURITY;

-- Admin only policies
CREATE POLICY "Apple push config admin only" 
ON public.apple_push_config 
FOR ALL 
USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_apple_push_config_updated_at
BEFORE UPDATE ON public.apple_push_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();