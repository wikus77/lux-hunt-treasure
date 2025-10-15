-- 1) Allinea schema ai_docs (fix per "ai_docs.text does not exist")
ALTER TABLE public.ai_docs ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.ai_docs ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.ai_docs ADD COLUMN IF NOT EXISTS body_md TEXT;

-- 2) Backfill: porta body/body_md -> text dove text è NULL
UPDATE public.ai_docs
SET text = COALESCE(text, body, body_md)
WHERE text IS NULL;

-- 3) Vista KPI per norah-kpis
CREATE OR REPLACE VIEW public.ai_docs_kpis AS
SELECT
  (SELECT COUNT(*)::INT FROM public.ai_docs) AS docs_count,
  (SELECT COUNT(*)::INT FROM public.ai_docs_embeddings) AS chunks_count,
  (SELECT MAX(created_at) FROM public.ai_docs_embeddings) AS last_embed_at;

-- 4) RLS di sola lettura (sicuro)
ALTER TABLE public.ai_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_docs_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_docs_read" ON public.ai_docs;
CREATE POLICY "ai_docs_read" ON public.ai_docs FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "ai_docs_embeddings_read" ON public.ai_docs_embeddings;
CREATE POLICY "ai_docs_embeddings_read" ON public.ai_docs_embeddings FOR SELECT USING (TRUE);

-- 5) RPC di ricerca (se manca)
CREATE OR REPLACE FUNCTION public.ai_rag_search_vec_json(
  qvec VECTOR, k INT, minscore FLOAT
) RETURNS JSON
LANGUAGE SQL STABLE AS $$
  SELECT COALESCE(JSON_AGG(x), '[]'::JSON) FROM (
    SELECT d.id, d.title,
           e.chunk_text AS chunk,
           (1 - (e.embedding <=> qvec))::FLOAT AS score
    FROM public.ai_docs_embeddings e
    JOIN public.ai_docs d ON d.id = e.doc_id
    WHERE (1 - (e.embedding <=> qvec)) >= minscore
    ORDER BY e.embedding <=> qvec ASC
    LIMIT k
  ) x
$$;

GRANT EXECUTE ON FUNCTION public.ai_rag_search_vec_json(VECTOR, INT, FLOAT)
TO anon, authenticated, service_role;