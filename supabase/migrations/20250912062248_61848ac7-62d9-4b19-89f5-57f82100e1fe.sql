-- Drop e ricrea vista con campi corretti
DROP VIEW IF EXISTS mirror_push.v_search;

CREATE VIEW mirror_push.v_search AS
SELECT created_at, sent_at, user_id, provider, title, body, url, source
FROM mirror_push.notification_logs;