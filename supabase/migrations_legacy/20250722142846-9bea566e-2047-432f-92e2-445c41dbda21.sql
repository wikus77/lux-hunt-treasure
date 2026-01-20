-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Fix security warnings: Update functions with search_path parameter

-- Fix security warnings by setting search_path for legal document related functions
-- Note: The warnings are likely from newly created functions or existing ones that need search_path

-- Update any function that might be missing search_path (if they exist)
CREATE OR REPLACE FUNCTION public.get_legal_document(document_type text)
RETURNS TABLE(id uuid, type text, title text, version text, content_md text, is_active boolean, published_at timestamp with time zone, created_at timestamp with time zone) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY 
  SELECT ld.id, ld.type, ld.title, ld.version, ld.content_md, ld.is_active, ld.published_at, ld.created_at
  FROM public.legal_documents ld
  WHERE ld.type = document_type 
    AND ld.is_active = true
  ORDER BY ld.created_at DESC
  LIMIT 1;
END;
$$;