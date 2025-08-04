-- ✅ CRITICAL FIX: Clean up invalid JSON tokens and ensure pure string storage
-- Remove all invalid JSON tokens from device_tokens table
DELETE FROM device_tokens WHERE token LIKE '{%';

-- Update device_tokens table to add constraint for pure string tokens
ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS valid_token_format;
ALTER TABLE device_tokens ADD CONSTRAINT valid_token_format 
CHECK (token NOT LIKE '{%' AND length(token) > 10);