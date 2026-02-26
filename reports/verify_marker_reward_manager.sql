-- ============================================================================
-- READ-ONLY: Verifica Marker Reward Manager (card → markers/marker_rewards)
-- Eseguire in Supabase SQL Editor. Nessuna modifica al DB.
-- ============================================================================

-- FASE B.1) Schema colonne markers
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'markers'
ORDER BY ordinal_position;

-- FASE B.2) Ultimi 50 marker (ordine per id; usare created_at se esiste nello schema)
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
ORDER BY id DESC
LIMIT 50;

-- FASE B.3) Marker vicini Roma (41.9028, 12.4964)
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
WHERE abs(lat - 41.9028) < 0.01 AND abs(lng - 12.4964) < 0.01
ORDER BY id DESC
LIMIT 50;

-- FASE B.4) Se created_at esiste, ultimi 50 per data
-- (decommentare solo se FASE B.1 mostra la colonna created_at)
-- SELECT id, lat, lng, title, active, created_at, visible_from, visible_to
-- FROM public.markers ORDER BY created_at DESC LIMIT 50;

-- FASE C) Stessi filtri della mappa (active + visible)
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
WHERE active = true
  AND (visible_from IS NULL OR visible_from <= now())
  AND (visible_to IS NULL OR visible_to >= now())
ORDER BY id DESC
LIMIT 200;

-- FASE D) Integrità claim → marker (sostituire con il tuo claim_id e marker_id)
SELECT pc.id AS claim_id, pc.marker_id, pc.status, pc.claimed_at, pc.prize_name
FROM public.prize_claims pc
WHERE pc.id = '0865aca5-3aaa-4d1c-ae06-c31e580a046d';

SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
WHERE id = '55d4bc74-4de8-464d-a3eb-b7240b47b4ec';

-- FASE E.1) Colonne net.http_request_queue (NON usare created_at se non esiste)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net' AND table_name = 'http_request_queue'
ORDER BY ordinal_position;

-- FASE E.2) Colonne net.http_response
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'net' AND table_name = 'http_response'
ORDER BY ordinal_position;
