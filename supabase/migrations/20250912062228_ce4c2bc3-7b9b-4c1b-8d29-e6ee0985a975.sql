-- Fix vista di ricerca con campi corretti
CREATE OR REPLACE VIEW mirror_push.v_search AS
SELECT created_at, sent_at, user_id, provider, title, body, url, source
FROM mirror_push.notification_logs;