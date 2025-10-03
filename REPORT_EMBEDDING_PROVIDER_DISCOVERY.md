// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

# EMBEDDING PROVIDER DISCOVERY + FALLBACK IMPLEMENTATION

**Data report:** 2025-10-03  
**Scope:** Edge Functions `ai-kb-upsert`, `ai-kb-bulk-seed`, embedding abstraction layer

---

## TASK 1 — DISCOVERY (Read-Only Analysis)

### Current Provider Found: ✅ Lovable AI Gateway

**Location**: `supabase/functions/ai-kb-upsert/index.ts` (lines 114-124, original)

**Implementation Details**:
- **Endpoint**: `https://ai.gateway.lovable.dev/v1/embeddings`
- **Method**: POST with `Authorization: Bearer ${LOVABLE_API_KEY}`
- **Model**: `text-embedding-3-small` (hardcoded)
- **Output**: 1536-dimension vectors (OpenAI-compatible)

**HTTP Library**: Native `fetch()` (Deno std)

### Secrets Required (Original)

| Secret Name | Where Read | Required | Status |
|-------------|-----------|----------|--------|
| `LOVABLE_API_KEY` | Line 44 | ✅ Mandatory | Auto-provisioned by Lovable |
| `SUPABASE_SERVICE_ROLE_KEY` | Line 41 | ✅ Mandatory | Set by user |
| `SUPABASE_URL` | Line 40 | ✅ Mandatory | Auto-configured |

### Supabase Client Mode

✅ **Service Role**: Both functions use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- `ai-kb-upsert`: Lines 39-42
- `ai-kb-bulk-seed`: Lines 39-42

### Conclusion (Original)

**Seed would fail if**:
1. ❌ `LOVABLE_API_KEY` missing or invalid → 401 from gateway
2. ❌ `SUPABASE_SERVICE_ROLE_KEY` missing → DB write fails
3. ⚠️ No fallback provider (single point of failure)

---

## TASK 2 — ABSTRACTION + FALLBACK (Implemented)

### New Architecture

Created `supabase/functions/_shared/embedProvider.ts` with:

```typescript
export type EmbeddingProvider = 'lovable' | 'cloudflare' | 'none';

export async function getEmbeddingModel(): Promise<{provider, model}>;
export async function embed(texts: string[]): Promise<number[][]>;
```

### Provider Selection Logic (Auto-Fallback)

1. **Primary: Lovable AI** (`LOVABLE_API_KEY` present)
   - Model: `text-embedding-3-small` (default) or `$EMBEDDING_MODEL`
   - Endpoint: Lovable AI Gateway
   - Dimension: 1536 (native)

2. **Fallback: Cloudflare Workers AI** (`CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` present)
   - Model: `@cf/baai/bge-base-en-v1.5` (default) or `$CF_EMBEDDING_MODEL`
   - Endpoint: `https://api.cloudflare.com/client/v4/accounts/{id}/ai/run/{model}`
   - Dimension: 768 (auto-padded to 1536)

3. **Dev Fallback: Deterministic Hash** (no keys)
   - Model: `deterministic-hash`
   - Method: SHA-256 hash → reproducible vectors
   - **⚠️ TESTING ONLY, NOT FOR PRODUCTION**

### Cloudflare Workers AI Implementation

**Endpoint**:
```
POST https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${CF_EMBEDDING_MODEL}
```

**Headers**:
```json
{
  "Authorization": "Bearer ${CLOUDFLARE_API_TOKEN}",
  "Content-Type": "application/json"
}
```

**Request Body** (per text):
```json
{"text": "<input_string>"}
```

**Response**:
```json
{
  "result": {
    "data": [0.123, 0.456, ...]  // 768-dim for bge-base-en-v1.5
  }
}
```

**Normalization**: All embeddings auto-padded/truncated to 1536 dimensions (pgvector requirement)

### Integration Changes

**`ai-kb-upsert/index.ts`** (modified lines 5-7, 39-47, 107-121, 137-147):
- Imported `embed()` and `getEmbeddingModel()` from `_shared/embedProvider.ts`
- Removed hardcoded `LOVABLE_API_KEY` check
- Replaced manual fetch loop with batched `embed(chunks)` call
- Added `provider` and `model` to response JSON

**`ai-kb-bulk-seed/index.ts`**: No changes (delegates to `ai-kb-upsert`)

### Response JSON (Enhanced)

```json
{
  "success": true,
  "doc_id": "uuid",
  "chunks": 5,
  "title": "...",
  "provider": "lovable|cloudflare|none",
  "model": "text-embedding-3-small|@cf/baai/bge-base-en-v1.5|..."
}
```

---

## TASK 3 — DX & README

Created `supabase/functions/README_EMBEDDINGS.md` with:

### Secrets Documentation

**Required (All Providers)**:
- `SUPABASE_SERVICE_ROLE_KEY` (mandatory)

**Optional (Provider-Specific)**:
- `LOVABLE_API_KEY` (primary, auto-configured)
- `EMBEDDING_MODEL` (default: `text-embedding-3-small`)
- `CLOUDFLARE_ACCOUNT_ID` (fallback)
- `CLOUDFLARE_API_TOKEN` (fallback)
- `CF_EMBEDDING_MODEL` (default: `@cf/baai/bge-base-en-v1.5`)

### Supabase CLI Examples

**Set Cloudflare Secrets**:
```bash
supabase secrets set \
  CLOUDFLARE_ACCOUNT_ID=<your_account_id> \
  CLOUDFLARE_API_TOKEN=<your_api_token> \
  CF_EMBEDDING_MODEL='@cf/baai/bge-base-en-v1.5' \
  --project-ref vkjrqirvdvjbemsfzxof
```

**Verify**:
```bash
supabase secrets list --project-ref vkjrqirvdvjbemsfzxof
```

---

## TASK 4 — VERIFICATION REPORT

### Current Environment Analysis

**Active Provider** (given current env):
- ✅ **Lovable AI** (`LOVABLE_API_KEY` is configured)
- Model: `text-embedding-3-small`
- No fallback needed

**Missing Secrets** (for fallback):
- ⚠️ `CLOUDFLARE_ACCOUNT_ID` (optional, for fallback)
- ⚠️ `CLOUDFLARE_API_TOKEN` (optional, for fallback)

### Test Snippets (Ready for Execution)

#### A) Set Cloudflare Secrets (Fallback Provider)

```bash
# Replace <CF_ACCOUNT_ID> and <CF_API_TOKEN> with actual values
supabase secrets set \
  CLOUDFLARE_ACCOUNT_ID=<CF_ACCOUNT_ID> \
  CLOUDFLARE_API_TOKEN=<CF_API_TOKEN> \
  CF_EMBEDDING_MODEL='@cf/baai/bge-base-en-v1.5' \
  --project-ref vkjrqirvdvjbemsfzxof
```

#### B) Test Single Document Seed (Provider Check)

```bash
SEED_URL="https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/ai-kb-upsert"
SERVICE_KEY="<your_service_role_key>"

curl -i -X POST "$SEED_URL" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "PROVIDER_TEST",
    "body_md": "Test document to verify embedding provider fallback.",
    "tags": ["test"],
    "category": "debug",
    "locale": "it"
  }'

# Expected Response:
# {
#   "success": true,
#   "doc_id": "...",
#   "chunks": 1,
#   "title": "PROVIDER_TEST",
#   "provider": "lovable",  <-- Check this field
#   "model": "text-embedding-3-small"
# }
```

#### C) Verify Embeddings in Database

```bash
SUPABASE_URL="https://vkjrqirvdvjbemsfzxof.supabase.co"
ANON_KEY="<your_anon_key>"
USER_TOKEN="<your_user_jwt>"

# Count documents
curl -s "$SUPABASE_URL/rest/v1/ai_docs?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN"

# Count embeddings
curl -s "$SUPABASE_URL/rest/v1/ai_docs_embeddings?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: embeddings count > 0
```

#### D) Bulk Seed with Provider Logging

```bash
BULK_URL="https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/ai-kb-bulk-seed"

curl -i -X POST "$BULK_URL" \
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

---

## Summary of Changes

### Files Modified ✅

1. **Created**: `supabase/functions/_shared/embedProvider.ts` (203 lines)
   - Auto-detection logic
   - Lovable AI implementation
   - Cloudflare Workers AI implementation
   - Deterministic fallback (dev-only)
   - Dimension normalization (768/1024/1536)

2. **Updated**: `supabase/functions/ai-kb-upsert/index.ts`
   - Lines 5-7: Import abstraction layer
   - Lines 39-47: Replace hardcoded key check with auto-detection
   - Lines 107-121: Replace manual fetch loop with `embed(chunks)`
   - Lines 137-147: Add `provider` and `model` to response

3. **Created**: `supabase/functions/README_EMBEDDINGS.md` (250+ lines)
   - Secrets documentation
   - Provider priority
   - CLI commands
   - Troubleshooting guide

### Files NOT Modified ✅ (As Required)

- ❌ No changes to UI/React components
- ❌ No changes to routing
- ❌ No changes to DB schema/RLS
- ❌ No changes to `ai-kb-bulk-seed` (delegates to upsert)
- ✅ Legal signatures preserved in all files

---

## Next Steps (For User)

### Immediate (Keep Lovable AI as Primary)
1. ✅ Deploy edge functions (auto-deployed by Lovable)
2. ✅ Test seed with existing `LOVABLE_API_KEY`
3. ✅ Verify response includes `"provider": "lovable"`

### Optional (Enable Cloudflare Fallback)
1. Obtain Cloudflare account ID and API token with AI permissions
2. Set secrets via Supabase CLI (see snippet A above)
3. Test fallback by temporarily removing `LOVABLE_API_KEY`:
   ```bash
   supabase secrets unset LOVABLE_API_KEY --project-ref vkjrqirvdvjbemsfzxof
   ```
4. Run test seed (snippet B) → expect `"provider": "cloudflare"`
5. Restore `LOVABLE_API_KEY`:
   ```bash
   supabase secrets set LOVABLE_API_KEY=<original_key> --project-ref vkjrqirvdvjbemsfzxof
   ```

### Production Checklist
- [ ] `LOVABLE_API_KEY` confirmed active (primary)
- [ ] `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` set (fallback)
- [ ] Test seed returns `provider: "lovable"` or `"cloudflare"`
- [ ] Verify embeddings count matches chunks count in DB
- [ ] Edge function logs show no errors
- [ ] Deterministic fallback never activates in production

---

## Troubleshooting

### Seed fails with "LOVABLE_API_KEY not configured"
**Solution**: Abstraction layer will auto-fallback to Cloudflare if configured. If not, contact Lovable support.

### Response shows `"provider": "none"`
**Cause**: No API keys configured (dev fallback active)  
**Solution**: Set either `LOVABLE_API_KEY` or Cloudflare credentials.

### Embeddings count = 0 after successful seed
**Cause**: Embedding generation failed silently  
**Solution**: Check edge function logs:
```bash
supabase functions logs ai-kb-upsert --project-ref vkjrqirvdvjbemsfzxof
```

### Cloudflare returns 401
**Cause**: Invalid `CLOUDFLARE_API_TOKEN` or missing AI permissions  
**Solution**: Verify token has `Workers AI` scope in Cloudflare dashboard.

---

## Files Reference

- `supabase/functions/ai-kb-upsert/index.ts` - Single document ingestion (updated)
- `supabase/functions/ai-kb-bulk-seed/index.ts` - Bulk seeding (unchanged)
- `supabase/functions/_shared/embedProvider.ts` - Provider abstraction (new)
- `supabase/functions/README_EMBEDDINGS.md` - Documentation (new)
- `src/intel/norah/kb/seedKB.ts` - Client-side helper (unchanged)

---

**Implementation Status**: ✅ **COMPLETE**  
**Breaking Changes**: ❌ **NONE** (backward-compatible with existing `LOVABLE_API_KEY`)  
**Deployment**: 🚀 **AUTO** (edge functions redeploy on next build)

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
