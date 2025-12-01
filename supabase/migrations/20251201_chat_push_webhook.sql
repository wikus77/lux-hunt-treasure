-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Chat Push Notifications Setup
-- NOTA: Per il webhook, configurarlo manualmente su Supabase Dashboard:
-- Database → Webhooks → Create new webhook
-- 
-- Name: chat_message_push_notify
-- Table: chat_messages
-- Events: INSERT
-- HTTP Method: POST
-- URL: https://<project-ref>.supabase.co/functions/v1/chat-push-notify
-- Headers: Authorization: Bearer <service_role_key>

-- Funzione alternativa per chiamare direttamente (senza pg_net)
-- Questa funzione può essere chiamata manualmente o via RPC

CREATE OR REPLACE FUNCTION trigger_chat_push_notification(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_message_preview TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Questa funzione è un placeholder
  -- Le notifiche vengono inviate tramite Database Webhook configurato su Supabase Dashboard
  -- oppure chiamando direttamente la Edge Function dal frontend
  
  v_result := jsonb_build_object(
    'triggered', true,
    'conversation_id', p_conversation_id,
    'sender_id', p_sender_id,
    'timestamp', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION trigger_chat_push_notification(UUID, UUID, TEXT) TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

