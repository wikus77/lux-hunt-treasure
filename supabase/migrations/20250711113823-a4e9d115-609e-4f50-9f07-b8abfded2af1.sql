-- by Joseph Mulé – M1SSION™ – RESET_GAME_110725
-- Reset completo sistema M1SSION™ per avvio ufficiale gioco

-- 1. Reset contatori BUZZ per tutti gli utenti
UPDATE user_buzz_counter 
SET buzz_count = 0, 
    week_map_generations = '{0,0,0,0}'::integer[]
WHERE buzz_count > 0;

-- 2. Eliminazione completa indizi trovati
DELETE FROM user_clues;

-- 3. Eliminazione completa notifiche
DELETE FROM user_notifications;

-- 4. Eliminazione aree mappa BUZZ
DELETE FROM user_buzz_map;

-- 5. Eliminazione aree missione utente
DELETE FROM user_map_areas;

-- 6. Reset contatori mappa BUZZ
UPDATE user_buzz_map_counter 
SET buzz_map_count = 0,
    week_map_counts = '{0,0,0,0,0,0,0}'::integer[]
WHERE buzz_map_count > 0;