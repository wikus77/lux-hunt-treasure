-- Aggiungi colonna category a ai_docs per categorizzare i documenti
ALTER TABLE public.ai_docs 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Crea indice per query più veloci per categoria
CREATE INDEX IF NOT EXISTS idx_ai_docs_category 
ON public.ai_docs(category);