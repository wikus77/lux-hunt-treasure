# M1SSION Intelligence — Norah RAG Integration

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## Overview

Intelligence RAG panel integrato con Supabase Edge Function `norah-rag-search` per ricerca semantica su Knowledge Base interna.

## Setup

### Variabili Ambiente (Client-Safe)

```bash
# .env o .env.local
VITE_SUPABASE_URL=https://vkjrqirvdvjbemsfzxof.supabase.co
VITE_SUPABASE_ANON_KEY=<your_anon_key>

# Feature flag (opzionale)
VITE_INTEL_ENABLED=true
```

⚠️ **SICUREZZA**: Mai usare `SUPABASE_SERVICE_ROLE_KEY` nel client. Solo `ANON_KEY` è safe per il browser.

### Avvio Dev

```bash
npm install
npm run dev
```

Vai su: `http://localhost:5173/intelligence/rag`

## API Endpoint

### POST /functions/v1/norah-rag-search

**Headers:**
```
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "query": "Spiegami BUZZ e quando conviene usarlo",
  "locale": "it",
  "top_k": 3
}
```

**Response:**
```json
{
  "rag_used": true,
  "hits": [
    {
      "doc_id": "uuid",
      "title": "REGOLE_BUZZ_v1",
      "category": "game-mechanics",
      "locale": "it",
      "chunk_idx": 2,
      "chunk_text": "BUZZ consente di...",
      "distance": 0.234
    }
  ]
}
```

## Test manuale (curl)

```bash
# Variabili
export SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
export SUPABASE_ANON_KEY="<your_anon_key>"

# Test query
curl -i -X POST "$SUPABASE_URL/functions/v1/norah-rag-search" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Differenze tra piani Free e Titanium su BUZZ",
    "locale": "it",
    "top_k": 3
  }'
```

## Struttura File

```
src/
├── api/
│   └── rag.ts                      # Client wrapper per norah-rag-search
├── components/
│   └── RagQuery.tsx                # UI component (query box + results)
├── pages/
│   ├── IntelligenceRAG.tsx         # Pagina principale Intelligence RAG
│   └── RagTest.tsx                 # Test page (legacy)
└── routes/
    └── WouterRoutes.tsx            # Route /intelligence/rag

supabase/functions/
├── _shared/
│   └── embedProvider.ts            # Multi-provider embedding abstraction
├── norah-rag-search/
│   └── index.ts                    # Vector search edge function
└── ai-kb-upsert/
    └── index.ts                    # Knowledge base upsert
```

## Feature Flag

Per nascondere la sezione Intelligence RAG quando non necessaria:

```typescript
// In WouterRoutes.tsx o nel menu
const INTEL_RAG_ENABLED = import.meta.env.VITE_INTEL_ENABLED === 'true';

{INTEL_RAG_ENABLED && (
  <Route path="/intelligence/rag">
    <IntelligenceRAG />
  </Route>
)}
```

## Testing

### Unit Tests (esempio)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import RagQuery from '@/components/RagQuery';

test('renders query input', () => {
  render(<RagQuery />);
  expect(screen.getByPlaceholderText(/fai una domanda/i)).toBeInTheDocument();
});

test('handles successful response', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        rag_used: true,
        hits: [{ title: 'Test', chunk_text: 'Content', distance: 0.1 }]
      })
    })
  );
  
  render(<RagQuery />);
  // ... trigger query and assert results
});
```

### Smoke Test

```bash
# Start app
npm run dev

# Navigate to /intelligence/rag
# Try queries:
# 1. "Spiegami BUZZ e quando conviene usare BUZZ Map"
# 2. "Differenze tra piani Free e Titanium su BUZZ e BUZZ Map"
# 3. "Come funziona il sistema di rewards?"
```

### Verify telemetry events

```bash
curl -s "$SUPABASE_URL/rest/v1/norah_events?event_type=eq.rag_query&select=created_at,payload&order=created_at.desc&limit=3" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" | jq .
```

## Troubleshooting

### 401 Unauthorized
- Verifica `VITE_SUPABASE_ANON_KEY` in `.env`
- Controlla RLS policies su `ai_docs` e `ai_docs_embeddings`

### 0 risultati
- Verifica che la KB sia popolata: `SELECT COUNT(*) FROM ai_docs;`
- Seed KB: vedi `REPORT_VERIFICA_FINALE_POST_SEED.md`

### Performance
- Latency attesa: ~150-500ms per query
- Se > 1s, verifica indici HNSW/IVFFlat su `ai_docs_embeddings.embedding`

## Links Utili

- **Edge Functions Logs**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/functions/norah-rag-search/logs
- **Edge Functions Secrets**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/settings/functions
- **DB Tables**: https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/editor

## License

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
