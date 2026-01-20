-- by Joseph Mulé – M1SSION™ – TEST_CLUE_INSERT_110725
-- Test inserimento manuale in user_clues per verificare RLS

INSERT INTO user_clues (
  user_id, 
  title_it, 
  description_it, 
  clue_type, 
  buzz_cost, 
  week_number
) VALUES (
  '495246c1-9154-4f01-a428-7f37fe230180', 
  'Test Clue M1SSION™', 
  'Questo è un test di inserimento clue dopo reset', 
  'location', 
  1.99, 
  5
);