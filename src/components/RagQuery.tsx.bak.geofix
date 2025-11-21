import { useState } from 'react';
import { ragSearch } from '@/api/rag';
import { supabase } from '@/integrations/supabase/client';

export default function RagQuery() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const onAsk = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await ragSearch(q, 'it', 3);
      setHits(res.hits ?? []);
      
      // Telemetry: log RAG UI query to norah_events
      try {
        await supabase.from('norah_events').insert({
          event: 'rag_ui_query',
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          payload: { q, top_k: 3, locale: 'it', hits_count: res.hits?.length ?? 0 }
        });
      } catch (telErr) {
        console.warn('Telemetry insert failed:', telErr);
      }
    } catch (e:any) {
      setErr(e?.message ?? 'Errore');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        className="border p-2 w-full mb-2"
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Fai una domanda su BUZZ…"
      />
      <button
        onClick={onAsk}
        disabled={loading || !q.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading?'…':'Chiedi'}
      </button>
      {err && <div className="text-red-500 mt-2">{err}</div>}
      <ul className="mt-4 space-y-2">
        {hits.map((h,i)=>(
          <li key={i} className="border-b pb-2">
            <strong>{h.title}</strong> · {h.category}
            <div className="text-gray-600">{h.chunk_text}</div>
            <small className="opacity-70">score: {h.distance.toFixed(3)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
