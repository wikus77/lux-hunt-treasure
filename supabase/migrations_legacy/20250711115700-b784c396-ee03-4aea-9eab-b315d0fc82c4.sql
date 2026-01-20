-- by Joseph Mulé – M1SSION™ – FORCE_RESET_BUZZ_COUNTER_110725
-- Reset forzato contatore BUZZ oggi

UPDATE user_buzz_counter 
SET buzz_count = 0, 
    week_map_generations = '{0,0,0,0}'::integer[]
WHERE date = '2025-07-11' AND buzz_count > 0;