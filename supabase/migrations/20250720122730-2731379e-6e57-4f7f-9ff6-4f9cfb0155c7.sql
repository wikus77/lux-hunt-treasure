-- Inserisci il target della missione (coordinate dell'Europa per test)
INSERT INTO public.mission_targets (mission_id, latitude, longitude, target_hash, is_revealed)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  48.8566,  -- Parigi come target di esempio
  2.3522,
  encode(sha256('48.8566,2.3522'::bytea), 'hex'),
  false
);