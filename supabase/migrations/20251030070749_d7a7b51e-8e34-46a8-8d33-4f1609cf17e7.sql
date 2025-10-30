-- Create table for DNA visual target positions (4x4x4 cube lattice)
CREATE TABLE IF NOT EXISTS public.agent_dna_visual (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{"targets":{}}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agent_dna_visual ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own visual data
CREATE POLICY "Users can view own visual data"
  ON public.agent_dna_visual FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visual data"
  ON public.agent_dna_visual FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visual data"
  ON public.agent_dna_visual FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get DNA visual data with deterministic seeding
CREATE OR REPLACE FUNCTION public.get_agent_dna_visual(seed BOOLEAN DEFAULT TRUE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID := auth.uid();
  visual_data JSONB;
  user_str TEXT;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('targets', jsonb_build_object());
  END IF;

  -- Try to get existing data
  SELECT data INTO visual_data 
  FROM public.agent_dna_visual 
  WHERE user_id = uid;

  -- If no data exists and seed is true, generate deterministic positions
  IF visual_data IS NULL AND seed THEN
    user_str := uid::TEXT;
    
    -- Generate deterministic cell positions [x,y,z] in 4x4x4 grid (0-3 range)
    visual_data := jsonb_build_object(
      'targets', jsonb_build_object(
        'audacia', jsonb_build_object(
          'cell', ARRAY[
            (ascii(substr(user_str, 1, 1)) % 4),
            (ascii(substr(user_str, 2, 1)) % 4),
            (ascii(substr(user_str, 3, 1)) % 4)
          ],
          'level', 1
        ),
        'etica', jsonb_build_object(
          'cell', ARRAY[
            (ascii(substr(user_str, 4, 1)) % 4),
            (ascii(substr(user_str, 5, 1)) % 4),
            (ascii(substr(user_str, 6, 1)) % 4)
          ],
          'level', 1
        ),
        'rischio', jsonb_build_object(
          'cell', ARRAY[
            (ascii(substr(user_str, 7, 1)) % 4),
            (ascii(substr(user_str, 8, 1)) % 4),
            (ascii(substr(user_str, 9, 1)) % 4)
          ],
          'level', 1
        ),
        'intuito', jsonb_build_object(
          'cell', ARRAY[
            (ascii(substr(user_str, 10, 1)) % 4),
            (ascii(substr(user_str, 11, 1)) % 4),
            (ascii(substr(user_str, 12, 1)) % 4)
          ],
          'level', 1
        ),
        'vibrazione', jsonb_build_object(
          'cell', ARRAY[
            (ascii(substr(user_str, 13, 1)) % 4),
            (ascii(substr(user_str, 14, 1)) % 4),
            (ascii(substr(user_str, 15, 1)) % 4)
          ],
          'level', 1
        )
      )
    );

    -- Store the generated data
    INSERT INTO public.agent_dna_visual(user_id, data)
    VALUES (uid, visual_data)
    ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data;
  END IF;

  RETURN COALESCE(visual_data, jsonb_build_object('targets', jsonb_build_object()));
END;
$$;

-- Function to update DNA visual data
CREATE OR REPLACE FUNCTION public.set_agent_dna_visual(payload JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.agent_dna_visual(user_id, data)
  VALUES (uid, payload)
  ON CONFLICT (user_id) 
  DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
  
  RETURN TRUE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_agent_dna_visual(BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_agent_dna_visual(JSONB) TO authenticated;