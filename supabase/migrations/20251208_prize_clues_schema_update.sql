-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Aggiornamento schema prize_clues per supportare generate-mission-clues V3

-- 1. Aggiungi colonne mancanti
ALTER TABLE public.prize_clues 
  ADD COLUMN IF NOT EXISTS week INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS clue_category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS description_it TEXT,
  ADD COLUMN IF NOT EXISTS title_it TEXT,
  ADD COLUMN IF NOT EXISTS is_fake BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS clue_type TEXT DEFAULT 'real';

-- 2. Rimuovi vincolo NOT NULL da clue_text (ora usiamo description_it)
ALTER TABLE public.prize_clues 
  ALTER COLUMN clue_text DROP NOT NULL;

-- 3. Rimuovi il vincolo FK esistente (prize_id → prizes)
ALTER TABLE public.prize_clues 
  DROP CONSTRAINT IF EXISTS prize_clues_prize_id_fkey;

-- 4. Indici per performance
CREATE INDEX IF NOT EXISTS idx_prize_clues_week ON public.prize_clues(week);
CREATE INDEX IF NOT EXISTS idx_prize_clues_category ON public.prize_clues(clue_category);
CREATE INDEX IF NOT EXISTS idx_prize_clues_is_fake ON public.prize_clues(is_fake);
CREATE INDEX IF NOT EXISTS idx_prize_clues_prize_week ON public.prize_clues(prize_id, week);

-- 5. Policy per service_role (necessario per Edge Function)
DROP POLICY IF EXISTS "Service role can manage prize clues" ON public.prize_clues;
CREATE POLICY "Service role can manage prize clues" ON public.prize_clues
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 6. Commenti
COMMENT ON COLUMN public.prize_clues.week IS 'Settimana missione (1-4)';
COMMENT ON COLUMN public.prize_clues.clue_category IS 'Categoria indizio: location, prize, general';
COMMENT ON COLUMN public.prize_clues.description_it IS 'Testo italiano dell''indizio';
COMMENT ON COLUMN public.prize_clues.is_fake IS 'Se true, è un indizio fuorviante';
COMMENT ON COLUMN public.prize_clues.difficulty_level IS 'Livello difficoltà (1-4)';
COMMENT ON COLUMN public.prize_clues.clue_type IS 'Tipo: real, decoy';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


