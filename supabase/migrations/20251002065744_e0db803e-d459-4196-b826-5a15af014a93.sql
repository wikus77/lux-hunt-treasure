-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- PHASE 1: AI Foundation - RAG + Function Calling Infrastructure
-- NO CHANGES to existing tables, only NEW tables

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- AI Knowledge Base: documents for RAG
CREATE TABLE IF NOT EXISTS public.ai_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  locale TEXT DEFAULT 'it',
  doc_type TEXT DEFAULT 'faq', -- faq, policy, guide, changelog
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Document Embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.ai_docs_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES public.ai_docs(id) ON DELETE CASCADE,
  chunk_idx INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 or similar
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(doc_id, chunk_idx)
);

-- AI Sessions: tracks conversation sessions
CREATE TABLE IF NOT EXISTS public.ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  locale TEXT DEFAULT 'it',
  device TEXT,
  subscription_tier TEXT,
  session_data JSONB DEFAULT '{}'
);

-- AI Events: telemetry for AI actions (enhanced version)
CREATE TABLE IF NOT EXISTS public.ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- tool_call, error, feedback, click_cta, rag_query
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI User Memories: long-term preferences (with explicit consent)
CREATE TABLE IF NOT EXISTS public.ai_memories_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  consent_given BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, memory_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_docs_tags ON public.ai_docs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ai_docs_type ON public.ai_docs(doc_type);
CREATE INDEX IF NOT EXISTS idx_ai_docs_embeddings_doc ON public.ai_docs_embeddings(doc_id);
CREATE INDEX IF NOT EXISTS idx_ai_docs_embeddings_vector ON public.ai_docs_embeddings USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON public.ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_active ON public.ai_sessions(last_active_at);
CREATE INDEX IF NOT EXISTS idx_ai_events_session ON public.ai_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_type ON public.ai_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_memories_user ON public.ai_memories_user(user_id);

-- RLS Policies: secure by default
ALTER TABLE public.ai_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_docs_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memories_user ENABLE ROW LEVEL SECURITY;

-- ai_docs: public read, admin write
CREATE POLICY "ai_docs_read_all" ON public.ai_docs FOR SELECT USING (true);
CREATE POLICY "ai_docs_write_admin" ON public.ai_docs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ai_docs_embeddings: public read, admin write
CREATE POLICY "ai_docs_embeddings_read_all" ON public.ai_docs_embeddings FOR SELECT USING (true);
CREATE POLICY "ai_docs_embeddings_write_admin" ON public.ai_docs_embeddings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ai_sessions: user can read/write own sessions
CREATE POLICY "ai_sessions_self" ON public.ai_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_events: user can read/write own events
CREATE POLICY "ai_events_self" ON public.ai_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_memories_user: user can read/write own memories
CREATE POLICY "ai_memories_self" ON public.ai_memories_user FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function: RAG semantic search
CREATE OR REPLACE FUNCTION public.ai_rag_search(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 6
)
RETURNS TABLE (
  doc_id uuid,
  title text,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.doc_id,
    d.title,
    e.chunk_text,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM public.ai_docs_embeddings e
  JOIN public.ai_docs d ON d.id = e.doc_id
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Update ai_sessions last_active_at
CREATE OR REPLACE FUNCTION public.ai_touch_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_sessions 
  SET last_active_at = now() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ai_events_touch_session
AFTER INSERT ON public.ai_events
FOR EACH ROW
EXECUTE FUNCTION public.ai_touch_session();

COMMENT ON TABLE public.ai_docs IS 'Knowledge base documents for RAG (policies, FAQs, guides)';
COMMENT ON TABLE public.ai_docs_embeddings IS 'Vector embeddings for semantic search';
COMMENT ON TABLE public.ai_sessions IS 'AI conversation sessions with context';
COMMENT ON TABLE public.ai_events IS 'Telemetry events for AI interactions';
COMMENT ON TABLE public.ai_memories_user IS 'Long-term user preferences (consent-based)';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™