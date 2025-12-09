-- Verifica struttura tabella prize_clues
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'prize_clues'
ORDER BY ordinal_position;

