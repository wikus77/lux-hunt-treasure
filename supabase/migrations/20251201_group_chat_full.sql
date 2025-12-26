-- =====================================================
-- M1SSION™ Group Chat System - Full Implementation
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
-- =====================================================

-- 1. DROP existing functions to recreate them cleanly
DROP FUNCTION IF EXISTS encrypt_chat_message(TEXT);
DROP FUNCTION IF EXISTS create_group_chat(UUID[], TEXT);
DROP FUNCTION IF EXISTS request_group_join(UUID);
DROP FUNCTION IF EXISTS handle_join_request(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS get_pending_join_requests(UUID);
DROP FUNCTION IF EXISTS remove_group_member(UUID, UUID);
DROP FUNCTION IF EXISTS update_member_role(UUID, UUID, TEXT);

-- 2. Create encrypt_chat_message function
CREATE OR REPLACE FUNCTION encrypt_chat_message(p_text TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(p_text, 'm1ss10n_ch4t_3ncrypt10n_k3y_2025');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add join_requests table if not exists
CREATE TABLE IF NOT EXISTS chat_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  handled_at TIMESTAMPTZ,
  handled_by UUID REFERENCES auth.users(id),
  UNIQUE(conversation_id, user_id)
);

-- 4. Add 'is_private' column to chat_conversations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_conversations' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN is_private BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 5. Create group chat function (owner can invite specific members)
CREATE OR REPLACE FUNCTION create_group_chat(
  p_member_ids UUID[],
  p_group_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_current_user_id UUID;
  v_conversation_id UUID;
  v_member_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF p_group_name IS NULL OR trim(p_group_name) = '' THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;
  
  -- Create the group conversation (private by default)
  INSERT INTO chat_conversations (type, name, is_private) 
  VALUES ('group', trim(p_group_name), true) 
  RETURNING id INTO v_conversation_id;
  
  -- Add creator as owner
  INSERT INTO chat_members (conversation_id, user_id, role)
  VALUES (v_conversation_id, v_current_user_id, 'owner');
  
  -- Add invited members
  IF p_member_ids IS NOT NULL AND array_length(p_member_ids, 1) > 0 THEN
    FOREACH v_member_id IN ARRAY p_member_ids
    LOOP
      -- Skip if it's the creator (already added as owner)
      IF v_member_id != v_current_user_id THEN
        INSERT INTO chat_members (conversation_id, user_id, role)
        VALUES (v_conversation_id, v_member_id, 'member')
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  -- Add system message
  INSERT INTO chat_messages (conversation_id, sender_id, content_encrypted, message_type) 
  VALUES (
    v_conversation_id, 
    v_current_user_id, 
    encrypt_chat_message('Gruppo "' || trim(p_group_name) || '" creato'), 
    'system'
  );
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Request to join a group (for public groups or if user knows the group)
CREATE OR REPLACE FUNCTION request_group_join(p_conversation_id UUID)
RETURNS UUID AS $$
DECLARE
  v_current_user_id UUID;
  v_request_id UUID;
  v_existing_member BOOLEAN;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if already a member
  SELECT EXISTS(
    SELECT 1 FROM chat_members 
    WHERE conversation_id = p_conversation_id AND user_id = v_current_user_id
  ) INTO v_existing_member;
  
  IF v_existing_member THEN
    RAISE EXCEPTION 'Already a member of this group';
  END IF;
  
  -- Create join request
  INSERT INTO chat_join_requests (conversation_id, user_id)
  VALUES (p_conversation_id, v_current_user_id)
  ON CONFLICT (conversation_id, user_id) 
  DO UPDATE SET status = 'pending', requested_at = NOW()
  RETURNING id INTO v_request_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Handle join request (owner/admin can approve or reject)
CREATE OR REPLACE FUNCTION handle_join_request(
  p_request_id UUID,
  p_conversation_id UUID,
  p_action TEXT -- 'approve' or 'reject'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_requester_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if current user is owner or admin of the group
  SELECT EXISTS(
    SELECT 1 FROM chat_members 
    WHERE conversation_id = p_conversation_id 
    AND user_id = v_current_user_id 
    AND role IN ('owner', 'admin')
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only owner or admin can handle join requests';
  END IF;
  
  -- Get the requester's user_id
  SELECT user_id INTO v_requester_id
  FROM chat_join_requests
  WHERE id = p_request_id AND conversation_id = p_conversation_id;
  
  IF v_requester_id IS NULL THEN
    RAISE EXCEPTION 'Join request not found';
  END IF;
  
  IF p_action = 'approve' THEN
    -- Add user as member
    INSERT INTO chat_members (conversation_id, user_id, role)
    VALUES (p_conversation_id, v_requester_id, 'member')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
    
    -- Update request status
    UPDATE chat_join_requests
    SET status = 'approved', handled_at = NOW(), handled_by = v_current_user_id
    WHERE id = p_request_id;
    
    -- Add system message
    INSERT INTO chat_messages (conversation_id, sender_id, content_encrypted, message_type)
    VALUES (
      p_conversation_id,
      v_current_user_id,
      encrypt_chat_message('Nuovo membro aggiunto al gruppo'),
      'system'
    );
    
  ELSIF p_action = 'reject' THEN
    UPDATE chat_join_requests
    SET status = 'rejected', handled_at = NOW(), handled_by = v_current_user_id
    WHERE id = p_request_id;
  ELSE
    RAISE EXCEPTION 'Invalid action. Use "approve" or "reject"';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Get pending join requests for a group (for owners/admins)
CREATE OR REPLACE FUNCTION get_pending_join_requests(p_conversation_id UUID)
RETURNS TABLE (
  request_id UUID,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  agent_code TEXT,
  requested_at TIMESTAMPTZ
) AS $$
DECLARE
  v_current_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_current_user_id := auth.uid();
  
  -- Check if current user is owner or admin
  SELECT EXISTS(
    SELECT 1 FROM chat_members 
    WHERE conversation_id = p_conversation_id 
    AND user_id = v_current_user_id 
    AND role IN ('owner', 'admin')
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    r.id as request_id,
    r.user_id,
    p.username,
    p.avatar_url,
    p.agent_code,
    r.requested_at
  FROM chat_join_requests r
  JOIN profiles p ON p.id = r.user_id
  WHERE r.conversation_id = p_conversation_id
  AND r.status = 'pending'
  ORDER BY r.requested_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Remove member from group (owner/admin can remove, or user can leave)
CREATE OR REPLACE FUNCTION remove_group_member(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_current_role TEXT;
  v_target_role TEXT;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get current user's role
  SELECT role INTO v_current_role
  FROM chat_members
  WHERE conversation_id = p_conversation_id AND user_id = v_current_user_id;
  
  -- Get target user's role
  SELECT role INTO v_target_role
  FROM chat_members
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
  
  -- Allow if: user is leaving themselves, or admin/owner is removing non-owner
  IF v_current_user_id = p_user_id THEN
    -- User is leaving
    IF v_current_role = 'owner' THEN
      RAISE EXCEPTION 'Owner cannot leave. Transfer ownership first.';
    END IF;
  ELSE
    -- Admin/owner removing someone
    IF v_current_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Only owner or admin can remove members';
    END IF;
    IF v_target_role = 'owner' THEN
      RAISE EXCEPTION 'Cannot remove the owner';
    END IF;
  END IF;
  
  DELETE FROM chat_members
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
  
  -- Add system message
  INSERT INTO chat_messages (conversation_id, sender_id, content_encrypted, message_type)
  VALUES (
    p_conversation_id,
    v_current_user_id,
    encrypt_chat_message('Un membro ha lasciato il gruppo'),
    'system'
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update member role (owner can promote to admin or demote)
CREATE OR REPLACE FUNCTION update_member_role(
  p_conversation_id UUID,
  p_user_id UUID,
  p_new_role TEXT -- 'admin' or 'member'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_id UUID;
  v_is_owner BOOLEAN;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF p_new_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'Invalid role. Use "admin" or "member"';
  END IF;
  
  -- Only owner can change roles
  SELECT EXISTS(
    SELECT 1 FROM chat_members 
    WHERE conversation_id = p_conversation_id 
    AND user_id = v_current_user_id 
    AND role = 'owner'
  ) INTO v_is_owner;
  
  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'Only owner can change member roles';
  END IF;
  
  -- Cannot change own role (owner)
  IF p_user_id = v_current_user_id THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;
  
  UPDATE chat_members
  SET role = p_new_role
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. RLS policies for join requests
ALTER TABLE chat_join_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own join requests" ON chat_join_requests;
CREATE POLICY "Users can view their own join requests" ON chat_join_requests
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view group join requests" ON chat_join_requests;
CREATE POLICY "Admins can view group join requests" ON chat_join_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.conversation_id = chat_join_requests.conversation_id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can insert join requests" ON chat_join_requests;
CREATE POLICY "Users can insert join requests" ON chat_join_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON chat_join_requests TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$ BEGIN RAISE NOTICE '✅ M1SSION Group Chat System installed successfully!'; END $$;








