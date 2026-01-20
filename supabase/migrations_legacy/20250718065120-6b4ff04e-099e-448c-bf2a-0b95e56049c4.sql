-- Clean test areas and verify Agrigento target
DELETE FROM user_map_areas WHERE created_at >= '2025-07-17T00:00:00Z';

-- Ensure active Agrigento target exists
UPDATE buzz_game_targets 
SET is_active = true, 
    lat = 37.3156, 
    lon = 13.5839,
    city = 'Agrigento',
    address = 'Agrigento, Sicily, Italy'
WHERE city ILIKE '%agrigento%';

-- Verify the setup
SELECT id, city, lat, lon, is_active FROM buzz_game_targets WHERE is_active = true;