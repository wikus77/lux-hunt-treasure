# AION Risposte “troppo minimali” — Oracle Quality Deliverable

**Data:** 2026-02-21  
**Tag rollback:** `safety/aion-oracle-quality-before-20260221_044342`  
**Branch:** fix/aion-oracle-quality

---

## 1) Report breve (cause + patch + rischio)

**Cause confermate (con riferimenti):**
- **Prompt restrittivo:** `norah-chat-v2/index.ts` ~117: "Max 100 parole per risposta"; ~136 "Max 110 parole" → spinge output corti. Nessun formato obbligatorio (RISPOSTA / COME SI FA / PROSSIMO PASSO).
- **generationConfig:** ~561-563: `temperature: 0.7`, `maxOutputTokens: 384` → variabilità alta e tetto basso per risposte strutturate.
- **Fallback sempre “minimal”:** Su `empty_reply`, `http_error`, `wrong_language` si usava MISSION_CONTROL o getFallbackReply (template 1–2 frasi) → esperienza “il minimo indispensabile”.

**Patch applicate (solo edge):**
- A) AION_SYSTEM_PROMPT: rimossa “Max 100 parole”; aggiunta sezione "FORMATO RISPOSTA ORACOLO" (formato obbligatorio 3 blocchi, min 6–10 righe max ~140 parole, follow-up continua dal topic, evita ripetizioni, lingua replyLang). Regola 4 per "E poi?" / follow-up.
- B) generationConfig: `temperature: 0.5`, `maxOutputTokens: 512`.
- C) Fallback oracolo: introdotti ORACLE_FALLBACKS (buzz, buzzMap, m1u, finalShot, followUp, premi) e getOracleFallback(); su empty_reply / http_error / wrong_language si usa prima getOracleFallback (per intent/keyword/follow-up), altrimenti getFallbackReply/MISSION_CONTROL. treasureWhere invariato (no posizioni).

**Rischio regressione:** Basso. Solo edge; formato risposta `{ reply, ssml, visemes, meta }` invariato; check_aion_access e M1U non toccati. Possibile risposta più lunga in TTS (stesso SSML).

---

## 2) File modificati

- **Solo:** `supabase/functions/norah-chat-v2/index.ts`  
- **Client:** non modificato (nessun last_topic; contesto da conversationHistory + prompt).

---

## 3) Deploy

```bash
npx supabase functions deploy norah-chat-v2
```

Se in futuro si modificasse il client: `npm run build && npx cap sync ios` (non richiesto per questa patch).

---

## 4) Rollback one-liner

```bash
git checkout safety/aion-oracle-quality-before-20260221_044342 -- supabase/functions/norah-chat-v2/index.ts && npx supabase functions deploy norah-chat-v2
```

---

## 5) Test plan (iOS / device reale)

Eseguire in ordine e annotare reply + meta (request_id, fallback_reason):

| # | Input | Atteso |
|---|--------|--------|
| 1 | IT: "Parlami di buzz" | Formato strutturato (spiegazione + come si fa + prossimo passo), non 2 frasi |
| 2 | IT: "E poi?" | Continua su BUZZ (costi, quando usarlo, cosa fare dopo), non reset generico |
| 3 | IT: "Parlami di final shot" | Spiegazione concreta + come si fa + next step |
| 4 | IT: "E poi?" | Continua su Final Shot (tentativi, preparazione), non reset |
| 5 | IT: "Vinci qualcosa in M1SSION?" | Risposta concreta: premi/obiettivi/come vincere |
| 6 | EN: "What should I do next?" | Stesso formato in EN |
| 7 | FR: "Que dois-je faire ?" | Stesso formato in FR |
| 8 | IT: "Dove si trova il tesoro?" | Safe, nessuna posizione |

**Fail immediati:** lingua sbagliata o mista; risposta &lt; 4 righe su "Parlami di …"; mission-control identico ripetuto su follow-up; leak posizione tesoro.

---

**FINE DELIVERABLE**
