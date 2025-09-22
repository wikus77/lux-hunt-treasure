-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Create reward_type enum
DO $$ BEGIN
    CREATE TYPE reward_type AS ENUM ('BUZZ_FREE', 'MESSAGE', 'XP_POINTS', 'EVENT_TICKET', 'BADGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create marker_drops table for batch tracking
CREATE TABLE IF NOT EXISTS marker_drops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    seed text,
    bbox jsonb,
    summary jsonb NOT NULL,
    created_count integer DEFAULT 0
);

-- Add indices for marker_drops
CREATE INDEX IF NOT EXISTS idx_marker_drops_created_at ON marker_drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marker_drops_created_by ON marker_drops(created_by);

-- Add new columns to existing markers table
ALTER TABLE markers 
ADD COLUMN IF NOT EXISTS reward_type reward_type,
ADD COLUMN IF NOT EXISTS reward_payload jsonb,
ADD COLUMN IF NOT EXISTS drop_id uuid REFERENCES marker_drops(id) ON DELETE SET NULL;

-- Add index for markers drop tracking
CREATE INDEX IF NOT EXISTS idx_markers_drop_reward ON markers(drop_id, reward_type) WHERE drop_id IS NOT NULL;

-- RLS for marker_drops
ALTER TABLE marker_drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marker_drops_select_admin" ON marker_drops
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "marker_drops_insert_admin" ON marker_drops
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Function to get drop statistics
CREATE OR REPLACE FUNCTION get_drop_stats(drop_uuid uuid)
RETURNS TABLE(
    reward_type text,
    total_count bigint,
    active_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.reward_type::text,
        COUNT(*)::bigint as total_count,
        COUNT(*) FILTER (WHERE m.active = true)::bigint as active_count
    FROM markers m
    WHERE m.drop_id = drop_uuid
    GROUP BY m.reward_type
    ORDER BY m.reward_type;
END;
$$;