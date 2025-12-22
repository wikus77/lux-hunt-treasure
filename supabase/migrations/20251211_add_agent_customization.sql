-- Migration: Add agent_customization JSONB column to profiles table
-- This stores the user's Agent Lab customization (model, skin tone, equipped outfits, owned items)
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Add the JSONB column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'agent_customization'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN agent_customization JSONB DEFAULT '{}'::jsonb;
    
    COMMENT ON COLUMN public.profiles.agent_customization IS 'Agent Lab customization data: {customization: {modelId, skinToneId, equippedOutfits}, ownedOutfits: []}';
  END IF;
END $$;

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_agent_customization 
ON public.profiles USING gin (agent_customization);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;



