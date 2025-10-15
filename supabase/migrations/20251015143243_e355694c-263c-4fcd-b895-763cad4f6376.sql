-- A) Colonne mancanti (safe/idempotente)
alter table public.ai_docs add column if not exists text text;
alter table public.ai_docs add column if not exists body text;
alter table public.ai_docs add column if not exists body_md text;

-- B) Backfill: porta body/body_md -> text dove text è NULL
update public.ai_docs
set text = coalesce(text, body, body_md)
where text is null;

-- C) Vista KPI usata da norah-kpis
create or replace view public.ai_docs_kpis as
select
  (select count(*)::int from public.ai_docs) as docs_count,
  (select count(*)::int from public.ai_docs_embeddings) as chunks_count,
  (select max(created_at) from public.ai_docs_embeddings) as last_embed_at;

-- D) RLS lettura (idempotente)
alter table public.ai_docs enable row level security;
alter table public.ai_docs_embeddings enable row level security;

drop policy if exists "ai_docs_read" on public.ai_docs;
create policy "ai_docs_read" on public.ai_docs for select using (true);

drop policy if exists "ai_docs_embeddings_read" on public.ai_docs_embeddings;
create policy "ai_docs_embeddings_read" on public.ai_docs_embeddings for select using (true);

-- E) RPC di ricerca
create or replace function public.ai_rag_search_vec_json(
  qvec vector, k int, minscore float
) returns json
language sql stable as $$
  select coalesce(json_agg(x), '[]'::json) from (
    select d.id, d.title,
           e.chunk_text as chunk,
           (1 - (e.embedding <=> qvec))::float as score
    from public.ai_docs_embeddings e
    join public.ai_docs d on d.id = e.doc_id
    where (1 - (e.embedding <=> qvec)) >= minscore
    order by e.embedding <=> qvec asc
    limit k
  ) x
$$;

grant execute on function public.ai_rag_search_vec_json(vector,int,float)
to anon, authenticated, service_role;