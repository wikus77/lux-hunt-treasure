-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Database Trigger for Chat Push Notifications
-- Calls chat-push-notify Edge Function on new messages

-- Create the trigger function
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  request_id TEXT;
BEGIN
  -- Build payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'chat_messages',
    'record', jsonb_build_object(
      'id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'message_type', NEW.message_type,
      'metadata', NEW.metadata,
      'created_at', NEW.created_at
    )
  );

  -- Call Edge Function asynchronously via pg_net (if available)
  -- This is a fire-and-forget call
  BEGIN
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/chat-push-notify',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := payload
    ) INTO request_id;
    
    RAISE LOG '[CHAT-PUSH-TRIGGER] Sent notification request: %', request_id;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE LOG '[CHAT-PUSH-TRIGGER] Failed to send notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (only fires on INSERT, not UPDATE/DELETE)
DROP TRIGGER IF EXISTS on_chat_message_insert ON chat_messages;

CREATE TRIGGER on_chat_message_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION notify_chat_message() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_chat_message() TO service_role;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

