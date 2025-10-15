# M1SSION API Reference

Internal API documentation for developers and advanced users.

## Authentication

All API endpoints require authentication via Supabase JWT token:

```
Authorization: Bearer <JWT_TOKEN>
```

Get token from Supabase auth session:
```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## Edge Functions

### Base URL
```
https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1
```

**IMPORTANT**: Always use `functionsBaseUrl` from `@/lib/supabase/functionsBase` instead of hardcoding.

### Common Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

## Push Notification APIs

### Subscribe to Push
**Endpoint**: `POST /webpush-upsert`

**Body**:
```json
{
  "subscription": {
    "endpoint": "string",
    "keys": {
      "p256dh": "string",
      "auth": "string"
    }
  },
  "provider": "fcm" | "apns"
}
```

**Response**:
```json
{
  "ok": true,
  "subscription_id": "uuid"
}
```

### Send Notification (Admin)
**Endpoint**: `POST /webpush-send`

**Body**:
```json
{
  "userId": "uuid",
  "title": "string",
  "body": "string",
  "url": "string (optional)",
  "icon": "string (optional)"
}
```

## Norah AI APIs

### RAG Search
**Endpoint**: `POST /norah-rag-search`

**Body**:
```json
{
  "query": "string",
  "top_k": 3,
  "locale": "it"
}
```

**Response**:
```json
{
  "rag_used": true,
  "hits": [
    {
      "title": "string",
      "chunk_text": "string",
      "similarity": 0.85
    }
  ]
}
```

### Chat with Norah
**Endpoint**: `POST /norah-chat`

**Body**:
```json
{
  "message": "string",
  "sessionId": "uuid (optional)"
}
```

**Response**: Stream of SSE events

### Ingest Content (Admin)
**Endpoint**: `POST /norah-ingest`

**Body**:
```json
{
  "sources": "content-ai" | "remote",
  "docs": [
    {
      "title": "string",
      "text": "string",
      "tags": ["array"],
      "url": "string (optional)"
    }
  ]
}
```

### Generate Embeddings (Admin)
**Endpoint**: `POST /norah-embed`

**Body**:
```json
{
  "reembed": false,
  "batch": 100
}
```

### Get KPIs
**Endpoint**: `GET /norah-kpis`

**Response**:
```json
{
  "docs_count": 42,
  "chunks_count": 127,
  "last_embed_at": "2025-10-15T10:30:00Z",
  "avgScore": 0.72
}
```

## Game APIs

### Get User State
**Endpoint**: `GET /get-user-state`

**Response**:
```json
{
  "profile": { ...profile_data },
  "xp": { ...xp_data },
  "subscription": { ...subscription_data },
  "missions": { ...mission_progress }
}
```

### Use BUZZ
**Endpoint**: `POST /handle-buzz-press`

**Body**:
```json
{
  "location": {
    "lat": 45.4642,
    "lng": 9.1900
  }
}
```

**Response**:
```json
{
  "result": "hot" | "warm" | "cold",
  "distance": 123.45,
  "remaining": 5
}
```

### Use BUZZ Map
**Endpoint**: `POST /handle-buzz-map`

**Body**:
```json
{
  "location": {
    "lat": 45.4642,
    "lng": 9.1900
  }
}
```

**Response**:
```json
{
  "radius": 500,
  "center": {
    "lat": 45.4650,
    "lng": 9.1910
  },
  "clues_revealed": 3
}
```

### Submit Final Shot
**Endpoint**: `POST /submit-final-shot`

**Body**:
```json
{
  "missionId": "uuid",
  "location": {
    "lat": 45.4642,
    "lng": 9.1900
  }
}
```

**Response**:
```json
{
  "success": true | false,
  "distance": 12.34,
  "message": "string",
  "prize": { ...prize_data } // if won
}
```

## Subscription APIs

### Create Checkout Session
**Endpoint**: `POST /create-payment-intent`

**Body**:
```json
{
  "tier": "silver" | "gold" | "black" | "titanium",
  "interval": "month" | "year"
}
```

**Response**:
```json
{
  "sessionId": "string",
  "url": "string (Stripe checkout URL)"
}
```

### Verify Subscription
**Endpoint**: `GET /verify-subscription?session_id=<session_id>`

**Response**:
```json
{
  "verified": true,
  "subscription": {
    "tier": "string",
    "status": "active",
    "current_period_end": "ISO_DATE"
  }
}
```

## Database Direct Access

### Tables (via Supabase client)

**Profiles**:
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

**Missions**:
```typescript
const { data } = await supabase
  .from('missions')
  .select('*, clues(*)')
  .eq('is_active', true);
```

**XP Transactions**:
```typescript
const { data } = await supabase
  .from('xp_transactions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth | 5 req | 15 min |
| BUZZ | 10 req | 1 min |
| Norah Chat | 20 req | 1 min |
| General | 100 req | 1 min |

Exceeded limits return 429 status with:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal issue |
| 503 | Service Unavailable - Maintenance |

## Webhooks (Coming Soon)

Subscribe to events:
- New mission available
- Clue unlocked
- Final shot result
- Prize won
- Level up

## SDK & Libraries

Official clients:
- TypeScript/JavaScript (included in app)
- Python (coming soon)
- Swift iOS (coming soon)

Community libraries welcome - see GitHub for guidelines.
