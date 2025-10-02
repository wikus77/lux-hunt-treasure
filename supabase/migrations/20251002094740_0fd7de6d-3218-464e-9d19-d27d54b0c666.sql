-- © 2025 Joseph MULÉ – M1SSION™ – NORAH AI DB SETUP
-- SCOPE: Solo tabelle AI/NORAH - NO side effects

-- 1. Assicurati che l'estensione vector sia attiva
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Verifica/Crea tabelle AI (idempotent)
CREATE TABLE IF NOT EXISTS public.ai_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_docs_embeddings (
  doc_id UUID REFERENCES public.ai_docs(id) ON DELETE CASCADE,
  chunk_idx INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  PRIMARY KEY (doc_id, chunk_idx)
);

-- 3. Indice vettoriale HNSW per ricerca semantica veloce
CREATE INDEX IF NOT EXISTS ai_docs_embeddings_embedding_hnsw 
ON public.ai_docs_embeddings 
USING hnsw (embedding vector_l2_ops);

-- 4. RLS per ai_docs e ai_docs_embeddings
ALTER TABLE public.ai_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_docs_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT pubblico per KB
DROP POLICY IF EXISTS "ai_docs_public_read" ON public.ai_docs;
CREATE POLICY "ai_docs_public_read" ON public.ai_docs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ai_docs_embeddings_public_read" ON public.ai_docs_embeddings;
CREATE POLICY "ai_docs_embeddings_public_read" ON public.ai_docs_embeddings
  FOR SELECT USING (true);

-- Policy: Solo service role può scrivere KB
DROP POLICY IF EXISTS "ai_docs_service_write" ON public.ai_docs;
CREATE POLICY "ai_docs_service_write" ON public.ai_docs
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "ai_docs_embeddings_service_write" ON public.ai_docs_embeddings;
CREATE POLICY "ai_docs_embeddings_service_write" ON public.ai_docs_embeddings
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 5. Funzione RPC per RAG search (già esiste, verifica signature)
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