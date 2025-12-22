-- © 2025 Joseph MULÉ – M1SSION™ – FIX: user_clues PRIMARY KEY
-- Il problema: pkey era su clue_id invece che su (user_id, clue_id)

-- 1. Drop the wrong primary key constraint
ALTER TABLE public.user_clues DROP CONSTRAINT IF EXISTS user_clues_pkey;

-- 2. Add id column if not exists (for proper PK)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_clues' AND column_name = 'id') THEN
    ALTER TABLE public.user_clues ADD COLUMN id UUID DEFAULT gen_random_uuid();
  END IF;
END $$;

-- 3. Update any null IDs
UPDATE public.user_clues SET id = gen_random_uuid() WHERE id IS NULL;

-- 4. Add proper primary key on id
ALTER TABLE public.user_clues ADD PRIMARY KEY (id);

-- 5. Ensure unique constraint on (user_id, clue_id) exists
ALTER TABLE public.user_clues DROP CONSTRAINT IF EXISTS user_clues_user_id_clue_id_key;
ALTER TABLE public.user_clues ADD CONSTRAINT user_clues_user_id_clue_id_key UNIQUE (user_id, clue_id);

-- 6. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_clues_user_clue ON public.user_clues (user_id, clue_id);

DO $$ BEGIN RAISE NOTICE '✅ user_clues PRIMARY KEY fixed!'; END $$;
