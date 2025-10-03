// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

# Embedding Provider Configuration

## Overview

The Knowledge Base (KB) system uses a **multi-provider abstraction layer** for generating document embeddings. Providers are auto-detected based on available environment secrets, with automatic fallback.

### Provider Priority (Auto-Fallback)

1. **Lovable AI Gateway** (primary, OpenAI-compatible)
   - Requires: `LOVABLE_API_KEY`
   - Model: `text-embedding-3-small` (default) or custom via `EMBEDDING_MODEL`
   - Dimension: 1536

2. **Cloudflare Workers AI** (fallback)
   - Requires: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
   - Model: `@cf/baai/bge-base-en-v1.5` (default) or custom via `CF_EMBEDDING_MODEL`
   - Dimension: 768 (auto-padded to 1536)

3. **Deterministic Hash** (dev-only, DO NOT USE IN PRODUCTION)
   - No API keys required
   - Generates reproducible hash-based vectors
   - For testing schema/indexes only

---

## Environment Secrets

### Required (all providers)

```bash
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>  # Required for DB writes
```

### Provider-Specific

#### Lovable AI (Primary)
```bash
LOVABLE_API_KEY=<auto_provisioned_by_lovable>      # Auto-configured
EMBEDDING_MODEL=text-embedding-3-small              # Optional, default shown
```

#### Cloudflare Workers AI (Fallback)
```bash
CLOUDFLARE_ACCOUNT_ID=<your_cf_account_id>
CLOUDFLARE_API_TOKEN=<your_cf_api_token>
CF_EMBEDDING_MODEL=@cf/baai/bge-base-en-v1.5        # Optional, default shown
```

### Supported Cloudflare Models

- `@cf/baai/bge-base-en-v1.5` (768-dim, English, recommended)
- `@cf/baai/bge-small-en-v1.5` (384-dim, faster, less accurate)
- `@cf/baai/bge-large-en-v1.5` (1024-dim, slower, more accurate)

**Note**: All models are auto-normalized to 1536 dimensions (pgvector requirement).

---

## Setting Secrets (Supabase CLI)

### Lovable AI (Default)
```bash
# LOVABLE_API_KEY is auto-configured by Lovable platform
# No manual setup needed
```

### Cloudflare Workers AI (Fallback)
```bash
supabase secrets set \
  CLOUDFLARE_ACCOUNT_ID=<your_account_id> \
  CLOUDFLARE_API_TOKEN=<your_api_token> \
  CF_EMBEDDING_MODEL='@cf/baai/bge-base-en-v1.5' \
  --project-ref vkjrqirvdvjbemsfzxof
```

### Verify Secrets
```bash
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof
```

---

## Testing Embeddings

### 1. Check Current Provider
```bash
# Call ai-kb-upsert with a test document and check response
curl -i -X POST "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/ai-kb-upsert" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TEST_PROVIDER_CHECK",
    "body_md": "Test document to verify embedding provider.",
    "tags": ["test"],
    "locale": "it"
  }'

# Response includes: {"provider": "lovable|cloudflare|none", "model": "..."}
```

### 2. Bulk Seed with Provider Logging
```bash
SEED_URL="https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/ai-kb-bulk-seed"

curl -i -X POST "$SEED_URL" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "title": "HELLO_TEST",
        "body_md": "Documento di test per verificare il seed + embeddings.",
        "tags": ["test"],
        "category": "debug",
        "locale": "it"
      }
    ]
  }'
```

### 3. Verify Embeddings
```bash
# Count documents
curl -s "https://vkjrqirvdvjbemsfzxof.supabase.co/rest/v1/ai_docs?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN"

# Count embeddings
curl -s "https://vkjrqirvdvjbemsfzxof.supabase.co/rest/v1/ai_docs_embeddings?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: embeddings count > 0
```

---

## Edge Function Architecture

### `ai-kb-upsert`
- **Input**: Single document (title, body_md, tags, category, locale)
- **Process**: 
  1. Upsert document in `ai_docs`
  2. Chunk text (~800 chars/chunk)
  3. Generate embeddings via abstraction layer
  4. Insert into `ai_docs_embeddings`
- **Auth**: Service role (bypasses RLS)
- **Output**: `{doc_id, chunks, provider, model}`

### `ai-kb-bulk-seed`
- **Input**: Array of documents
- **Process**: Calls `ai-kb-upsert` for each document
- **Auth**: Admin-only (verifies user role)
- **Output**: `{successful, failed, results[], errors[]}`

### `_shared/embedProvider.ts`
- **Functions**:
  - `getEmbeddingModel()`: Auto-detect provider
  - `embed(texts[])`: Generate embeddings with fallback
- **Normalization**: All embeddings → 1536 dimensions

---

## Troubleshooting

### Error: "LOVABLE_API_KEY not configured"
**Solution**: Use Cloudflare fallback or contact Lovable support for API key provisioning.

### Error: "Cloudflare embeddings failed: 401"
**Solution**: Verify `CLOUDFLARE_API_TOKEN` has AI permissions.

### Error: "Invalid embedding dimension: 768"
**Solution**: Auto-normalized to 1536 by `embedProvider.ts`. Check logs for warnings.

### Seed succeeds but embeddings = 0
**Solution**: 
1. Check edge function logs: `supabase functions logs ai-kb-upsert`
2. Verify embedding provider in response JSON
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

---

## Production Checklist

- [ ] `LOVABLE_API_KEY` configured (primary)
- [ ] `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` configured (fallback)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] Test seed with 1 document: provider=lovable or cloudflare
- [ ] Verify embeddings count matches chunks count
- [ ] Disable deterministic fallback (should never activate in prod)

---

## Related Files

- `supabase/functions/ai-kb-upsert/index.ts` - Single document ingestion
- `supabase/functions/ai-kb-bulk-seed/index.ts` - Bulk seeding (admin-only)
- `supabase/functions/_shared/embedProvider.ts` - Provider abstraction
- `src/intel/norah/kb/seedKB.ts` - Client-side seed helper

---

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
