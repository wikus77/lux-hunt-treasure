-- TASK A: Create read-only public views for geo_push schema access

-- 1. Config view (read-only)
CREATE OR REPLACE VIEW public.geo_push_settings_v AS
SELECT * FROM geo_push.settings;

-- 2. Standardized positions view (read-only)
CREATE OR REPLACE VIEW public.geo_push_positions_v AS
SELECT user_id::uuid, lat::float8, lng::float8, updated_at::timestamptz
FROM geo_push.v_positions;

-- 3. Delivery state view (read-only)
CREATE OR REPLACE VIEW public.geo_push_delivery_state_v AS
SELECT * FROM geo_push.delivery_state;