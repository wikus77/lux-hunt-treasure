-- 🧹 CLEANUP per TEST: Pulizia aree BUZZ per user specifico
-- Query manuale per resettare dati test
-- User ID: 495246c1-9154-4f01-a428-7f37fe230180

-- Cancella tutte le aree mappa per utente test
DELETE FROM user_map_areas 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180';

-- Cancella transazioni di test incomplete
DELETE FROM payment_transactions 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180' 
AND status = 'pending' 
AND created_at < NOW() - INTERVAL '1 hour';

-- Verifica che non ci siano più aree attive per questo utente
SELECT COUNT(*) as remaining_areas 
FROM user_map_areas 
WHERE user_id = '495246c1-9154-4f01-a428-7f37fe230180';