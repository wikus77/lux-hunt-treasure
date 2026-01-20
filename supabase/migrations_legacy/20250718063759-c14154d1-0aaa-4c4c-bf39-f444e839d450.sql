-- Clean test areas created after 2025-07-17
DELETE FROM user_map_areas WHERE created_at >= '2025-07-17T00:00:00Z';

-- Verify active Agrigento target exists
SELECT id, city, lat, lon, is_active FROM buzz_game_targets WHERE is_active = true;