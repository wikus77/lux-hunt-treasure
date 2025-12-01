# M1SSION™ Edge Functions API Documentation

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

Last Updated: November 2025

---

## Overview

M1SSION™ utilizes Supabase Edge Functions for server-side logic. All functions are written in TypeScript/Deno and deployed on Supabase's edge infrastructure.

### Base URL
```
https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/
```

### Authentication
All functions require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Core Functions

### 🔊 Buzz System

#### `handle-buzz-press`
Processes a BUZZ button press, generates clue, and deducts M1U.

**Method:** `POST`

**Request Body:**
```json
{
  "generateMap": false,
  "debug": false
}
```

**Response:**
```json
{
  "success": true,
  "mode": "buzz",
  "clue": {
    "id": "clue-uuid",
    "text": "Clue text in Italian...",
    "week": 1,
    "category": "location|prize",
    "is_fake": false
  }
}
```

**Error Codes:**
- `401` - Unauthorized (invalid/missing token)
- `402` - Insufficient M1U balance
- `500` - Internal server error

---

#### `buzz-map-resolve` / `buzz-map-resolve-v2`
Creates a map search area and deducts M1U.

**Method:** `POST`

**Request Body:**
```json
{
  "lat": 45.464664,
  "lng": 9.188540,
  "debug": false
}
```

**Response:**
```json
{
  "success": true,
  "area_id": "area-uuid",
  "level": 1,
  "radius_km": 50,
  "cost_m1u": 20,
  "new_balance": 980,
  "message": "Buzz Map area created successfully"
}
```

---

### 💎 M1U System

#### `create-payment-intent`
Creates a Stripe payment intent for M1U purchase.

**Method:** `POST`

**Request Body:**
```json
{
  "amount_cents": 999,
  "plan": "Gold",
  "currency": "eur"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

---

#### `handle-payment-success`
Processes successful payment and credits M1U to user.

**Method:** `POST`

**Request Body:**
```json
{
  "payment_intent_id": "pi_xxx",
  "plan": "Gold"
}
```

---

### 📍 Geofence System

#### `geofence-engine`
Processes user positions and triggers proximity notifications.

**Method:** `POST`

**Request Body:**
```json
{
  "dry": false,
  "force_user_id": null,
  "test_position": null
}
```

**Features:**
- Haversine distance calculation
- Quiet hours support
- Daily notification cap
- Real-time marker proximity alerts

---

#### `get-nearby-markers`
Returns markers within a radius of given coordinates.

**Method:** `POST`

**Request Body:**
```json
{
  "lat": 45.464664,
  "lng": 9.188540,
  "radius_km": 10
}
```

---

### ⚔️ Battle System

#### `battle-create`
Creates a new battle session.

**Method:** `POST`

**Request Body:**
```json
{
  "opponent_id": "user-uuid",
  "stake_m1u": 50
}
```

---

#### `battle-accept`
Accepts a pending battle invitation.

**Method:** `POST`

**Request Body:**
```json
{
  "battle_id": "battle-uuid"
}
```

---

#### `battle-resolve`
Resolves a completed battle and distributes rewards.

**Method:** `POST`

**Request Body:**
```json
{
  "battle_id": "battle-uuid"
}
```

---

#### `battle-cron-finalize`
**CRON JOB** - Automatically finalizes expired battles.

**Schedule:** Every 5 minutes

---

### 🔔 Push Notifications

#### `push_subscribe` / `push-subscribe`
Registers a push subscription for the user.

**Method:** `POST`

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "platform": "web"
}
```

---

#### `push_send` / `send-push`
Sends a push notification to a user.

**Method:** `POST`

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "title": "Notification Title",
  "body": "Notification body text",
  "data": {}
}
```

---

#### `fcm-send`
Sends a Firebase Cloud Messaging notification.

**Method:** `POST`

**Request Body:**
```json
{
  "token": "fcm-device-token",
  "title": "Title",
  "body": "Body",
  "data": {}
}
```

---

#### `auto-push-cron`
**CRON JOB** - Sends scheduled push notifications.

---

### 🧬 DNA System

#### `get-user-state`
Returns the complete DNA profile for a user.

**Method:** `GET`

**Response:**
```json
{
  "archetype": "EXPLORER",
  "intuito": 75,
  "audacia": 60,
  "etica": 85,
  "rischio": 45,
  "metodo": 70
}
```

---

### 🤖 AI/Norah System

#### `norah-chat`
Processes a chat message with Norah AI assistant.

**Method:** `POST`

**Request Body:**
```json
{
  "message": "User message",
  "context": {},
  "history": []
}
```

---

#### `norah-rag-search`
Performs RAG (Retrieval Augmented Generation) search.

**Method:** `POST`

**Request Body:**
```json
{
  "query": "Search query",
  "limit": 5
}
```

---

### 🎯 Mission System

#### `generate-mission-clues`
Generates clues for a mission based on prize and location data.

**Method:** `POST`

**Request Body:**
```json
{
  "prize_id": "prize-uuid",
  "city": "Milano",
  "country": "Italia",
  "prize_type": "Auto sportiva",
  "prize_color": "Rosso",
  "prize_material": "Carbonio",
  "prize_category": "Lusso",
  "lat": 45.464664,
  "lng": 9.188540
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 128 clues for mission",
  "breakdown": {
    "total": 128,
    "per_week": 32,
    "real_clues": 96,
    "fake_clues": 32,
    "location_clues": 64,
    "prize_clues": 64
  }
}
```

---

#### `update-mission`
Updates mission configuration data.

**Method:** `POST`

**Request Body:**
```json
{
  "missionData": {
    "city": "Milano",
    "country": "Italia",
    "street": "Via Roma",
    "street_number": "1",
    "prize_type": "Auto sportiva",
    "prize_color": "Rosso",
    "prize_material": "Carbonio",
    "prize_category": "Lusso",
    "lat": 45.464664,
    "lng": 9.188540
  }
}
```

---

#### `enroll-mission-of-the-month`
Enrolls a user in the current active mission.

**Method:** `POST`

**Response:**
```json
{
  "ok": true,
  "mission_id": "mission-uuid"
}
```

---

### ⏰ CRON Jobs

| Function | Schedule | Purpose |
|----------|----------|---------|
| `weekly-reset-cron` | Weekly (Sunday) | Reset weekly leaderboards, award badges |
| `battle-cron-finalize` | Every 5 min | Finalize expired battles |
| `auto-push-cron` | Configurable | Send scheduled notifications |
| `battle-analytics-refresh` | Daily | Refresh battle statistics |

---

### 📧 Email System

#### `send-registration-email`
Sends welcome email to new users.

---

#### `send-mailjet-email`
Sends transactional email via Mailjet.

**Method:** `POST`

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Subject",
  "htmlContent": "<h1>HTML Content</h1>",
  "textContent": "Text content"
}
```

---

### 🔒 Security Functions

#### `verify-turnstile`
Verifies Cloudflare Turnstile CAPTCHA token.

---

#### `secure-api-protection`
Rate limiting and API protection layer.

---

#### `panel-security-status`
Returns security status for admin panel.

---

## Error Handling

All functions return errors in this format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid JWT token |
| `INSUFFICIENT_BALANCE` | Not enough M1U |
| `RATE_LIMITED` | Too many requests |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |

---

## Rate Limiting

- Standard endpoints: 60 requests/minute
- Battle endpoints: 30 requests/minute  
- Push endpoints: 10 requests/minute
- Admin endpoints: 100 requests/minute

---

## CORS Configuration

All functions include CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: POST, OPTIONS
```

---

## Development Notes

### Testing Locally

```bash
# Start Supabase locally
supabase start

# Deploy function
supabase functions deploy function-name

# Invoke function
supabase functions invoke function-name --body '{"key": "value"}'
```

### Environment Variables

Required secrets (set in Supabase Dashboard):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `MAILJET_API_KEY`
- `MAILJET_SECRET_KEY`
- `FCM_SERVER_KEY` (deprecated, use service account)
- `FIREBASE_SERVICE_ACCOUNT` (JSON)

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**





