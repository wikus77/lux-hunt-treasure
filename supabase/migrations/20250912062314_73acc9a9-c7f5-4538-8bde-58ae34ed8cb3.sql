-- Drop e ricrea viste con campi corretti
DROP VIEW IF EXISTS mirror_push.v_search CASCADE;

CREATE VIEW mirror_push.v_search AS
SELECT created_at, sent_at, user_id, provider, title, body, url, source
FROM mirror_push.notification_logs;

-- Ricrea v_search_recent se era necessaria
CREATE VIEW mirror_push.v_search_recent AS
SELECT created_at, sent_at, user_id, provider, title, body, url, source
FROM mirror_push.notification_logs
WHERE created_at >= now() - interval '72 hours'
ORDER BY created_at DESC;