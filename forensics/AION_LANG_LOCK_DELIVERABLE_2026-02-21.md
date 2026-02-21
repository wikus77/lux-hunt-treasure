# AION Lang Lock + Risposte corrette — Deliverable

**Data:** 2026-02-21  
**Branch:** fix/aion-lang-lock-safe  
**Tag rollback:** safety/aion-lang-lock-before-20260221_041127

---

## 1) Report forense (root cause)

- **Causa certa:** Per messaggi come "Parlami di final shot", `detectLang` ritorna **null** (nessun match in IT_WORDS/EN_WORDS). Il client impostava `lastUserLangRef = appLang`; con app in inglese inviava `reply_lang: 'en'` e l’edge restituiva fallback in inglese ("my knowledge is limited...", "Status: you are on mission...").
- **Fix client:** Aggiornare `lastUserLangRef` **solo** quando `detectLang !== null`. Se null, lasciare invariato il valore precedente (default 'it') così non si passa a appLang (EN).
- **Fix edge:** (1) `normalizeText`: "final shoot" → "final shot"; (2) `isInScope`: keyword "final", "shot"; (3) `langInstruction`: stringhe forti "RISPOSTA SOLO IN ITALIANO." / "REPLY ONLY IN ENGLISH." / "RÉPONDS UNIQUEMENT EN FRANÇAIS."; (4) dopo risposta Gemini: se la reply “sembra” in lingua diversa da `replyLang` (euristica EN/IT/FR), sostituire con `MISSION_CONTROL[replyLang]`.

Vedi `forensics/AION_LANG_LOCK_FORENSICS_2026-02-21.md` per tabella campi, stringhe fallback EN e scenario riproducibile.

---

## 2) Patch applicata (solo 2 file)

### Client: `src/pages/intel/IntelChatPanel.tsx`

- **Modifica:** Rimosso `else lastUserLangRef.current = appLang`. Ora `lastUserLangRef` viene aggiornato **solo** se `detectLang(messageText)` non è null. `reply_lang` resta `lastUserLangRef.current` (sempre inviato).

### Edge: `supabase/functions/norah-chat-v2/index.ts`

- **normalizeText:** Aggiunto `.replace(/\bfinal\s+shoot\b/gi, 'final shot')` per typo "final shoot".
- **isInScope (keywords):** Aggiunte "final" e "shot" (oltre a "final shot") per robustezza.
- **langInstruction:** Sostituito con "RISPOSTA SOLO IN ITALIANO." / "REPLY ONLY IN ENGLISH." / "RÉPONDS UNIQUEMENT EN FRANÇAIS."
- **Nuove funzioni:** `looksLikeEnglish`, `looksLikeItalian`, `looksLikeFrench` (euristica conservativa).
- **Dopo risposta Gemini:** Se `reply` è piena ma in lingua “sbagliata” rispetto a `replyLang`, si usa `reply = MISSION_CONTROL[replyLang]` e `provider = 'fallback'`.
- **meta:** Invariato (già presenti `request_id`, `fallback_reason` quando applicabile; nessuna modifica UI).

---

## 3) Comandi deploy e rollback

### Deploy edge

```bash
npx supabase functions deploy norah-chat-v2
```

### Build + sync iOS (se il client è stato modificato)

```bash
npm run build && npx cap sync ios
```

### Rollback (one-liner)

```bash
git checkout safety/aion-lang-lock-before-20260221_041127 -- supabase/functions/norah-chat-v2/index.ts src/pages/intel/IntelChatPanel.tsx && npx supabase functions deploy norah-chat-v2
```

(Opzionale: poi `npm run build && npx cap sync ios` se vuoi riallineare il client al rollback.)

---

## 4) Checklist non-regressione

- [ ] **check_aion_access** e consumo M1U invariati (nessuna modifica RPC/auth).
- [ ] Formato risposta invariato: `{ reply, ssml, visemes, access?, meta }` (meta può includere request_id, fallback_reason; client non legge meta per UI).
- [ ] IT: "Ciao chi sei?" → risposta in IT.
- [ ] IT: "Parlami di buzz" → risposta in IT.
- [ ] IT: "Parlami di final shot" → risposta in IT (no out-of-scope; no "my knowledge is limited").
- [ ] IT: "E poi?" → risposta in IT (no out-of-scope; mission-control o coerente).
- [ ] EN: "What should I do next?" → risposta in EN.
- [ ] FR: "Que dois-je faire ?" → risposta in FR.
- [ ] IT: "Dove si trova il tesoro?" → risposta in IT, nessuna posizione rivelata.
- [ ] Nessuna risposta in lingua mista o diversa dalla richiesta.
- [ ] Smoke: Home / Map / Buzz / IAP (solo navigazione) senza regressioni.

---

## 5) Test plan (ordine consigliato)

1. IT: "Ciao chi sei?" → IT  
2. IT: "Parlami di buzz" → IT  
3. IT: "Parlami di final shot" → IT (no out-of-scope)  
4. IT: "E poi?" → IT  
5. EN: "What should I do next?" → EN  
6. FR: "Que dois-je faire ?" → FR  
7. IT: "Dove si trova il tesoro?" → IT, safe (no posizione)

Verificare che nessuna risposta contenga lingua diversa dalla richiesta.

---

**FINE DELIVERABLE**
