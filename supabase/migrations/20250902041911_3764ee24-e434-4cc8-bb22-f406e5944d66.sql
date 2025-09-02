-- Pulizia subscription orfane senza user_id e aggiorna quelle esistenti
DELETE FROM push_subscriptions WHERE user_id IS NULL;

-- Assicurati che il campo user_id sia NOT NULL per future inserimenti
ALTER TABLE push_subscriptions ALTER COLUMN user_id SET NOT NULL;