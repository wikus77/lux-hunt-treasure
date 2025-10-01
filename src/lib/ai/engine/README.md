# M1SSION™ Intelligence Engine

**© 2025 Joseph MULÉ – NIYVORA KFT™**

## Architecture

Advanced AI Analyst engine with agent-aware context, guardrails, and natural variety.

### Components

```
src/lib/ai/engine/
├── context.ts       # Agent code + clue retrieval (read-only)
├── guardrails.ts    # Anti-spoiler protection
├── persona.ts       # Agent-aware greetings & tone
├── router.ts        # Intent detection + FSM
├── heuristics.ts    # TF-IDF, NER, decoders (offline)
├── variety.ts       # Seed-based template selection
├── templates.ts     # 250 responses organized by intent/state
└── index.ts         # Main orchestrator
```

### State Machine

```
[idle] ─→ [collect] ─→ [analyze] ─→ [advise]
           (0-2)        (3-7)         (8+)
          clues        clues         clues
```

- **idle**: Initial state, greeting
- **collect**: Need more clues (< 3)
- **analyze**: Enough data for analysis (3-7)
- **advise**: Rich dataset, strategic advice (8+)

### Intent Detection

```typescript
type Intent = 'about' | 'classify' | 'patterns' | 'decode' | 'probability' | 'mentor';
```

**Keywords:**
- `about`: "parlami di m1ssion", "cos'è m1ssion"
- `classify`: "classifica", "organizza", "categorizza"
- `patterns`: "pattern", "collegamento", "correlazione"
- `decode`: "decodifica", "anagramma", "base64", "caesar"
- `probability`: "probabilità", "chance", "vincere"
- `mentor`: "aiuto", "consiglio", "motivazione"

### Guardrails

**Blocked requests:**
- Location reveals: "dov'è", "coordinate", "indirizzo"
- Spoilers: "svelami", "dammi la soluzione"
- Length abuse: > 500 chars
- Empty/nonsense input

**Response:**
Educational refusal with alternative guidance.

### Heuristics (Offline)

1. **TF-IDF Keyword Extraction**
   - Stop words filtering (Italian)
   - Term frequency × inverse document frequency
   - Top 8 keywords per analysis

2. **Cosine Similarity Clustering**
   - Simple k-means (k=2)
   - Groups similar clues

3. **Basic Decoders**
   - Base64 (with printable ASCII check)
   - Caesar cipher (±3)
   - String reverse
   - ASCII codes (numeric patterns)

4. **Recency Scoring**
   - Decay over 30 days
   - Recent clues weighted higher

5. **Confidence Estimation**
   - Based on clue count + recency
   - Range: 0.0 - 1.0

### Variety System

**Deterministic seed:**
```typescript
seed = agentCodeHash + clueIdsHash + timeBucket(30s) + intentLength + stateLength
```

**Variations:**
- **Hedges**: "Sembra", "Direi", "Potrebbe" (33% chance)
- **Discourse markers**: "Intanto", "Quindi", "In breve" (50% chance)
- **Natural pauses**: Em dash insertion
- **Closers**: 10 motivational variants

**Result:** Same user + same clues + same intent = different phrasing every 30s.

### Agent Code Integration

**Greeting examples:**
```
🎯 Agente AG-X0197, sistema online. Pronti a ragionare insieme.
👁️ Bentornato, AG-X0197. Allineo i segnali e ti seguo.
⚡ AG-X0197, centrale operativa attiva. Cosa analizziamo oggi?
```

**References injected:**
- First message: Always includes agent code
- Every 5 messages: Natural agent reference

### Usage

```typescript
import { analystReply } from '@/lib/ai/engine';

// Simple usage
const response = await analystReply(userInput);

// With explicit intent
const response = await analystReply(userInput, 'classify');

// Reset session (e.g., on logout)
resetSession();

// Debug state
const { state, messageCount } = getSessionState();
```

### Performance

- **Read-only**: No database writes
- **Offline heuristics**: No external API calls
- **Session state**: In-memory (could move to sessionStorage)
- **Caching**: Agent code + clues loaded once per session

### Security

✅ **Anti-spoiler guardrails**
✅ **No coordinate reveals**
✅ **No access to non-user clues**
✅ **Input length limits**
✅ **Read-only database access**

### Testing

**Manual test cases:**

1. **"Parlami di M1SSION"** → Info without spoilers
2. **"Dammi le coordinate"** → Blocked with guidance
3. **0 clues + "trova pattern"** → Collect state response
4. **3+ clues + "classifica"** → Classification with clusters
5. **Repeat same question 3x** → Different phrasing, same meaning

### Maintenance

**To add new templates:**
1. Edit `templates.ts`
2. Add to appropriate `TEMPLATES[intent][state]`
3. Use template function format:
   ```typescript
   (tc: TemplateContext) => string
   ```

**To add new intent:**
1. Update `router.ts` → `Intent` type + `INTENT_KEYWORDS`
2. Add templates in `templates.ts`
3. Optional: Add heuristic in `heuristics.ts`

**To adjust FSM:**
1. Edit `router.ts` → `nextState()` function
2. Update state thresholds (clue counts)

### Dependencies

- Supabase (read-only queries)
- No external AI APIs
- No additional npm packages

### Scope

**✅ Intelligence page only**
**❌ No changes to:** Final Shot, BUZZ, routing, auth, theme
