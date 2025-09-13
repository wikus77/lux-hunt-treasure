-- M1SSION™ Map Notes Persistence - Surgical fix for note persistence
-- Create table for map notes if it doesn't exist
CREATE TABLE IF NOT EXISTS public.map_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marker_id UUID NULL,  -- optional relation to marker
  text TEXT NOT NULL,
  importance TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS map_notes_user_id_idx ON public.map_notes(user_id);
CREATE INDEX IF NOT EXISTS map_notes_marker_id_idx ON public.map_notes(marker_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_map_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_map_notes_updated ON public.map_notes;
CREATE TRIGGER trg_map_notes_updated
  BEFORE UPDATE ON public.map_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_map_notes_updated_at();

-- Enable RLS
ALTER TABLE public.map_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user-scoped access
DROP POLICY IF EXISTS "map_notes_select_own" ON public.map_notes;
DROP POLICY IF EXISTS "map_notes_insert_own" ON public.map_notes;
DROP POLICY IF EXISTS "map_notes_update_own" ON public.map_notes;
DROP POLICY IF EXISTS "map_notes_delete_own" ON public.map_notes;

CREATE POLICY "map_notes_select_own" ON public.map_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "map_notes_insert_own" ON public.map_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "map_notes_update_own" ON public.map_notes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "map_notes_delete_own" ON public.map_notes
  FOR DELETE USING (auth.uid() = user_id);