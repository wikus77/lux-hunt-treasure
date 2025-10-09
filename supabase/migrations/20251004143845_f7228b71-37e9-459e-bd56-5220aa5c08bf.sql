-- Enable realtime for mission_enrollments and ensure full row replica for updates
DO $$
BEGIN
  -- Set REPLICA IDENTITY FULL so updates emit full row data
  BEGIN
    EXECUTE 'ALTER TABLE public.mission_enrollments REPLICA IDENTITY FULL';
  EXCEPTION WHEN others THEN
    -- Ignore if already set or table not found
    NULL;
  END;

  -- Add table to supabase_realtime publication (ignore if already added)
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_enrollments';
  EXCEPTION WHEN others THEN
    NULL;
  END;
END
$$;