# AION Lingua sbagliata + Out-of-scope — Incident Report

**Data:** 2026-02-21  
**Tag rollback:** `safety/aion-lang-scope-incident-20260221_042609`  
**Branch:** fix/aion-lang-lock-safe

---

## FASE 0 — Safety

- **git status -sb:** `## fix/aion-lang-lock-safe` (M IntelChatPanel, M norah-chat-v2, altri)
- **HEAD:** `f96786c2`
- **Diff stat (solo 2 file):** `IntelChatPanel.tsx` ~12 righe, `norah-chat-v2/index.ts` ~183 righe

### Rollback one-liner (file-level)

```bash
git checkout safety/aion-lang-scope-incident-20260221_042609 -- supabase/functions/norah-chat-v2/index.ts src/pages/intel/IntelChatPanel.tsx && npx supabase functions deploy norah-chat-v2
```

Opzionale (bundle client): `npm run build && npx cap sync ios`

---

## FASE 1 — Verifica forense (read-only)

### A) Client — IntelChatPanel.tsx

| Punto | Dove | Cosa |
|-------|------|------|
| detectLang | `const detected = detectLang(messageText)` | Ritorna 'it'\|'en'\|'fr' o null |
| lastUserLangRef | Aggiornato solo se `if (detected)` | Non più sovrascritto con appLang quando null |
| lang / reply_lang | `lang = detected ?? lastUserLangRef.current ?? appLang`; `reply_lang: replyLang` con `replyLang = lastUserLangRef.current` | reply_lang sempre “locked” alla lingua riconosciuta |
| Log (DEV) | `console.log('[AION][LANG]', { text, detected, lastUserLangRef, appLang, lang, reply_lang })` | Senza token/keys |

### B) Edge — norah-chat-v2/index.ts

| Punto | Dove | Cosa |
|-------|------|------|
| replyLang | `(reply_lang \|\| lang) === 'en' ? 'en' : ... === 'fr' ? 'fr' : 'it'` | Single source per Gemini + fallback |
| normalizeText | m1ssion→mission, buzzmap→buzz map, finalshot/final shoot→final shot, lowerCase, punteggiatura, collapse spazi | |
| isInScope | Keyword: final shot, final, shot, buzz, e poi, poi, et ensuite, après, … | Ritorna { inScope, matchedKeyword } |
| effectiveInScope | Se !inScope e `isShortFollowUp(normalizedText)` e `messages.length >= 2` → inScope = true | Patch 2.6 |
| langInstruction | "RISPOSTA SOLO IN ITALIANO. NON usare altre lingue." (e equivalenti EN/FR) | Patch 2.4 |
| Fallback / wrong lang | getFallbackReply(..., replyLang); se Gemini in lingua sbagliata → MISSION_CONTROL[replyLang], fallback_reason = 'wrong_language' | Patch 2.5 |
| Log | request_id, normalizedText (120), inScope, matched_keyword, attemptedGemini, gemini_status, fallback_reason, reply_len | Già presenti |

---

## FASE 2 — Patch applicate (solo 2 file)

- **2.1 Client lang lock:** Già presente: lastUserLangRef solo se detectLang !== null; reply_lang = lastUserLangRef.current.
- **2.2 normalize "final shoot":** Già presente: `.replace(/\bfinal\s+shoot\b/gi, 'final shot')`.
- **2.3 isInScope final/shot:** Già presenti keyword "final shot", "final", "shot".
- **2.4 langInstruction hard lock:** Aggiunto "NON usare altre lingue." / "Do not use any other language." / "N'utilise aucune autre langue."
- **2.5 Guardrail wrong language:** Quando si sostituisce reply con MISSION_CONTROL per lingua sbagliata → `fallbackReason = 'wrong_language'`; meta include già fallback_reason.
- **2.6 Follow-up "E poi / Et après / And then":** Aggiunta `isShortFollowUp(normalizedText)`; se !inScope e messages.length >= 2 e short follow-up → inScope = true.

---

## FASE 3 — Test plan (da eseguire manualmente)

| # | Input | Atteso |
|---|--------|--------|
| 1 | IT: "Ciao chi sei?" | Risposta IT |
| 2 | IT: "Parlami di buzz" | Risposta IT |
| 3 | IT: "Parlami di final shot" | Risposta IT, no out-of-scope |
| 4 | IT: "E poi?" subito dopo | IT, mission control o follow-up coerente |
| 5 | EN: "What should I do next?" | Risposta EN |
| 6 | FR: "Que dois-je faire ?" | Risposta FR |
| 7 | FR: "Et après ?" | Risposta FR |
| 8 | IT: "Dove si trova il tesoro?" | Risposta IT, NON rivelare posizione |

Per ogni test: (A) lingua della risposta = lingua richiesta; (B) meta.request_id e meta.fallback_reason (se presente) in log/network.

---

## Deploy

```bash
npx supabase functions deploy norah-chat-v2
```

Se il client è stato modificato:

```bash
npm run build && npx cap sync ios
```

---

**FINE REPORT**
