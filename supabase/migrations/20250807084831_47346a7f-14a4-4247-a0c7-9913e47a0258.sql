-- © 2025 Joseph MULÉ – M1SSION™ – FIX QR SYSTEM REAL UUID
-- Create the ACTUAL QR reward being tested: 673368af-487a-43df-940c-02ffcc023664

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
  '673368af-487a-43df-940c-02ffcc023664',
  'Test QR - M1SSION Safari iOS',
  43.7944,
  7.6036,
  'sorpresa_speciale',
  '🎯 QR Test Funzionante! Questo reward è stato creato per verificare il corretto funzionamento su Safari iOS.',
  50,
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