-- Public wrappers to access mirror_push schema from Edge (PostgREST exposes only public)
-- 1) Get watermark
CREATE OR REPLACE FUNCTION public.mirror_get_watermark(p_name text)
RETURNS timestamptz
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public', 'mirror_push'
AS $$
  SELECT last_run_at FROM mirror_push.sync_watermarks WHERE name = p_name ORDER BY last_run_at DESC LIMIT 1;
$$;

-- 2) Set watermark (upsert-like)
CREATE OR REPLACE FUNCTION public.mirror_set_watermark(p_name text, p_last_run_at timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'mirror_push'
AS $$
BEGIN
  UPDATE mirror_push.sync_watermarks
     SET last_run_at = p_last_run_at
   WHERE name = p_name;
  IF NOT FOUND THEN
    INSERT INTO mirror_push.sync_watermarks(name, last_run_at)
    VALUES (p_name, p_last_run_at);
  END IF;
END;
$$;

-- 3) Bulk insert notification logs from JSONB array; returns inserted count
CREATE OR REPLACE FUNCTION public.mirror_insert_notification_logs(p_records jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'mirror_push'
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  INSERT INTO mirror_push.notification_logs (
    created_at, sent_at, sent_by, provider, status_code,
    title, body, url, endpoint, project_ref, user_id,
    invocation_id, metadata
  )
  SELECT 
    COALESCE((r->>'created_at')::timestamptz, now()),
    (r->>'sent_at')::timestamptz,
    NULLIF(r->>'sent_by','')::uuid,
    COALESCE(r->>'provider','HARVESTER'),
    COALESCE((r->>'status_code')::int, 200),
    NULLIF(r->>'title',''),
    NULLIF(r->>'body',''),
    NULLIF(r->>'url',''),
    NULLIF(r->>'endpoint',''),
    COALESCE(r->>'project_ref',''),
    NULLIF(r->>'user_id','')::uuid,
    r->>'invocation_id',
    COALESCE(r->'metadata', '{}'::jsonb)
  FROM jsonb_array_elements(p_records) AS r;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;