# 🔍 BUZZ CLUE ENGINE AUDIT REPORT

**Date:** 2025-12-12  
**Author:** Cursor AI (Senior Full-Stack Engineer)  
**Project:** M1SSION™

---

## EXECUTIVE SUMMARY

L'audit ha identificato **6 root causes critici** che spiegano perché gli indizi si ripetono e non sono legati alla missione corrente:

| Issue | Severity | Status |
|-------|----------|--------|
| No START MISSION gate enforcement | 🔴 CRITICAL | Open |
| Week-based instead of Day-based progression | 🔴 CRITICAL | Open |
| No cooldown system (categories/features repeat) | 🟠 HIGH | Open |
| No clarity curve (disclosure budget) | 🟠 HIGH | Open |
| No backend M1U verification | 🟡 MEDIUM | Open |
| No scoring gate / leak risk check | 🟡 MEDIUM | Open |

---

## 1. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ADMIN (Mission Setup)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  MissionCommandCenter.tsx                                                        │
│    ↓ city, country, street, lat/lng, prize_*                                     │
│  generate-mission-clues (Edge Function)                                          │
│    ↓ GENERATES 1200 clues (300/week × 4 weeks)                                   │
│    ↓ 75% real + 25% fake                                                         │
│    ↓ Categories: location (50%) + prize (50%)                                    │
│  INSERT INTO prize_clues (prize_id, week, description_it, is_fake, ...)         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           USER (Runtime BUZZ)                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  BuzzPage.tsx → BuzzActionButton → useBuzzHandler → useBuzzApi                   │
│    ↓ userId (NO mission enrollment check!)                                       │
│    ↓ (NO day-based clarity check!)                                               │
│  handle-buzz-press (Edge Function)                                               │
│    ↓ SELECT FROM prize_clues WHERE prize_id = active AND week <= currentWeek     │
│    ↓ Filter out already unlocked                                                 │
│    ↓ Random selection (NO cooldown, NO scoring gate)                             │
│  Response: { clue: { text: "..." } }                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ROOT CAUSE ANALYSIS

### 2.1 🔴 NO START MISSION GATE ENFORCEMENT

**Evidence:**

- `src/components/buzz/BuzzActionButton.tsx`: NO `isEnrolled` check
- `supabase/functions/handle-buzz-press/index.ts`: NO `mission_enrollments` query

**Impact:** Users can use Buzz without pressing START MISSION.

**Files:**
- `src/pages/BuzzPage.tsx` (line 186-191)
- `src/components/buzz/BuzzActionButton.tsx` (line 184-198)
- `supabase/functions/handle-buzz-press/index.ts` (entire function)

---

### 2.2 🔴 WEEK-BASED INSTEAD OF DAY-BASED PROGRESSION

**Evidence:**

```typescript
// handle-buzz-press/index.ts (lines 314-320)
const daysSinceStart = Math.floor((now - missionStart) / (1000*60*60*24));
const currentWeek = Math.min(4, Math.max(1, Math.floor(daysSinceStart / 7) + 1));

// Clues filtered by WEEK, not DAY
.lte('week', currentWeek)
```

**Impact:** Only 4 disclosure levels instead of 30. Progression is too coarse.

**Required:** Implement day-based clarity curve:
- Day 1–7: clarity 0.10–0.25 (circumstantial)
- Day 8–15: clarity 0.25–0.45 (more understandable)
- Day 16–23: clarity 0.45–0.70 (understandable)
- Day 24–30: clarity 0.70–0.85 (very understandable but never certain)

---

### 2.3 🟠 NO COOLDOWN SYSTEM

**Evidence:**

- No `used_categories_last_n` tracking
- No `used_features_last_n` tracking
- No `used_openings_last_n` tracking

**Impact:** Same category/feature/structure can appear consecutively.

**Required:**
- Same category within 2 clues → reject
- Same strong feature within 5 clues → reject
- Same structure within 3 clues → reject

---

### 2.4 🟠 NO CLARITY CURVE (DISCLOSURE BUDGET)

**Evidence:**

```typescript
// handle-buzz-press/index.ts (line 366)
const selected = pool[Math.floor(Math.random() * pool.length)];
// ↑ Pure random selection, no clarity scoring
```

**Impact:** No progressive disclosure. Week 1 clues can be too revealing.

**Required:** Each clue must have a `clarity_score` and be selected based on:
- Current day in mission
- Max allowed clarity for that day

---

### 2.5 🟡 NO BACKEND M1U VERIFICATION

**Evidence:**

- M1U check is ONLY in `BuzzActionButton.tsx` (frontend)
- `handle-buzz-press` does NOT verify M1U balance

**Impact:** Can be bypassed by calling Edge Function directly.

---

### 2.6 🟡 NO SCORING GATE / LEAK RISK CHECK

**Evidence:**

- No `relevance_location` scoring
- No `relevance_prize` scoring
- No `leak_risk` calculation
- No rejection threshold

**Required:**
- relevance_location ≥ 0.6
- relevance_prize ≥ 0.4
- uniqueness ≥ 0.6
- leak_risk ≤ threshold(day)

---

## 3. IMPLEMENTATION PLAN (PHASED)

### Phase 1: START MISSION HARD GATE (CRITICAL) ⏱️ 2h

1. **Frontend Gate** (`BuzzPage.tsx`, `BuzzActionButton.tsx`):
   - Add `useActiveMissionEnrollment()` hook
   - Disable Buzz button if `!isEnrolled`
   - Show message: "Press START M1SSION to begin"

2. **Backend Gate** (`handle-buzz-press/index.ts`):
   - Query `mission_enrollments` for user
   - Return 403 if not enrolled

3. **Backend M1U Check** (`handle-buzz-press/index.ts`):
   - Query `profiles.m1_units`
   - Calculate cost based on daily counter
   - Return 402 if insufficient

---

### Phase 2: DAY-BASED PROGRESSION ENGINE ⏱️ 4h

1. **Add `day_index` to clue selection**:
   - Calculate `daysSinceStart` (1-30)
   - Map day to `clarity_band`

2. **Add `clarity_score` to `prize_clues` table**:
   - Migration: `ALTER TABLE prize_clues ADD COLUMN clarity_score FLOAT DEFAULT 0.5`
   - Update `generate-mission-clues` to assign scores

3. **Update `handle-buzz-press`**:
   - Filter clues by `clarity_score <= max_clarity_for_day`

---

### Phase 3: COOLDOWN & ROTATION SYSTEM ⏱️ 3h

1. **Extend `user_clues` table**:
   ```sql
   ALTER TABLE user_clues ADD COLUMN category TEXT;
   ALTER TABLE user_clues ADD COLUMN features_used JSONB;
   ALTER TABLE user_clues ADD COLUMN method_used TEXT;
   ```

2. **Implement cooldown check**:
   - Query last N clues for user
   - Extract categories and features
   - Reject candidates that violate cooldown

---

### Phase 4: SCORING GATE & LEAK RISK ⏱️ 3h

1. **Add scoring functions** in Edge Function:
   - `calculateRelevanceLocation(clue, mission)`
   - `calculateRelevancePrize(clue, prize)`
   - `calculateLeakRisk(clue, day)`

2. **Implement rejection loop**:
   - Generate candidate
   - Score it
   - Accept or regenerate

---

### Phase 5: FEATURE EXTRACTION & BINDING ⏱️ 4h

1. **Create `extractMissionFeatures(mission)`**:
   - hemisphere, lat_band, timezone_band
   - coast_distance_band, urban_density_proxy
   - climate_hint proxy

2. **Create `extractPrizeFeatures(prize)`**:
   - materials, origin_style, use_context, history_tone

3. **Enforce binding rule**:
   - ≥1 location feature
   - ≥1 prize feature
   - 1 bridge metaphor

---

## 4. FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/pages/BuzzPage.tsx` | Add enrollment check |
| `src/components/buzz/BuzzActionButton.tsx` | Gate on `isEnrolled` |
| `supabase/functions/handle-buzz-press/index.ts` | Full rewrite for new engine |
| `supabase/functions/generate-mission-clues/index.ts` | Add clarity scoring |
| `supabase/migrations/XXXXXX_clue_engine_v2.sql` | Schema updates |

---

## 5. VERIFICATION CHECKLIST

- [ ] START MISSION required before Buzz
- [ ] M1U check enforced (frontend + backend)
- [ ] Clues differ by mission_id
- [ ] No city/coords leakage in clue text
- [ ] No repetition across 10+ generated clues
- [ ] Fake distribution ~25%
- [ ] Day 1 clues are vague, Day 28 clues are clearer
- [ ] Category cooldown working (no same category within 2)
- [ ] Feature cooldown working (no same feature within 5)

---

**© 2025 M1SSION™ – NIYVORA KFT™**




