
-- Create the prize_clues table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.prize_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  description_it TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  clue_type TEXT NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for the prize_clues table
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage prize_clues
CREATE POLICY "Admins can manage prize clues"
  ON public.prize_clues
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
