import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function ragSearch(query: string, locale = 'it', top_k = 3) {
  const { data, error } = await supabase.functions.invoke('norah-rag-search', {
    body: { query, locale, top_k },
  });
  if (error) throw error;
  return data as { rag_used: boolean; hits: Array<{
    doc_id: string; title: string; category: string; locale: string;
    chunk_idx: number; chunk_text: string; distance: number;
  }>};
}

export async function ragAnswer(query: string, locale = 'it', top_k = 3) {
  const { data, error } = await supabase.functions.invoke('norah-answer', {
    body: { query, locale, top_k },
  });
  if (error) throw error;
  return data as {
    answer: string;
    sources: Array<{
      title: string;
      doc_id: string;
      chunk_idx: number;
      snippet: string;
    }>;
    provider: string;
    rag_used: boolean;
  };
}
