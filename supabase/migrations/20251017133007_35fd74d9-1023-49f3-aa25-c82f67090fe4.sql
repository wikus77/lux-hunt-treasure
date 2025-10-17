-- © 2025 Joseph MULÉ – M1SSION™ – Norah AI 2.0 Baseline Restore
-- Remove ALL contextual-scenarios docs (2.1 artifacts) to restore 88dfb241 baseline

-- Delete embeddings first (FK constraint)
DELETE FROM public.ai_docs_embeddings
WHERE doc_id IN (
  SELECT id FROM public.ai_docs WHERE source = 'contextual-scenarios'
);

-- Delete contextual docs
DELETE FROM public.ai_docs
WHERE source = 'contextual-scenarios';

-- Verify baseline state (should be 58 docs remaining)
COMMENT ON TABLE public.ai_docs IS 'Norah AI 2.0 Baseline (commit 88dfb241) - 58 docs only, no contextual-scenarios';