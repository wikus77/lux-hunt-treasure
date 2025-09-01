-- Update Apple Push config with the actual certificate details
UPDATE public.apple_push_config SET
  team_id = 'HWA2D2745B',
  key_id = 'mHTPRPG5K2',
  bundle_id = 'app.lovable.2716f91b957c47ba91e06f572f3ce00d',
  private_key = '-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgvOxoWg00WbyK6ZGX
qdM4hq9/STdymZ5FCwbaMhFuW2mgCgYIKoZIzj0DAQehRANCAASYTQZxL/dgx520
1lpnq1f6Hu6XUwJP/0WFku9s3pEFOOhUueLbzRoEQAAcZRF1lPbW2UEox+ZqLuPo
wXvkV7qp
-----END PRIVATE KEY-----',
  updated_at = now()
WHERE id = (SELECT id FROM public.apple_push_config LIMIT 1);

-- If no record exists, insert it
INSERT INTO public.apple_push_config (
  team_id,
  key_id, 
  bundle_id,
  private_key
) 
SELECT 
  'HWA2D2745B',
  'mHTPRPG5K2',
  'app.lovable.2716f91b957c47ba91e06f572f3ce00d',
  '-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgvOxoWg00WbyK6ZGX
qdM4hq9/STdymZ5FCwbaMhFuW2mgCgYIKoZIzj0DAQehRANCAASYTQZxL/dgx520
1lpnq1f6Hu6XUwJP/0WFku9s3pEFOOhUueLbzRoEQAAcZRF1lPbW2UEox+ZqLuPo
wXvkV7qp
-----END PRIVATE KEY-----'
WHERE NOT EXISTS (SELECT 1 FROM public.apple_push_config);