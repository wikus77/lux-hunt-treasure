-- Drop existing function with defaults
DROP FUNCTION IF EXISTS public.upsert_ai_doc(text, text, text[], text, text);

-- Add text column to ai_docs if missing
ALTER TABLE public.ai_docs ADD COLUMN IF NOT EXISTS text TEXT;

-- Populate text column from existing body/body_md
UPDATE public.ai_docs 
SET text = COALESCE(text, body, body_md) 
WHERE text IS NULL;

-- Create KPIs view
CREATE OR REPLACE VIEW public.ai_docs_kpis AS
SELECT
  (SELECT COUNT(*)::INT FROM public.ai_docs) AS docs_count,
  (SELECT COUNT(*)::INT FROM public.ai_docs_embeddings) AS chunks_count,
  (SELECT MAX(created_at) FROM public.ai_docs_embeddings) AS last_embed_at;

-- Create RAG search function
CREATE OR REPLACE FUNCTION public.ai_rag_search_vec_json(qvec VECTOR, k INT, minscore FLOAT)
RETURNS JSON 
LANGUAGE SQL 
STABLE AS $$
  SELECT COALESCE(JSON_AGG(x), '[]'::JSON) FROM (
    SELECT 
      d.id,
      d.title,
      e.chunk_text AS chunk,
      (1 - (e.embedding <=> qvec))::FLOAT AS score
    FROM public.ai_docs_embeddings e
    JOIN public.ai_docs d ON d.id = e.doc_id
    WHERE (1 - (e.embedding <=> qvec)) >= minscore
    ORDER BY e.embedding <=> qvec ASC 
    LIMIT k
  ) x
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.ai_rag_search_vec_json(VECTOR, INT, FLOAT) TO anon, authenticated, service_role;

-- Create upsert function WITHOUT defaults to avoid conflict
CREATE OR REPLACE FUNCTION public.upsert_ai_doc(
  p_title TEXT, 
  p_text TEXT, 
  p_tags TEXT[], 
  p_source TEXT, 
  p_url TEXT
) 
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE 
  v_id UUID;
BEGIN
  INSERT INTO public.ai_docs(title, text, tags, source, url)
  VALUES(p_title, p_text, p_tags, p_source, p_url)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.upsert_ai_doc(TEXT, TEXT, TEXT[], TEXT, TEXT) TO service_role;