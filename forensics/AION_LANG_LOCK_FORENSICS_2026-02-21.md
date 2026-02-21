# AION Lingua errata + risposte sbagliate — Forensics (root cause)

**Data:** 2026-02-21 | **Branch:** fix/aion-lang-lock-safe | **Tag:** safety/aion-lang-lock-before-20260221_041127

---

## 1) Campo → origine → valore atteso → valore attuale

| Campo | Origine | Valore atteso | Valore attuale (bug) |
|-------|--------|----------------|----------------------|
| `lang` | detectLang(text) ?? lastUserLangRef ?? appLang | lingua messaggio utente | OK se detectLang non null |
| `reply_lang` | lastUserLangRef.current | lingua risposta (lock sessione) | Quando detectLang è null viene impostato lastUserLangRef = appLang → se app è EN si invia reply_lang: 'en' anche per messaggi in italiano |
| `lastUserLangRef` | Aggiornato prima di ogni invoke | Solo quando detection sicura | Oggi: se detectLang null → sovrascritto con appLang → primo messaggio IT con parole non in IT_WORDS (es. "Parlami di final shot") dà null → app EN → risposta in EN |
| `i18n.language` | react-i18next (UI app) | it/en/fr | Usato come appLang quando detectLang è null; su device EN diventa fonte di reply_lang errata |

**Causa certa:** Per frasi come "Parlami di final shot" detectLang ritorna **null** (né IT_WORDS né EN_WORDS contengono "parlami"/"di"/"final" in modo da dare score chiaro). Il client allora fa `lastUserLangRef.current = appLang`; se l’app è in inglese invia `reply_lang: 'en'`. L’edge usa replyLang per tutti i fallback e per langInstruction → risposta in inglese ("my knowledge is limited...", "Status: you are on mission...").

---

## 2) Stringhe fallback che possono uscire in EN (dove sono definite)

Tutte in `supabase/functions/norah-chat-v2/index.ts`:

- **outOfScope.en:** "Agent, my knowledge is limited to M1SSION. Ask me about BUZZ..."
- **missionControl.en:** "Status: you are on mission. Next step? (1) Do a BUZZ..."
- **whoAreYou.en**, **hello.en**, **treasureWhere.en**, **buzz.en**, **buzzMap.en**, **m1u.en**, **finalShot.en**, **pulse.en**, **help.en**, **generic.en**

Esse escono quando `replyLang === 'en'`. Quindi il bug è **replyLang = 'en'** pur scrivendo in italiano, per il motivo al punto 1.

---

## 3) Dove viene costruito langInstruction e come si concatena

- **File:** `norah-chat-v2/index.ts` ~507–511.
- **Calcolo:** `replyLang = (reply_lang || lang) === 'en' ? 'en' : (reply_lang || lang) === 'fr' ? 'fr' : 'it'` (subito dopo parse body).
- **Concatenazione:** `systemPrompt = AION_SYSTEM_PROMPT + langInstruction`; systemInstruction unico per Gemini.
- **Testi attuali:** "Reply ONLY in English." / "Rispondi SOLO in italiano." / "Réponds UNIQUEMENT en français."
- Il system prompt base termina con "RISPONDI SEMPRE IN ITALIANO."; per EN/FR l’append è corretto, ma se il client manda reply_lang sbagliato l’edge usa comunque quella lingua.

---

## 4) Scenario riproducibile lingua errata

1. App con i18n in inglese (o device locale EN).
2. Utente apre Intelligence e scrive: **"Parlami di final shot"** (italiano).
3. detectLang("Parlami di final shot") → **null** (nessun match in IT_WORDS/EN_WORDS/FR_WORDS per "parlami"/"di").
4. Client: `lastUserLangRef.current = appLang` → **'en'**; invio `reply_lang: 'en'`.
5. Edge: replyLang = 'en' → fallback e langInstruction in inglese.
6. Se inScope e Gemini risponde → langInstruction chiede English; se fallback (es. empty) → getFallbackReply(..., 'en') → "my knowledge is limited..." o "Status: you are on mission..." in EN.

**Perché "Parlami di final shot" può andare in fallback:** isInScope usa normalizedText; abbiamo "final shot" in keywords quindi inScope è true. Se però Gemini non viene chiamato (no key) o ritorna vuoto, si usa getFallbackReply con replyLang già sbagliato. In più normalizeText non mappa "final shoot" → "final shot", quindi eventuale typo "final shoot" non matcha "final shot" e può risultare out-of-scope.

---

## 5) Root cause (sintesi)

1. **Client:** Quando `detectLang` è null si imposta `lastUserLangRef = appLang` e si invia `reply_lang: appLang`. Su app EN ciò forza risposta in inglese anche per messaggi in italiano.
2. **Edge:** replyLang è la sola fonte per lingua; tutti i fallback sono localizzati. Nessun controllo sulla lingua della reply di Gemini (può restituire EN anche con istruzione IT).
3. **Robustezza final shot:** Manca normalizzazione "final shoot" → "final shot"; keyword "final" da sola non è in lista (solo "final shot") → possibili falsi out-of-scope.

**FINE REPORT FORENSICS**
