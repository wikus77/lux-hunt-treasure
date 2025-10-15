-- Norah AI RAG Schema Setup (Fixed)
-- Enable pgvector extension
create extension if not exists vector;

-- Drop existing policies if they exist
drop policy if exists "ai_docs_read_all" on public.ai_docs;
drop policy if exists "ai_docs_embeddings_read_all" on public.ai_docs_embeddings;
drop policy if exists "ai_docs_service_write" on public.ai_docs;
drop policy if exists "ai_docs_embeddings_service_write" on public.ai_docs_embeddings;

-- Recreate policies
create policy "ai_docs_read_all" on public.ai_docs for select using (true);
create policy "ai_docs_embeddings_read_all" on public.ai_docs_embeddings for select using (true);
create policy "ai_docs_service_write" on public.ai_docs for all using ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
create policy "ai_docs_embeddings_service_write" on public.ai_docs_embeddings for all using ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Drop and recreate upsert function
drop function if exists public.upsert_ai_doc;

create or replace function public.upsert_ai_doc(
  p_title text, 
  p_text text, 
  p_tags text[] default '{}', 
  p_source text default 'content-ai', 
  p_url text default null
) returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.ai_docs (title, text, tags, source, url)
  values (p_title, p_text, p_tags, p_source, p_url)
  returning id into v_id;
  return v_id;
end $$;

grant execute on function public.upsert_ai_doc to service_role;