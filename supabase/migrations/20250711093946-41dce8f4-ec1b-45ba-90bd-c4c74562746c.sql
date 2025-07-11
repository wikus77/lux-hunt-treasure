-- Aggiungi colonne mancanti alla tabella user_clues per supportare il nuovo BUZZ_CLUE_ENGINE
ALTER TABLE user_clues ADD COLUMN IF NOT EXISTS week_number INTEGER DEFAULT 1;
ALTER TABLE user_clues ADD COLUMN IF NOT EXISTS is_misleading BOOLEAN DEFAULT false;
ALTER TABLE user_clues ADD COLUMN IF NOT EXISTS location_id UUID;
ALTER TABLE user_clues ADD COLUMN IF NOT EXISTS prize_id UUID;
ALTER TABLE user_clues ADD COLUMN IF NOT EXISTS clue_category TEXT DEFAULT 'general'; -- 'location' o 'prize' o 'general'

-- Aggiungi indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_user_clues_week_number ON user_clues(week_number);
CREATE INDEX IF NOT EXISTS idx_user_clues_category ON user_clues(clue_category);
CREATE INDEX IF NOT EXISTS idx_user_clues_user_week ON user_clues(user_id, week_number);

-- Crea tabella per tracciare gli indizi già utilizzati per ogni utente
CREATE TABLE IF NOT EXISTS user_used_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prize_clue_id UUID,
  custom_clue_text TEXT,
  week_number INTEGER NOT NULL,
  clue_category TEXT NOT NULL, -- 'location' o 'prize'
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, prize_clue_id),
  UNIQUE(user_id, custom_clue_text, week_number, clue_category)
);

-- Abilita RLS sulla nuova tabella
ALTER TABLE user_used_clues ENABLE ROW LEVEL SECURITY;

-- Policy per user_used_clues
CREATE POLICY "Users can manage their own used clues" ON user_used_clues
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Aggiungi foreign key references se non esistono già
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_clues_location_id_fkey'
  ) THEN
    ALTER TABLE user_clues ADD CONSTRAINT user_clues_location_id_fkey 
    FOREIGN KEY (location_id) REFERENCES prizes(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_clues_prize_id_fkey'
  ) THEN
    ALTER TABLE user_clues ADD CONSTRAINT user_clues_prize_id_fkey 
    FOREIGN KEY (prize_id) REFERENCES prizes(id);
  END IF;
END $$;