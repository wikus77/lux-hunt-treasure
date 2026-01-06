-- M1SSION™ Forum Tables
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💬',
  color TEXT DEFAULT '#00D1FF',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Comments
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Votes (for posts and comments)
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 = downvote, 1 = upvote
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_user ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user ON forum_votes(user_id);

-- RLS Policies
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Categories: everyone can read
CREATE POLICY "forum_categories_read" ON forum_categories
  FOR SELECT USING (is_active = true);

-- Posts: authenticated users can create, everyone can read
CREATE POLICY "forum_posts_read" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "forum_posts_insert" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_posts_update" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "forum_posts_delete" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: authenticated users can create, everyone can read
CREATE POLICY "forum_comments_read" ON forum_comments
  FOR SELECT USING (true);

CREATE POLICY "forum_comments_insert" ON forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_comments_update" ON forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "forum_comments_delete" ON forum_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Votes: authenticated users can vote
CREATE POLICY "forum_votes_read" ON forum_votes
  FOR SELECT USING (true);

CREATE POLICY "forum_votes_insert" ON forum_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_votes_update" ON forum_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "forum_votes_delete" ON forum_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO forum_categories (name, description, icon, color, sort_order) VALUES
  ('Generale', 'Discussioni generali su M1SSION', '💬', '#00D1FF', 1),
  ('Strategie', 'Condividi le tue strategie di gioco', '🎯', '#7B5CFF', 2),
  ('Premi', 'Discussioni sui premi e vincite', '🏆', '#FFD700', 3),
  ('Supporto', 'Chiedi aiuto alla community', '🆘', '#FF6B6B', 4),
  ('Off Topic', 'Tutto il resto', '🎲', '#10B981', 5)
ON CONFLICT DO NOTHING;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE forum_posts 
  SET view_count = view_count + 1 
  WHERE id = p_post_id;
END;
$$;

-- Function to get post with author info
CREATE OR REPLACE FUNCTION get_forum_posts(
  p_category_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category_id UUID,
  category_name TEXT,
  category_icon TEXT,
  user_id UUID,
  author_name TEXT,
  author_code TEXT,
  author_avatar TEXT,
  is_pinned BOOLEAN,
  is_locked BOOLEAN,
  view_count INT,
  upvotes INT,
  downvotes INT,
  comment_count BIGINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id,
    fp.title,
    fp.content,
    fp.category_id,
    fc.name AS category_name,
    fc.icon AS category_icon,
    fp.user_id,
    p.full_name AS author_name,
    p.agent_code AS author_code,
    p.avatar_url AS author_avatar,
    fp.is_pinned,
    fp.is_locked,
    fp.view_count,
    fp.upvotes,
    fp.downvotes,
    (SELECT COUNT(*) FROM forum_comments WHERE post_id = fp.id) AS comment_count,
    fp.created_at,
    fp.updated_at
  FROM forum_posts fp
  LEFT JOIN forum_categories fc ON fp.category_id = fc.id
  LEFT JOIN profiles p ON fp.user_id = p.id
  WHERE (p_category_id IS NULL OR fp.category_id = p_category_id)
  ORDER BY fp.is_pinned DESC, fp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_post_views TO authenticated;
GRANT EXECUTE ON FUNCTION get_forum_posts TO authenticated, anon;

