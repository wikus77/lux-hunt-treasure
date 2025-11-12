# M1SSION™ Battle System - Phase 4: Analytics & Leaderboard (Supabase)

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## Overview

Phase 4 Supabase adds analytics, reputation tracking, and leaderboard functionality to the Battle System without compromising security or touching protected pipelines.

## Architecture

```
Database Layer:
├── user_reputation (main reputation table)
├── battle_stats_daily (materialized view - daily aggregates)
├── leaderboard_battle_mv (materialized view - ranked scores)
├── Triggers (auto-update reputation on battle resolve)
└── RPC Functions (apply_battle_outcome, refresh_battle_stats, etc.)

Edge Functions:
└── battle-analytics-refresh (scheduled refresh every 5-10 min)
```

## Schema Changes

### 1. User Reputation Table

```sql
CREATE TABLE public.user_reputation (
  user_id UUID PRIMARY KEY,
  rep_score NUMERIC DEFAULT 0,
  rank_level INT DEFAULT 1,
  total_battles INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  win_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**RLS:** Users can only read their own reputation.

**Indexes:**
- `idx_user_reputation_score` (rep_score DESC, rank_level DESC)

### 2. Battle Stats Daily (Materialized View)

Aggregates daily battle statistics per user:
- Attacks, defenses
- Wins, losses
- Attack/defense win ratios

**Refresh:** Automatic via scheduled edge function.

### 3. Leaderboard (Materialized View)

Ranked leaderboard with composite scoring:
```
score = rep_score + (wins * W) - (losses * L) + (streak * S)
```

**Parameters (from `pricing_rules`):**
- `W` (win_weight): Default 10
- `L` (loss_weight): Default 5
- `S` (streak_weight): Default 3

**Min qualification:** 3 battles

**Top 1000 users tracked**

## RPC Functions

### 1. `apply_battle_outcome(session_id UUID)`

**Purpose:** Post-battle reputation and PE updates.

**Security:** `SECURITY DEFINER` with RLS enforcement.

**Process:**
1. Fetch resolved battle session
2. Determine winner/loser
3. Apply reputation deltas:
   - Winner: +50 rep
   - Loser: -20 rep
4. Apply PE deltas:
   - Winner: +100 PE
   - Loser: -30 PE
5. Check rank up (every 500 rep → +1 rank)
6. Write to ledgers

**Usage:**
```sql
SELECT public.apply_battle_outcome('<session-id>');
```

**Response:**
```json
{
  "success": true,
  "winner_id": "uuid",
  "loser_id": "uuid",
  "rep_delta_winner": 50,
  "rep_delta_loser": -20
}
```

### 2. `refresh_battle_stats()`

**Purpose:** Refresh materialized views (daily stats + leaderboard).

**Security:** `SECURITY DEFINER`, granted to `authenticated` and `service_role`.

**Usage:**
```sql
SELECT public.refresh_battle_stats();
```

**Response:**
```
2  -- Number of views refreshed
```

**Scheduled:** Edge function calls this every 5-10 minutes.

### 3. `get_my_reputation()`

**Purpose:** Get current user's reputation stats.

**Security:** Returns only caller's data (RLS enforced).

**Usage:**
```sql
SELECT public.get_my_reputation();
```

**Response:**
```json
{
  "user_id": "uuid",
  "rep_score": 150,
  "rank_level": 1,
  "total_battles": 5,
  "total_wins": 3,
  "total_losses": 2,
  "win_streak": 2,
  "best_streak": 3
}
```

### 4. `get_leaderboard(limit INT)`

**Purpose:** Get top N users and caller's rank.

**Security:** Public leaderboard data (no sensitive info).

**Usage:**
```sql
SELECT public.get_leaderboard(20);
```

**Response:**
```json
{
  "leaderboard": [
    {
      "user_id": "uuid",
      "rank": 1,
      "score": 1250,
      "rep_score": 500,
      "rank_level": 2,
      "total_wins": 50,
      "total_losses": 10,
      "win_streak": 5
    },
    ...
  ],
  "user_rank": 42
}
```

## Edge Function: battle-analytics-refresh

**Path:** `supabase/functions/battle-analytics-refresh/index.ts`

**Purpose:** Scheduled refresh of materialized views.

**Schedule:** Every 5-10 minutes (configure in `supabase/config.toml`).

**Auth:** Service role (internal only, no public access).

**Process:**
1. Create service role client
2. Call `refresh_battle_stats()` RPC
3. Log result
4. Return status

**Configuration (supabase/config.toml):**
```toml
[functions.battle-analytics-refresh]
verify_jwt = false  # Internal scheduled function

[functions.battle-analytics-refresh.schedule]
cron = "*/10 * * * *"  # Every 10 minutes
```

**Logs:**
```
[Battle Analytics Refresh] Starting scheduled refresh
[Battle Analytics Refresh] Successfully refreshed 2 views
```

## Installation

### 1. Run Migrations

```bash
# Terminal 1: Phase 4 Analytics Schema
supabase db push --file supabase/migrations/20250112000006_battle_phase4_analytics.sql

# Terminal 2: Phase 4 Analytics RPC
supabase db push --file supabase/migrations/20250112000007_battle_phase4_rpc.sql
```

### 2. Deploy Edge Function

The edge function will deploy automatically with your project.

Verify deployment:
```bash
supabase functions list
```

Expected:
```
battle-cron-finalize (Phase 3)
battle-analytics-refresh (Phase 4) ✅
```

### 3. Verify Installation

```sql
-- Check user_reputation table
SELECT * FROM public.user_reputation LIMIT 10;

-- Check materialized views exist
\d public.battle_stats_daily
\d public.leaderboard_battle_mv

-- Test RPC functions
SELECT public.get_my_reputation();
SELECT public.get_leaderboard(10);
```

## Testing Guide

### 1. Simulate Battle Outcome

```sql
-- Update a test battle to resolved
UPDATE public.battle_sessions
SET status = 'resolved', winner_id = '<attacker-id>', ended_at = now()
WHERE id = '<test-session-id>';

-- Apply outcome
SELECT public.apply_battle_outcome('<test-session-id>');

-- Check reputation updated
SELECT * FROM public.user_reputation WHERE user_id IN ('<attacker-id>', '<defender-id>');
```

### 2. Test Leaderboard

```sql
-- Manually refresh views
SELECT public.refresh_battle_stats();

-- Get leaderboard
SELECT public.get_leaderboard(20);

-- Check your rank
SELECT * FROM public.leaderboard_battle_mv WHERE user_id = auth.uid();
```

### 3. Test Daily Stats

```sql
-- Check daily aggregates
SELECT * FROM public.battle_stats_daily 
WHERE user_id = auth.uid() 
ORDER BY d DESC 
LIMIT 7;
```

### 4. Test Auto-Refresh

Wait 10 minutes and check logs:
```bash
supabase functions logs battle-analytics-refresh
```

Expected:
```
[Battle Analytics Refresh] Successfully refreshed 2 views
```

## Security Notes

### RLS Enforcement

✅ **user_reputation:** Users can only read own data.
✅ **battle_stats_daily:** Read-only materialized view (no RLS needed).
✅ **leaderboard_battle_mv:** Public read (no sensitive data exposed).

### SECURITY DEFINER Functions

All RPC functions use `SECURITY DEFINER` with explicit RLS checks:
- `apply_battle_outcome`: Validates session ownership
- `refresh_battle_stats`: Service role only
- `get_my_reputation`: Returns only caller's data
- `get_leaderboard`: Public data only

### No Push Pipeline Changes

✅ Phase 4 does **NOT** modify push notifications.
✅ Uses existing `battle_notifications` table (Phase 2).
✅ No new HTTP endpoints or external dependencies.

## Performance Optimization

### Materialized Views

**Refresh strategy:**
- **Manual:** `SELECT public.refresh_battle_stats()`
- **Scheduled:** Every 10 minutes via edge function
- **On-demand:** Triggered by high-volume events

**Indexes:**
- `battle_stats_daily`: (user_id, d)
- `leaderboard_battle_mv`: (rank), (score DESC)
- `user_reputation`: (rep_score DESC, rank_level DESC)

### Query Performance

```sql
-- Fast: Get top 20 (indexed)
SELECT * FROM public.leaderboard_battle_mv ORDER BY rank LIMIT 20;

-- Fast: Get user rank (indexed)
SELECT * FROM public.leaderboard_battle_mv WHERE user_id = '<uuid>';

-- Fast: Get user stats (indexed)
SELECT * FROM public.battle_stats_daily WHERE user_id = '<uuid>' ORDER BY d DESC LIMIT 7;
```

## Troubleshooting

### Issue: Materialized view not refreshing

**Solution:**
```sql
-- Manual refresh
SELECT public.refresh_battle_stats();

-- Check edge function logs
supabase functions logs battle-analytics-refresh
```

### Issue: Reputation not updating

**Check trigger:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trg_update_reputation_on_battle';
```

**Manual trigger:**
```sql
SELECT public.update_user_reputation_on_battle();
```

### Issue: Leaderboard shows wrong ranks

**Rebuild materialized view:**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_battle_mv;
```

## Limitations

### ⚠️ What Phase 4 Does NOT Do

- ❌ Does **NOT** modify push notifications
- ❌ Does **NOT** expose sensitive user data
- ❌ Does **NOT** allow client-side reputation manipulation
- ❌ Does **NOT** add new HTTP endpoints

### ✅ What Phase 4 DOES Do

- ✅ Tracks reputation and rank server-side
- ✅ Provides public leaderboard (no PII)
- ✅ Auto-refreshes stats every 10 minutes
- ✅ Enforces RLS on all user data
- ✅ Uses existing battle infrastructure

## Next Steps

1. **Client Integration:** Use `get_my_reputation()` and `get_leaderboard()` in UI
2. **Tuning:** Adjust scoring weights in `pricing_rules` table
3. **Monitoring:** Watch edge function logs for refresh status
4. **Expansion:** Add seasonal leaderboards, achievements, etc.

## Verification Queries

```sql
-- Query 1: Check reputation table
SELECT * FROM public.user_reputation ORDER BY rep_score DESC LIMIT 10;

-- Query 2: Check daily stats
SELECT * FROM public.battle_stats_daily 
WHERE user_id = auth.uid() 
ORDER BY d DESC LIMIT 7;

-- Query 3: Check leaderboard
SELECT * FROM public.leaderboard_battle_mv ORDER BY rank LIMIT 20;

-- Query 4: Check your rank
SELECT * FROM public.leaderboard_battle_mv WHERE user_id = auth.uid();

-- Query 5: Manual refresh
SELECT public.refresh_battle_stats();

-- Query 6: Test apply outcome
SELECT public.apply_battle_outcome('<session-id>');
```

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
