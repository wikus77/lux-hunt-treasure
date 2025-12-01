-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Chat System Migration - Phase 1: Direct Messages (1-to-1)
-- With server-side encryption using pgcrypto

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name TEXT, -- Only for group chats
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat members table
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  muted BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

-- Chat messages table with encryption
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_encrypted BYTEA NOT NULL, -- Encrypted content
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'location', 'system')),
  metadata JSONB DEFAULT '{}', -- For location data, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_conversation ON chat_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- Encryption key (stored securely - in production use Vault)
-- Using a fixed key for simplicity - in production, use per-conversation keys
CREATE OR REPLACE FUNCTION get_chat_encryption_key()
RETURNS BYTEA AS $$
BEGIN
  -- In production, fetch from Supabase Vault or environment
  RETURN decode('m1ss10n_ch4t_3ncrypt10n_k3y_2025', 'escape');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt message content
CREATE OR REPLACE FUNCTION encrypt_chat_message(content TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(content, encode(get_chat_encryption_key(), 'escape'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt message content
CREATE OR REPLACE FUNCTION decrypt_chat_message(encrypted_content BYTEA)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_content, encode(get_chat_encryption_key(), 'escape'));
EXCEPTION WHEN OTHERS THEN
  RETURN '[Messaggio non disponibile]';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message (handles encryption)
CREATE OR REPLACE FUNCTION send_chat_message(
  p_conversation_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_sender_id UUID;
  v_message_id UUID;
  v_is_member BOOLEAN;
BEGIN
  -- Get current user
  v_sender_id := auth.uid();
  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user is member of conversation
  SELECT EXISTS(
    SELECT 1 FROM chat_members 
    WHERE conversation_id = p_conversation_id AND user_id = v_sender_id
  ) INTO v_is_member;
  
  IF NOT v_is_member THEN
    RAISE EXCEPTION 'Not a member of this conversation';
  END IF;
  
  -- Insert encrypted message
  INSERT INTO chat_messages (
    conversation_id, 
    sender_id, 
    content_encrypted, 
    message_type, 
    metadata
  ) VALUES (
    p_conversation_id,
    v_sender_id,
    encrypt_chat_message(p_content),
    p_message_type,
    p_metadata
  ) RETURNING id INTO v_message_id;
  
  -- Update conversation updated_at
  UPDATE chat_conversations SET updated_at = NOW() WHERE id = p_conversation_id;
  
  -- Update sender's last_read_at
  UPDATE chat_members SET last_read_at = NOW() 
  WHERE conversation_id = p_conversation_id AND user_id = v_sender_id;
  
  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create direct conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_chat(p_other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_current_user_id UUID;
  v_conversation_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF v_current_user_id = p_other_user_id THEN
    RAISE EXCEPTION 'Cannot create chat with yourself';
  END IF;
  
  -- Check if direct conversation already exists between these two users
  SELECT c.id INTO v_conversation_id
  FROM chat_conversations c
  WHERE c.type = 'direct'
    AND EXISTS (SELECT 1 FROM chat_members WHERE conversation_id = c.id AND user_id = v_current_user_id)
    AND EXISTS (SELECT 1 FROM chat_members WHERE conversation_id = c.id AND user_id = p_other_user_id)
    AND (SELECT COUNT(*) FROM chat_members WHERE conversation_id = c.id) = 2;
  
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO chat_conversations (type) VALUES ('direct') RETURNING id INTO v_conversation_id;
  
  -- Add both users as members
  INSERT INTO chat_members (conversation_id, user_id, role) VALUES 
    (v_conversation_id, v_current_user_id, 'member'),
    (v_conversation_id, p_other_user_id, 'member');
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's conversations with last message
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
    CASE WHEN c.type = 'direct' THEN (
      SELECT p.username FROM chat_members cm2 
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

-- Function to get messages for a conversation
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
    p.username AS sender_username,
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

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_members 
  SET last_read_at = NOW() 
  WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: users can only see conversations they're members of
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_members WHERE conversation_id = id AND user_id = auth.uid())
  );

-- Members: users can see members of their conversations
CREATE POLICY "Users can view conversation members" ON chat_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_members cm WHERE cm.conversation_id = conversation_id AND cm.user_id = auth.uid())
  );

-- Messages: users can see messages in their conversations
CREATE POLICY "Users can view conversation messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_members WHERE conversation_id = chat_messages.conversation_id AND user_id = auth.uid())
  );

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

