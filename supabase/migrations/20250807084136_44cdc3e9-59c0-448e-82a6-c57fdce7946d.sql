-- © 2025 Joseph MULÉ – M1SSION™ – QR SYSTEM FIXED
-- Create the missing QR reward for testing UUID: d77d97f1-7e4c-4def-9270-44b6a59ba478

INSERT INTO public.qr_rewards (
  id,
  location_name,
  lat,
  lon,
  reward_type,
  message,
  max_distance_meters,
  attivo,
  created_at,
  updated_at
) VALUES (
  'd77d97f1-7e4c-4def-9270-44b6a59ba478',
  'Roma 14, Ventimiglia',
  43.7944,
  7.6036,
  'sorpresa_speciale',
  '🌀 Congratulazioni! Hai trovato un reward segreto M1SSION™! Questo QR era nascosto per agenti speciali come te.',
  100,
  true,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  location_name = EXCLUDED.location_name,
  lat = EXCLUDED.lat,
  lon = EXCLUDED.lon,
  reward_type = EXCLUDED.reward_type,
  message = EXCLUDED.message,
  max_distance_meters = EXCLUDED.max_distance_meters,
  attivo = true,
  updated_at = now();