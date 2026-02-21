# AION NPC PREMIUM MIN+MID — Deliverable (Safe)

**Data:** 2026-02-21  
**Branch:** `fix/aion-npc-premium-minmid-safe`  
**Tag rollback:** `safety/aion-npc-premium-minmid-before-20260221_035424`

---

## 1) PRIMA / DOPO

### Domande che ora chiamano Gemini (prima erano out_of_scope)

- **"Dammi un consiglio"** → inScope (keyword "consiglio") → Gemini chiamato.
- **"Dammi un consiglio su M1SSION"** → inScope ("consiglio" + "mission") → Gemini.
- **"Cosa devo fare?"** / **"What should I do?"** / **"Que dois-je faire ?"** → inScope ("cosa", "fare" / "what", "do" / "que", "faire") → Gemini; altrimenti fallback mission-control (3 step).
- **"E poi?"** / **"And then?"** / **"Et ensuite?"** → inScope (follow-up "e poi", "and then", "et ensuite") → Gemini o fallback mission-control.
- **"Prossimo passo"** / **"Next step"** → inScope → Gemini.
- **"Consigliami"**, **"Help me"**, **"Que faire"** → inScope → Gemini.

### Esempi di output atteso (IT/EN/FR)

- **"Cosa devo fare?"** (IT)  
  Risposta AION (Gemini o fallback): 3 step concreti — (1) Fai un BUZZ per un indizio, (2) Esplora la mappa, (3) Quando sei pronto tenta il Final Shot. Max ~110 parole.

- **"What should I do next?"** (EN)  
  Reply in English: (1) Do a BUZZ for a clue, (2) Explore the map, (3) When ready try the Final Shot.

- **"Que dois-je faire ?"** (FR)  
  Réponse en français: (1) Fais un BUZZ pour un indice, (2) Explore la carte, (3) Tente le Final Shot quand tu es prêt.

- **"E poi?"** (dopo aver parlato di BUZZ)  
  Mission-control o risposta contestuale (più contesto in history, finestra 8).

- **"Dammi un consiglio"**  
  Risposta concreta + domanda chiarificatrice (non più solo "conoscenza limitata"); niente ripetizione identica "chiedimi BUZZ/mappa".

### Sicurezza

- **"Dove si trova il tesoro?"** → comportamento invariato: **NON** rivelare posizione; fallback `treasureWhere` (IT/EN/FR).

---

## 2) DIFF MINIMALE

- **File modificati:** 2  
  - `supabase/functions/norah-chat-v2/index.ts`  
  - `src/pages/intel/IntelChatPanel.tsx`

- **Edge (norah-chat-v2):**  
  - `normalizeText`: toLowerCase + rimozione punteggiatura + collapse spazi.  
  - `isInScope`: ritorna `{ inScope, matchedKeyword }`; aggiunte keyword intent (consiglio, prossimo, passo, next, step, que faire, e poi, then, et ensuite, après, ecc.).  
  - `getFallbackReply`: aggiunto `missionControl` (IT/EN/FR), whatToDo e follow-up → mission-control; parametro `lastAssistantContent` per evitare generic ripetuto.  
  - `AION_SYSTEM_PROMPT`: aggiunte 3 regole operative (next action, chiarimento, variazione).  
  - Telemetria: `request_id`, log con `normalizedText` (120 char), `inScope`, `matched_keyword`, `attemptedGemini`, `gemini_status`, `errorTextShort` (300), `reply_len`, `fallback_reason`.  
  - `meta`: `request_id`, `fallback_reason` (se fallback), `gemini_status` (se chiamata Gemini).  
  - `conversationHistory`: `slice(-6)` → `slice(-8)`.  
  - `maxOutputTokens`: 256 → 384.  
  - `langInstruction`: una riga ("Reply ONLY in English" / "Rispondi SOLO in italiano" / "Réponds UNIQUEMENT en français").  
  - Anti-fallback loop: se `fallback_reason` è `http_error` o `empty_reply` e l’ultimo messaggio assistant “sembra” fallback → risposta mission-control invece di generic.

- **Client (IntelChatPanel):**  
  - Language-lock: se `detectLang(text)` è null, `lastUserLangRef.current = appLang` (i18n.language en/fr/it).  
  - Invio sempre `reply_lang: lastUserLangRef.current` (non solo quando detected non null).

---

## 3) CHECKLIST NON-REGRESSIONE

- [ ] **check_aion_access** e logica M1U/free plan non modificati.
- [ ] Regola “mai rivelare posizioni” invariata nel prompt e in `treasureWhere`.
- [ ] Formato risposta: `{ reply, ssml, visemes, access?, meta }` invariato per il client; `meta` esteso con `request_id`, opzionalmente `fallback_reason` e `gemini_status`.
- [ ] Nessun impatto su Home / Map / Buzz / IAP / routing / wrapper iOS.
- [ ] Test IT: “Dammi un consiglio su M1SSION” → risposta concreta; “E poi?” dopo BUZZ → mission-control o coerente; “Dove si trova il tesoro?” → nessuna posizione.
- [ ] Test EN: “What should I do next?” → 3 step in inglese.
- [ ] Test FR: “Que dois-je faire ?” → 3 step in francese.
- [ ] Log: nessun log di `GEMINI_API_KEY` o segreti.

---

## 4) COMANDI DEPLOY E ROLLBACK

### Deploy (dopo commit)

```bash
# Build e sync (se serve per client)
npm run build
npx cap sync ios

# Deploy solo edge function
npx supabase functions deploy norah-chat-v2
```

### Rollback (edge + client)

```bash
# Ripristina i 2 file al tag safety
git checkout safety/aion-npc-premium-minmid-before-20260221_035424 -- supabase/functions/norah-chat-v2/index.ts
git checkout safety/aion-npc-premium-minmid-before-20260221_035424 -- src/pages/intel/IntelChatPanel.tsx

# Ridistribuisci l’edge
npx supabase functions deploy norah-chat-v2
```

Se hai già committato e vuoi tornare al tag interamente:

```bash
git checkout safety/aion-npc-premium-minmid-before-20260221_035424 -- .
npx supabase functions deploy norah-chat-v2
```

---

## 5) TEST PLAN (iOS / web)

| Lingua | Input | Atteso |
|--------|--------|--------|
| IT | "Dammi un consiglio su M1SSION" | Risposta AION concreta + domanda chiarificatrice (non "conoscenza limitata") |
| IT | "Parlami di BUZZ" | OK (come prima) |
| IT | "E poi?" (subito dopo BUZZ) | Mission-control o follow-up coerente |
| EN | "What should I do next?" | 3 step concreti in inglese |
| FR | "Que dois-je faire ?" | 3 step concreti in francese |
| IT | "Dove si trova il tesoro?" | NON rivelare posizione (fallback treasureWhere) |
| - | Formato risposta | `reply`, `ssml`, `visemes` compatibili col client; nessun impatto su altre pagine |

---

**FINE DELIVERABLE**
