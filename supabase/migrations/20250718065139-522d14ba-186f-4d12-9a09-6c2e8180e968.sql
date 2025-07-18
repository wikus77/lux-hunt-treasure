-- Simple cleanup without trigger conflicts
DELETE FROM user_map_areas WHERE created_at >= '2025-07-17T00:00:00Z';