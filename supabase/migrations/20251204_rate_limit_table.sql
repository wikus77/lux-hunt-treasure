-- © 2025 Joseph MULÉ – M1SSION™ – Rate Limit Log Table
-- Stores rate limiting data for distributed Edge Functions

-- Create rate_limit_log table
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_created 
ON rate_limit_log(identifier, created_at DESC);

-- Create index for cleanup operations
CREATE INDEX IF NOT EXISTS idx_rate_limit_created 
ON rate_limit_log(created_at);

-- Enable RLS
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Only service_role can access this table (Edge Functions use service_role)
CREATE POLICY "Service role full access to rate_limit_log"
ON rate_limit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create cleanup function to remove old entries (keep last 24 hours)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM rate_limit_log 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Create scheduled cleanup (runs every hour)
-- Note: This requires pg_cron extension
SELECT cron.schedule(
    'cleanup-rate-limit-log',
    '0 * * * *',  -- Every hour
    $$SELECT cleanup_rate_limit_log()$$
);

-- Grant execute to service_role
GRANT EXECUTE ON FUNCTION cleanup_rate_limit_log() TO service_role;

-- Comment
COMMENT ON TABLE rate_limit_log IS 'Stores rate limiting data for distributed Edge Functions - auto-cleaned every 24h';



