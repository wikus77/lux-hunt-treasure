-- Create table for harvested push logs in mirror_push schema
CREATE TABLE IF NOT EXISTS mirror_push.harvested_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  auth_user_id UUID,
  request_body JSONB,
  response_body JSONB,
  status_code INTEGER,
  project_ref TEXT,
  title TEXT,
  body TEXT,
  url TEXT,
  target_config JSONB,
  endpoint_details JSONB[], -- Array of {endpoint, status_code, user_id}
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_success INTEGER DEFAULT 0,
  providers TEXT[] DEFAULT '{}', -- ['fcm', 'apns']
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS harvested_logs_execution_timestamp_idx 
ON mirror_push.harvested_logs (execution_id, timestamp);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS harvested_logs_timestamp_idx ON mirror_push.harvested_logs (timestamp);
CREATE INDEX IF NOT EXISTS harvested_logs_auth_user_idx ON mirror_push.harvested_logs (auth_user_id);
CREATE INDEX IF NOT EXISTS harvested_logs_title_body_idx ON mirror_push.harvested_logs USING gin((title || ' ' || body) gin_trgm_ops);

-- Create watermark table for scheduler
CREATE TABLE IF NOT EXISTS mirror_push.harvest_watermarks (
  id TEXT PRIMARY KEY DEFAULT 'global',
  last_harvest_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial watermark
INSERT INTO mirror_push.harvest_watermarks (id, last_harvest_timestamp)
VALUES ('global', now() - INTERVAL '24 hours')
ON CONFLICT (id) DO NOTHING;

-- RLS policies for harvested_logs
ALTER TABLE mirror_push.harvested_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access harvested logs"
ON mirror_push.harvested_logs
FOR ALL
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

-- RLS policies for watermarks
ALTER TABLE mirror_push.harvest_watermarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access harvest watermarks"
ON mirror_push.harvest_watermarks
FOR ALL
USING (is_admin_secure())
WITH CHECK (is_admin_secure());

-- Function to update watermark
CREATE OR REPLACE FUNCTION mirror_push.update_harvest_watermark(new_timestamp TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = mirror_push, public
AS $$
BEGIN
  UPDATE mirror_push.harvest_watermarks 
  SET last_harvest_timestamp = new_timestamp, updated_at = now()
  WHERE id = 'global';
END;
$$;