-- Update Apple Push config with the correct certificate details from the screenshot
INSERT INTO public.apple_push_config (
  team_id,
  key_id, 
  bundle_id,
  private_key
) VALUES (
  'PLACEHOLDER_TEAM_ID', -- You need to find this in your Apple Developer account
  'mHTPRPG5K2', -- From the screenshot
  'app.lovable.2716f91b957c47ba91e06f572f3ce00d',
  'PLACEHOLDER_P8_CONTENT' -- Content of the .p8 file
) ON CONFLICT (id) DO UPDATE SET
  team_id = EXCLUDED.team_id,
  key_id = EXCLUDED.key_id,
  private_key = EXCLUDED.private_key,
  updated_at = now();