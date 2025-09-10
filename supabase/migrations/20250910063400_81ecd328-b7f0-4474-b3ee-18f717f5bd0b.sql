-- Enable realtime for user_notifications table if not already enabled
DO $$
BEGIN
  -- Add table to realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
    RAISE NOTICE 'Added user_notifications to realtime publication';
  ELSE
    RAISE NOTICE 'user_notifications already in realtime publication';
  END IF;
END
$$;