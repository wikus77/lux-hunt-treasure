-- Enable realtime for mission_enrollments
ALTER TABLE public.mission_enrollments REPLICA IDENTITY FULL;

-- Add to realtime publication if not already there
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_enrollments;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication, ignore
  END;
END $$;