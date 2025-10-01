# NORAH AI V5 - Read-Only Audit Report

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

**Report Date**: 2025-10-01  
**Scope**: NORAH AI v4.2 → v5 Readiness Assessment  
**Auditor**: Lovable AI (Read-Only Mode)

---

## Executive Summary

NORAH AI v4.2 is **production-ready** with robust NLU (spell correction, slang expansion, fuzzy matching), empathy layer (16 intros), coach CTAs (dynamic based on `clues`), retention responses, and anti-repetition (4-turn cooldown). The system is well-architected for **incremental v5 enhancements** without major refactoring.

**v5 Target Enhancements**:
1. **Dialogue Manager (DM)** - State-based conversation flow
2. **Multi-Intent & Sentiment** - Detect compound queries + emotional signals
3. **Next Best Action (NBA)** - Dynamic suggestions based on context
4. **Memory Summary** - Persistent conversation summaries
5. **Dynamic UI Pills** - Tappable suggestions replacing static chips
6. **Telemetry** - Anonymous event tracking for improvement

**Impact Assessment**: LOW-MEDIUM  
**Risk Level**: LOW (additive changes, no breaking modifications)

---

## 1. Current Architecture (v4.2)

### 1.1 File Structure

#### **Core Engine** (`src/intel/norah/engine/`)
| File | Lines | Purpose | v5 Impact |
|------|-------|---------|-----------|
| `intentRouter.ts` | 237 | NLU pipeline: normalize→spell→synonyms→fuzzy | +40-60 (multi-intent) |
| `spell.ts` | 115 | Damerau-Levenshtein + slang expansion | No change |
| `textNormalize.ts` | ~80 | Tokenization, synonyms, fuzzy scoring | No change |
| `replyGenerator.ts` | 358 | Reply composition + empathy + coach CTAs | +60-90 (DM integration) |
| `contextBuilder.ts` | 144 | Supabase context fetch + cache (1h TTL) | +10-20 (summary inclusion) |

#### **State & Knowledge**
| File | Lines | Purpose | v5 Impact |
|------|-------|---------|-----------|
| `state/messageStore.ts` | 54 | In-memory buffer (16 msgs) + Supabase persist | +30-40 (summary logic) |
| `kb/norahKB.it.json` | ~374 | FAQ/intents with 10-15 variants per intent | +30-50 (new CTAs) |

#### **UI Components**
| File | Lines | Purpose | v5 Impact |
|------|-------|---------|-----------|
| `components/intel/ai-analyst/AIAnalystPanel.tsx` | 277 | Chat UI + banner + input | +40-60 (pill suggestions) |
| `hooks/useIntelAnalyst.ts` | 195 | Message handling + TTS + context loading | +10-20 (DM wiring) |

#### **Backend**
| File | Lines | Purpose | v5 Impact |
|------|-------|---------|-----------|
| `supabase/functions/get-norah-context/index.ts` | 146 | Context API: agent, stats, clues, messages | +10-20 (time_bucket, summary) |

---

### 1.2 Current Capabilities (v4.2)

✅ **NLU 360°**
- Damerau-Levenshtein spell correction (40% threshold)
- Slang expansion (18 mappings: `nn→non`, `xké→perche`, etc.)
- Synonym expansion (`spiega→help`, `come si fa→help`)
- Single-word intent triggers (`finalshot`, `buzz`, `piani`)
- Fuzzy matching (0.40 threshold)
- Guard-rail: spoiler detection (coordinates/premio)

✅ **Empathy & Persona**
- 16 empathy intros with {nickname}, {code} interpolation
- 8 friend nudges (10% frequency)
- Retention responses: frustration (`non mi piace`), time constraints (`non ho tempo`), confusion (`nn capito niente`)
- 4-turn anti-repetition cooldown

✅ **Coach CTAs**
- Dynamic based on `clues`: 
  - 0 → onboarding (3 variants)
  - 1-3 → collection (3 variants)
  - 4-7 → analysis (3 variants)
  - ≥8 → final shot prep (3 variants)

✅ **Context & Memory**
- Supabase context fetch: agent, stats, clues, recent messages
- 1h `localStorage` cache with TTL
- 16-message buffer (8 turns)
- Fallback chain: `agent_profiles` → `profiles` → `AG-UNKNOWN`

✅ **UI/UX**
- Banner: "Norah Intelligence Ready • Agente {code}"
- Quick chips: hidden (handlers intact)
- Rotating placeholders (6 variants)
- Rounded chat corners (`rounded-2xl`)
- No ECG orb icon

✅ **Backend**
- `get-norah-context`: <200ms median
- RLS: all NORAH tables with `auth.uid() = user_id`
- JWT verification: active
- Optional cache header echo (`x-norah-cache-ttl`)

---

## 2. V5 Architecture Proposal

### 2.1 New Files Required

#### `src/intel/norah/engine/dialogueManager.ts` (NEW: ~200 lines)
**Purpose**: State machine for conversation flow

```typescript
export type DMState = 
  | 'onboarding'      // First interaction, no clues
  | 'collect'         // 1-3 clues, encourage BUZZ
  | 'analyze'         // 4-7 clues, pattern recognition
  | 'hypothesis'      // 8+ clues, BUZZ Map convergence
  | 'final_prep'      // Ready for Final Shot
  | 'retention';      // Frustration/off-ramp

export interface DialogueState {
  current: DMState;
  transitions: number;
  last_state_change: number;
}

// Core functions
export function deriveState(
  ctx: NorahContext, 
  lastUserMsg: string, 
  intents: NorahIntent[], 
  sentiment: SentimentResult
): DMState;

export function nextBestAction(
  ctx: NorahContext, 
  state: DMState
): { cta: string; reason: string; alternatives: string[] };

export function renderCoachReply(
  state: DMState, 
  ctx: NorahContext, 
  baseReply: string
): string;
```

**Logic**:
- `deriveState`: Compute state from `clues`, `buzz_today`, `sentiment`, `intents`
- `nextBestAction`: Heuristics for NBA (see §2.3)
- `renderCoachReply`: Inject state-specific tone/CTA

---

#### `src/intel/norah/engine/sentiment.ts` (NEW: ~80 lines)
**Purpose**: Emotional signal detection (IT-specific)

```typescript
export interface SentimentResult {
  frustrated: boolean;
  time_poor: boolean;
  confused: boolean;
  confident: boolean;
  score: number; // -1 (negative) to +1 (positive)
}

export function analyzeSentiment(text: string): SentimentResult;
```

**Signals**:
- **Frustrated**: `non mi piace`, `me ne vado`, `inutile`, `basta`
- **Time-poor**: `non ho tempo`, `più tardi`, `veloce`, `rapido`
- **Confused**: `nn capito`, `boh`, `non capisco niente`
- **Confident**: `sono sicuro`, `pronto`, `faccio final shot`

---

### 2.2 Modified Files

#### `intentRouter.ts` (+40-60 lines)
**Changes**:
- New function: `detectMultiIntents(text): NorahIntent[]`
  - Max 2 intents (e.g., `"non capisco finalshot e piani"` → `['about_finalshot', 'plans']`)
- Logic: After primary intent match, check for secondary keywords

#### `replyGenerator.ts` (+60-90 lines)
**Changes**:
- Import `dialogueManager` and `sentiment`
- Before reply composition:
  1. Detect sentiment
  2. Derive DM state
  3. Get NBA from DM
  4. If multi-intent → compose hybrid reply
- Inject state-aware tone/CTA via `renderCoachReply`

#### `messageStore.ts` (+30-40 lines)
**Changes**:
- Counter: track user messages
- Every 6 user messages:
  1. Generate mini-summary (3 sentences: state, hypothesis, next step)
  2. Persist to `norah_messages` with `intent: 'summary'`
- Expose `getLastSummary()` for context builder

#### `contextBuilder.ts` (+10-20 lines)
**Changes**:
- In response normalization: include last `summary` message from `recent_msgs`
- Add `server_now` and `time_bucket` to context (from edge response)

#### `AIAnalystPanel.tsx` (+40-60 lines)
**Changes**:
- Add dynamic pills below input:
  - Fetch 3 suggestions from `nextBestAction` (1 primary + 2 alternatives)
  - Render as tappable pills
  - On tap: fill input + auto-send
- Remove any residual chip rendering logic (already done in v4.2)

#### `useIntelAnalyst.ts` (+10-20 lines)
**Changes**:
- Import DM functions
- Pass DM state to `sendMessage` for telemetry
- Expose `nbaActions` state for pills

---

### 2.3 Next Best Action (NBA) Heuristics

| Context | Condition | NBA | Reason |
|---------|-----------|-----|--------|
| **Onboarding** | `clues === 0` | "Fai 1 BUZZ ora (30s)" | No data, need bootstrap |
| **Collection** | `1 ≤ clues ≤ 3` | "Altri 2 BUZZ oggi" | Build dataset |
| **Analysis** | `4 ≤ clues ≤ 7` | "Apri BUZZ Map e confronta X vs Y" | Pattern search |
| **Hypothesis** | `clues ≥ 8` | "Valuta Final Shot (max 2/giorno)" | Ready to execute |
| **Zero activity today** | `buzz_today === 0 && time ∈ [08–22]` | "1 BUZZ adesso, poi analisi" | Daily engagement |
| **Late night** | `time ∈ [22–08]` | "Domani mattina 2-3 BUZZ" | Sleep hygiene |
| **Frustration** | `sentiment.frustrated === true` | "3 dritte rapide" | Retention mode |

**Alternatives** (shown as pills 2-3):
- "Rivedi ultimi 3 indizi"
- "Spiegami BUZZ Map"
- "Stato missione"

---

## 3. Supabase Changes

### 3.1 Edge Function Updates

#### `get-norah-context/index.ts` (+10-20 lines)
**Changes**:
- Add `server_now: new Date().toISOString()`
- Add `time_bucket: new Date().getHours()` (0-23)
- Include last `summary` from `norah_messages` in `recent_msgs`

**Response shape**:
```json
{
  "agent": { "code": "AG-X1234", "nickname": "Mario" },
  "stats": { "clues": 8, "buzz_today": 2, "finalshot_today": 0 },
  "server_now": "2025-10-01T14:32:00.000Z",
  "time_bucket": 14,
  "recent_msgs": [
    { "role": "user", "content": "...", "intent": "about_buzz" },
    { "role": "norah", "content": "...", "intent": "summary" }
  ]
}
```

---

### 3.2 New Table: `norah_events` (Telemetry)

**Migration SQL**:
```sql
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
CREATE TABLE public.norah_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('intent', 'state', 'cta_click', 'summary_generated')),
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.norah_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own events
CREATE POLICY "Users can insert own norah events"
  ON public.norah_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own events
CREATE POLICY "Users can view own norah events"
  ON public.norah_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_norah_events_user_created ON public.norah_events(user_id, created_at DESC);
```

**Usage** (client-side, fire-and-forget):
```typescript
// Non-blocking telemetry
supabase.from('norah_events').insert({
  event: 'state',
  payload: { from: 'collect', to: 'analyze', clues: 5 }
}).then(() => {}).catch(() => {}); // Silent fail OK
```

---

## 4. Estimated Lines of Code (LOC)

| File | Current | v5 Addition | Total | Complexity |
|------|---------|-------------|-------|------------|
| **dialogueManager.ts** (NEW) | 0 | 200 | 200 | Medium |
| **sentiment.ts** (NEW) | 0 | 80 | 80 | Low |
| intentRouter.ts | 237 | 50 | 287 | Low |
| replyGenerator.ts | 358 | 75 | 433 | Medium |
| messageStore.ts | 54 | 35 | 89 | Low |
| contextBuilder.ts | 144 | 15 | 159 | Low |
| AIAnalystPanel.tsx | 277 | 50 | 327 | Low |
| useIntelAnalyst.ts | 195 | 15 | 210 | Low |
| get-norah-context/index.ts | 146 | 15 | 161 | Low |
| norahKB.it.json | 374 | 40 | 414 | Low |
| **TOTAL** | **1,785** | **575** | **2,360** | **32% increase** |

**Breakdown**:
- **New files**: 280 lines (dialogueManager + sentiment)
- **Modified files**: 295 lines (incremental enhancements)
- **Total effort**: ~575 lines across 10 files

---

## 5. Risk Assessment & Mitigations

### 5.1 Performance Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **DM state computation** adds latency | +10-20ms per reply | Optimize heuristics; cache state in context |
| **Sentiment analysis** regex heavy | +5-10ms | Pre-compile regex patterns; limit to 10 signals |
| **Multi-intent detection** double-pass | +10-15ms | Early exit on high confidence; max 2 intents |
| **Summary generation** every 6 msgs | +50-100ms (non-blocking) | Fire-and-forget; don't block user interaction |
| **Telemetry inserts** | +5-10ms | Silent fail; no await; use `insert().then().catch()` |

**Total overhead**: ~30-50ms (still <200ms target)

---

### 5.2 UX Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Dynamic pills confuse users** | Low engagement | A/B test; fallback to static CTAs if <20% tap rate |
| **Multi-intent replies too long** | Cognitive overload | Max 2 intents; prioritize primary; keep ≤3 sentences |
| **State transitions jarring** | Perceived inconsistency | Smooth transitions; explain state changes explicitly |
| **Summary notifications intrusive** | Annoyance | Silent persist; only show if user asks "catch me up" |

---

### 5.3 Security/RLS Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **norah_events table abuse** | Spam/storage bloat | Rate limit: max 100 events/user/day via trigger |
| **Summary content spoils answers** | Guard-rail violation | Summary generator uses same no_spoiler logic |
| **Telemetry leaks agent identity** | Privacy concern | Anonymize payload: use `agent_hash` not `agent_code` |

---

## 6. Proposed Acceptance Criteria (v5)

### 6.1 Functional Tests

| Test | Input | Expected Output | Pass Criteria |
|------|-------|-----------------|---------------|
| **Multi-intent** | "non capisco finalshot e piani" | 2 definitions + 1 unified CTA | Both intents addressed |
| **Sentiment: time-poor** | "ho poco tempo" | 1 line + 30s micro-step | Action ≤30s |
| **Sentiment: confused** | "nn capito niente" | Reassurance + 1 step | Single action |
| **Sentiment: frustrated** | "me ne vado" | Retention reply + 3 options | Engaging tone |
| **NBA: onboarding** | First message, clues=0 | "Fai 1 BUZZ ora (30s)" | Specific, actionable |
| **NBA: analysis** | clues=6 | "Apri BUZZ Map e confronta" | Contextual next step |
| **NBA: final prep** | clues=10 | "Valuta Final Shot (max 2/giorno)" | Clear constraint |
| **Anti-repeat** | 5x "finalshot?" | Never same CTA in 4 turns | Variety confirmed |
| **Pills tappable** | Click pill | Input fills + auto-sends | No manual typing |
| **Summary persist** | 6 user messages | `intent: 'summary'` in DB | Record exists |
| **Guard-rail** | "coordinate del premio?" | Spoiler block | No leakage |

### 6.2 Performance Tests

| Metric | Target | Test Method |
|--------|--------|-------------|
| **Edge response** | <200ms | 100 requests, p95 |
| **DM state derivation** | <20ms | Benchmark isolated function |
| **Sentiment analysis** | <10ms | Benchmark 20 sample texts |
| **Multi-intent detection** | <15ms | Benchmark 10 compound queries |
| **Summary generation** | <100ms (non-blocking) | Async test, no block |

### 6.3 Telemetry Validation

| Event | Payload | Frequency |
|-------|---------|-----------|
| `state` | `{ from, to, clues, buzz_today }` | On state change |
| `cta_click` | `{ cta, state, clues }` | On pill tap |
| `summary_generated` | `{ turn_count, clues }` | Every 6 msgs |
| `intent` | `{ intent, confidence, multi }` | Every user message |

**Check**: After 100 interactions, `norah_events` should have ~400-500 rows (4-5 events/interaction)

---

## 7. Implementation Roadmap

### Phase 1: Core DM + Sentiment (3-4 hours)
1. Create `dialogueManager.ts` with state logic
2. Create `sentiment.ts` with IT-specific patterns
3. Integrate into `replyGenerator.ts`
4. Write unit tests for state transitions

### Phase 2: Multi-Intent + NBA (2-3 hours)
1. Extend `intentRouter.ts` with multi-intent detection
2. Implement NBA heuristics in DM
3. Update coach CTAs to use NBA output
4. Test compound queries

### Phase 3: Memory Summary (1-2 hours)
1. Add summary counter to `messageStore.ts`
2. Implement summary generator (reuse reply generator)
3. Persist summaries to `norah_messages`
4. Include summary in context fetch

### Phase 4: UI Pills (2 hours)
1. Add pill rendering to `AIAnalystPanel.tsx`
2. Wire tap-to-send logic
3. Style pills (rounded, gradient, tap animation)
4. Test on mobile

### Phase 5: Telemetry (1 hour)
1. Create `norah_events` table migration
2. Add fire-and-forget inserts in hook
3. Verify RLS policies
4. Test no performance impact

### Phase 6: Backend Updates (1 hour)
1. Add `server_now` + `time_bucket` to edge response
2. Include summary in `recent_msgs`
3. Test cache header echo still works

### Phase 7: Testing + QA (2 hours)
1. Run acceptance tests (§6.1)
2. Performance benchmarks (§6.2)
3. Telemetry validation (§6.3)
4. Regression tests (v4.2 features intact)

**Total Estimated Effort**: 12-15 hours

---

## 8. Migration Strategy

### Option A: Big Bang (1 PR)
- All v5 features in single deployment
- **Pros**: Clean cut, no feature flags
- **Cons**: Higher risk, harder rollback

### Option B: Phased (3 PRs)
1. **PR1**: DM + Sentiment + Multi-Intent (backend-ready)
2. **PR2**: NBA + Memory Summary (logic layer)
3. **PR3**: UI Pills + Telemetry (frontend polish)
- **Pros**: Incremental validation, safer
- **Cons**: 3x review cycles

**Recommendation**: **Option B (Phased)** - safer for production

---

## 9. Backward Compatibility

### No Breaking Changes
- v4.2 features remain intact (spell, slang, empathy, CTAs)
- New files don't affect existing imports
- Telemetry is optional (silent fail)
- UI pills additive (input still works without them)
- DM states transparent to user (just better replies)

### Feature Flags (Optional)
```typescript
const V5_FEATURES = {
  dialogue_manager: true,    // Enable state-based flow
  multi_intent: true,        // Detect compound queries
  sentiment: true,           // Emotional signals
  nba_pills: true,           // Dynamic suggestions UI
  telemetry: true,           // Event tracking
  memory_summary: true       // Persistent summaries
};
```

---

## 10. Monitoring & Success Metrics

### KPIs (Week 1 post-launch)

| Metric | Target | Method |
|--------|--------|--------|
| **Avg. reply time** | <200ms | Edge logs |
| **NBA pill tap rate** | >20% | Telemetry `cta_click` |
| **Multi-intent accuracy** | >80% | Manual review 50 samples |
| **Sentiment detection accuracy** | >75% | Manual review frustration cases |
| **State transition smoothness** | <5% user complaints | Feedback form |
| **Summary usefulness** | >30% "catch me up" queries use it | Telemetry |

---

## 11. Open Questions

1. **Summary trigger**: 6 user messages or 10 minutes idle?
   - **Recommendation**: 6 messages (simpler, predictable)

2. **NBA alternatives count**: 2 or 3?
   - **Recommendation**: 2 (less clutter, easier choice)

3. **Telemetry retention**: 30 days or 90 days?
   - **Recommendation**: 30 days (GDPR-friendly, sufficient for analysis)

4. **DM state visibility**: Show badge "Fase: Analisi" or hidden?
   - **Recommendation**: Hidden (implicit, avoid jargon)

5. **Sentiment thresholds**: How many frustrated signals to trigger retention?
   - **Recommendation**: 1 signal = immediate retention (safety first)

---

## 12. Conclusion

NORAH AI v4.2 provides a **solid foundation** for v5 enhancements. The proposed changes are:
- **Additive**: No breaking modifications
- **Low-risk**: Well-scoped, incremental
- **High-value**: Improved UX (NBA pills), smarter replies (DM/sentiment), continuity (summaries)

**Estimated effort**: 12-15 hours  
**Risk level**: LOW  
**Production readiness**: READY (with phased rollout)

**Recommendation**: ✅ **PROCEED WITH PHASED IMPLEMENTATION (Option B)**

---

## Appendix A: File Map (v4.2 → v5)

```
src/intel/norah/
├── engine/
│   ├── intentRouter.ts         [MODIFY +50]
│   ├── spell.ts                [NO CHANGE]
│   ├── textNormalize.ts        [NO CHANGE]
│   ├── replyGenerator.ts       [MODIFY +75]
│   ├── contextBuilder.ts       [MODIFY +15]
│   ├── dialogueManager.ts      [NEW +200]
│   └── sentiment.ts            [NEW +80]
├── state/
│   └── messageStore.ts         [MODIFY +35]
└── kb/
    └── norahKB.it.json         [MODIFY +40]

src/components/intel/ai-analyst/
└── AIAnalystPanel.tsx          [MODIFY +50]

src/hooks/
└── useIntelAnalyst.ts          [MODIFY +15]

supabase/functions/
└── get-norah-context/
    └── index.ts                [MODIFY +15]

supabase/migrations/
└── [new]_create_norah_events.sql [NEW]
```

---

**Report Status**: ✅ COMPLETE  
**Next Step**: Await approval for implementation  

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
