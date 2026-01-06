-- =====================================================
-- M1SSION™ Chat Username Display Fix
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- =====================================================
-- FIX: Username/Agent Code display in chat
-- Adds fallback: full_name -> username -> agent_code -> 'Agente'
-- =====================================================

-- 1. Update get_my_conversations() function
CREATE OR REPLACE FUNCTION get_my_conversations()
RETURNS TABLE (
  conversation_id UUID,
  conversation_type TEXT,
  conversation_name TEXT,
  other_user_id UUID,
  other_user_username TEXT,
  other_user_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID,
  unread_count BIGINT,
  is_muted BOOLEAN
) AS $$
DECLARE
  v_current_user_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  IF v_current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id AS conversation_id,
    c.type AS conversation_type,
    c.name AS conversation_name,
    -- For direct chats, get the other user
    CASE WHEN c.type = 'direct' THEN (
      SELECT cm2.user_id FROM chat_members cm2 
      WHERE cm2.conversation_id = c.id AND cm2.user_id != v_current_user_id
      LIMIT 1
    ) ELSE NULL END AS other_user_id,
    -- ✅ FIX: Use COALESCE for fallback display name
    CASE WHEN c.type = 'direct' THEN (
      SELECT COALESCE(p.full_name, p.username, p.agent_code, 'Agente') 
      FROM chat_members cm2 
      JOIN profiles p ON p.id = cm2.user_id
      WHERE cm2.conversation_id = c.id AND cm2.user_id != v_current_user_id
      LIMIT 1
    ) ELSE c.name END AS other_user_username,
    CASE WHEN c.type = 'direct' THEN (
      SELECT p.avatar_url FROM chat_members cm2 
      JOIN profiles p ON p.id = cm2.user_id
      WHERE cm2.conversation_id = c.id AND cm2.user_id != v_current_user_id
      LIMIT 1
    ) ELSE NULL END AS other_user_avatar,
    -- Last message (decrypted)
    (SELECT decrypt_chat_message(m.content_encrypted) 
     FROM chat_messages m 
     WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
     ORDER BY m.created_at DESC LIMIT 1) AS last_message,
    (SELECT m.created_at 
     FROM chat_messages m 
     WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
     ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
    (SELECT m.sender_id 
     FROM chat_messages m 
     WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
     ORDER BY m.created_at DESC LIMIT 1) AS last_message_sender_id,
    -- Unread count
    (SELECT COUNT(*) FROM chat_messages m 
     WHERE m.conversation_id = c.id 
       AND m.created_at > cm.last_read_at 
       AND m.sender_id != v_current_user_id
       AND m.deleted_at IS NULL) AS unread_count,
    cm.muted AS is_muted
  FROM chat_conversations c
  JOIN chat_members cm ON cm.conversation_id = c.id AND cm.user_id = v_current_user_id
  ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update get_chat_messages() function
CREATE OR REPLACE FUNCTION get_chat_messages(
  p_conversation_id UUID,
  p_limit INT DEFAULT 50,
  p_before TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  message_id UUID,
  sender_id UUID,
  sender_username TEXT,
  sender_avatar TEXT,
  content TEXT,
  message_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  is_own BOOLEAN
) AS $$
DECLARE
  v_current_user_id UUID;
  v_is_member BOOLEAN;
BEGIN
  v_current_user_id := auth.uid();
  IF v_current_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check membership
  SELECT EXISTS(
    SELECT 1 FROM chat_members WHERE conversation_id = p_conversation_id AND user_id = v_current_user_id
  ) INTO v_is_member;
  
  IF NOT v_is_member THEN
    RETURN;
  END IF;
  
  -- Update last_read_at
  UPDATE chat_members SET last_read_at = NOW() 
  WHERE conversation_id = p_conversation_id AND user_id = v_current_user_id;
  
  RETURN QUERY
  SELECT 
    m.id AS message_id,
    m.sender_id,
    -- ✅ FIX: Use COALESCE for fallback display name
    COALESCE(p.full_name, p.username, p.agent_code, 'Agente') AS sender_username,
    p.avatar_url AS sender_avatar,
    decrypt_chat_message(m.content_encrypted) AS content,
    m.message_type,
    m.metadata,
    m.created_at,
    (m.sender_id = v_current_user_id) AS is_own
  FROM chat_messages m
  JOIN profiles p ON p.id = m.sender_id
  WHERE m.conversation_id = p_conversation_id
    AND m.deleted_at IS NULL
    AND (p_before IS NULL OR m.created_at < p_before)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$ BEGIN RAISE NOTICE '✅ Chat username display fix applied successfully!'; END $$;

