# AION “NPC PREMIUM” AUDIT — Report (READ-ONLY)

**Data:** 2026-02-20  
**Scope:** UI/Client AION + Edge Function norah-chat-v2. Nessuna modifica applicata.  
**Prodotto:** M1SSION™ (iOS WKWebView / Capacitor). LLM: Gemini 1.5 Flash (Supabase Edge).

---

## EXECUTIVE SUMMARY

- **Pipeline attuale:** UI (`IntelChatPanel`) → `supabase.functions.invoke('norah-chat-v2')` → Edge (auth, `check_aion_access`, `isInScope`, Gemini o fallback) → reply/SSML/visemes → UI. Nessun RAG né ai-gateway nella chat Intelligence.
- **Perché AION sembra limitato:** (1) **isInScope** è solo keyword-based: una domanda pertinente senza parole chiave va in fallback e non chiama Gemini. (2) **Fallback** è a template fissi (out-of-scope, hello, buzz, …); nessuna “intelligenza di gioco”. (3) **System prompt** non chiede next action, mission control né domande chiarificatrici. (4) **Memory** = ultimi 6 messaggi in Edge, 10 in client; nessuna session memory persistente. (5) **maxOutputTokens: 256** espone a risposte troncate. (6) **Multilingua** dipende da `detectLang` + `lastUserLangRef`; possibile lingua sbagliata se detection incerta.
- **Cosa manca per “NPC premium”:** persona stabile e istruzioni operative nel prompt, memory/session policy, language-lock robusto, telemetria (request id, motivo inScope/fallback), riduzione fallback loop, opzionalmente RAG/KB per contesto dinamico.
- **Roadmap proposta:** 3 livelli (MIN: prompt + isInScope + fallback; MID: memory, language-lock, telemetry; MAX: RAG/KB, guardrail) — vedi sezione dedicata.

---

## ARCHITECTURE MAP (OGGI)

```
[IntelligencePage.tsx]
  └── IntelChatPanel.tsx
        ├── detectLang(text) → lang
        ├── lastUserLangRef (session)
        ├── messages (React state), slice(-10) inviato
        └── supabase.functions.invoke('norah-chat-v2', {
              session_id, text, messages, system: 'AION_CLIENT',
              lang, reply_lang, is_retry, retry_attempt
            })
                    ↓
[supabase/functions/norah-chat-v2/index.ts]
  ├── Auth + check_aion_access RPC (M1U/free plan)
  ├── normalizeText(text)
  ├── isInScope(normalizedText)  ← keyword list
  ├── if GEMINI_API_KEY && inScope:
  │     conversationHistory = messages.slice(-6)
  │     systemPrompt = AION_SYSTEM_PROMPT + langInstruction
  │     Gemini 1.5 Flash (maxOutputTokens: 256)
  │     reply = candidate.text
  ├── if !reply: reply = getFallbackReply(..., inScope, replyLang)
  └── return { reply, ssml, visemes, meta: { provider, in_scope } }
```

**Filtri rilevanti:**  
- **isInScope:** solo se almeno una keyword è presente nel testo normalizzato.  
- **Fallback:** usato quando `!inScope` oppure Gemini non chiamato o risposta vuota.  
- **Trim history:** client 10, edge 6.  
- **Token:** maxOutputTokens 256, temperature 0.7.

**File analizzati:**  
- `src/pages/IntelligencePage.tsx` — layout, AionEntity, IntelChatPanel.  
- `src/pages/intel/IntelChatPanel.tsx` — sendMessage, detectLang, lastUserLangRef, invoke norah-chat-v2.  
- `src/pages/intel/detectLang.ts` — detectLang (IT/EN/FR euristiche).  
- `supabase/functions/norah-chat-v2/index.ts` — AION_SYSTEM_PROMPT, isInScope, getFallbackReply, Gemini, fallback.

---

## LIMITI PRINCIPALI (CON PROVE)

### 1) isInScope troppo restrittivo

- **Dove:** `norah-chat-v2/index.ts` ~243–254.  
- **Logica:** `keywords.some(kw => lower.includes(kw))` con lista fissa (mission, buzz, indizio, mappa, tesoro, agent, m1u, final shot, intelligence, aion, aiuto, come, cosa, quando, dove, perché, chi, …).  
- **Prova:** Domande tipo “Quanto costa il secondo BUZZ?” contengono “buzz” → inScope. “Quanto costa il secondo indizio?” contiene “indizio” → inScope. “Dammi un consiglio” non contiene keyword → **non** inScope → solo fallback, Gemini mai chiamato.  
- **Impatto:** Qualsiasi domanda pertinente ma formulata con parole diverse viene bloccata e riceve solo il template out-of-scope o generic.

### 2) Fallback: quando scatta e ripetitività

- **Dove:** ~504–508: `if (!reply || reply.trim() === '')` → `getFallbackReply(normalizedText.toLowerCase(), inScope, replyLang)`.  
- **Quando:** (a) `!inScope`, (b) Gemini non chiamato (no key), (c) Gemini risposta vuota, (d) eccezione Gemini.  
- **Prova:** getFallbackReply (~170–240): outOfScope, whoAreYou, hello, treasureWhere, buzz, buzzMap, m1u, finalShot, pulse, help — poi `generic[replyLang]` random tra 2 frasi.  
- **Impatto:** Niente “next action” né domande chiarificatrici; utente che insiste su domande fuori keyword vede sempre lo stesso tipo di messaggio (out-of-scope o generic). Loop di fallback non infinito ma esperienza ripetitiva.

### 3) System prompt: cosa c’è e cosa manca

- **Dove:** ~12–134 AION_SYSTEM_PROMPT + ~451–456 langInstruction.  
- **Contenuto:** Identità AION, regola “mai rivelare posizioni”, conoscenza M1SSION (BUZZ, M1U, Final Shot, Pulse, Battle, ecc.), stile “max 100 parole”, “RISPONDI SEMPRE IN ITALIANO” (poi sovrascritto da langInstruction per EN/FR).  
- **Mancante:** Istruzioni esplicite per “next action”, “mission control”, “fai una domanda chiarificatrice quando serve”, “riassumi stato e propone prossimo passo”.  
- **Prova:** Il prompt non contiene le stringhe “next action”, “prossimo passo”, “chiarificatrici”, “mission control”.

### 4) Memory e trimming

- **Client:** `messages.filter(...).slice(-10)` inviato (~221).  
- **Edge:** `messages.slice(-6)` per conversationHistory (~444).  
- **Prova:** Solo ultimi 6 scambi passano a Gemini; nessun persist su DB/session; nessuna “memory breve coerente” oltre la finestra corrente.

### 5) Token budget e truncation

- **Dove:** generationConfig maxOutputTokens: 256 (~473).  
- **Prova:** Risposte lunghe (es. spiegazione BUZZ + mappa + M1U) possono essere troncate da Gemini.

### 6) Multilingua: dove può rompersi

- **Client:** detectLang(text) in `IntelChatPanel` (~208–211); se `detected == null` si usa `lastUserLangRef.current` o `i18n.language`.  
- **Edge:** replyLang da `reply_lang || lang`, default it (~264–265). getFallbackReply(replyLang) e langInstruction per Gemini.  
- **Rischio:** detectLang è euristico (parole/caratteri IT/EN/FR); testi brevi o misti possono dare null → si usa lastUserLang che può non riflettere la lingua del messaggio corrente.  
- **Prova:** `detectLang.ts`: ritorna null se `max < 1` o lunghezza < 3; possibili falsi positivi/negativi su frasi corte.

### 7) Reliability / observability

- **Presente:** console.log inScope, provider, session_id, retry_attempt; inserimento `ai_events` per AION_RETRY_ATTEMPT.  
- **Mancante:** request_id univoco, motivo esplicito “inScope false per assenza keyword X”, “fallback per empty reply”, “fallback per eccezione”. Nessun campo “fallback_reason” in risposta.  
- **Loop:** Nessun circuito esplicito anti-loop; se Gemini restituisce spesso vuoto si va sempre in fallback senza escalation.

---

## NPC PREMIUM GAP ANALYSIS (A→E)

| Criterio | Stato | Gap |
|----------|--------|-----|
| **A) Persona stabile** | Parziale | Prompt definisce tono/identità; memory solo finestra 6; fallback a template fissi → risposte generiche ripetitive quando inScope=false o reply vuota. |
| **B) Intelligenza “di gioco”** | Mancante | Nessuna istruzione “next action”, “mission control”, “domande chiarificatrici”; risposte solo esplicative, non operative step-by-step. |
| **C) Multilingua premium** | Parziale | IT/EN/FR con detectLang + reply_lang + langInstruction; rischio su detection incerta e language-lock solo lastUserLangRef (no lock esplicito sessione). |
| **D) Reliability/Observability** | Parziale | Log e retry event; mancano request_id, inScope reason, fallback_reason, protezione esplicita da fallback loop. |
| **E) RAG / KB dinamica** | Non usata | norah-chat-v2 non usa RAG. Esistono norah-chat (RAG), norah-rag-search, populate-knowledge-base, ai-gateway con RAG — nessuno invocato da Intelligence. |

---

## ROADMAP 3 LIVELLI (CONCETTUALE, NO PATCH)

### LIVELLO 1 — MIN (solo edge, no RAG)

- **Cosa:** (1) Allargare/ristrutturare isInScope (es. intent/embedding o keyword più ricche + whitelist domande operative). (2) Migliorare fallback: meno “out of scope” generico, più redirect (“Chiedimi del BUZZ, della mappa…”) e una sola risposta “mission control” tipo “Cosa vuoi fare ora?”. (3) Prompt: aggiungere 2–3 frasi su “suggerisci prossimo passo” e “se non è chiaro, fai una domanda breve”. (4) Aumentare maxOutputTokens (es. 384) per ridurre troncamento.  
- **Dove:** `supabase/functions/norah-chat-v2/index.ts` (isInScope, getFallbackReply, AION_SYSTEM_PROMPT, generationConfig).  
- **Rischio regressione:** Basso (solo edge, stessi endpoint).  
- **Effort:** Basso–medio.  
- **Successo:** Meno domande valide bloccate; almeno 1 test “dammi un consiglio” ottiene risposta Gemini; risposte non troncate a 1–2 frasi quando servono 3–4.

### LIVELLO 2 — MID (memory, language, telemetry)

- **Cosa:** (1) Session memory: persistenza ultimi N scambi (es. tabella o cache keyed by session_id) e invio contesto coerente a Gemini. (2) Language-lock: salvare last_lang per session_id e usarlo come reply_lang finché l’utente non manda un messaggio chiaramente in altra lingua (detectLang). (3) Telemetria: request_id, in_scope_reason (es. “keyword_match” / “out_of_scope”), fallback_reason ( “empty” | “exception” | “skip_gemini” ), log strutturato. (4) Anti-loop: dopo N fallback consecutivi, messaggio in-universe tipo “Il canale è instabile, riprova tra poco” senza riprovare Gemini in loop.  
- **Dove:** Edge (norah-chat-v2), eventuale tabella/cache; client solo se si passa request_id o language-lock lato client.  
- **Rischio regressione:** Medio (nuovi campi, logica session).  
- **Effort:** Medio.  
- **Successo:** Stessa sessione mantiene lingua; log con request_id e fallback_reason; nessun loop infinito di fallback.

### LIVELLO 3 — MAX (RAG/KB, guardrail)

- **Cosa:** (1) Integrare RAG/KB: chiamata a norah-rag-search (o equivalente) con ultimo messaggio utente, iniezione chunk in system/user prompt prima di Gemini. (2) Guardrail: post-processing risposta (lunghezza, blocco uscite fuori tema). (3) Opzionale: tool-calling per “next action” (es. “Apri BUZZ” come azione) se compatibile con stack.  
- **Dove:** norah-chat-v2 (chiamata RAG, costruzione prompt), eventuale norah-rag-search; client solo se si espone “azione suggerita”.  
- **Rischio regressione:** Alto (nuove dipendenze, latenza RAG).  
- **Effort:** Alto.  
- **Successo:** Risposte che citano documenti aggiornati; nessuna risposta fuori tema; (se implementato) suggerimento azione chiaro.

---

## TEST PLAN (IT/EN/FR + DOMANDE OPERATIVE)

- **Lingua:** Per ogni lingua (IT, EN, FR): (1) “Come funziona il BUZZ?” (inScope). (2) “Dove si trova il tesoro?” (treasureWhere fallback). (3) “Dammi un consiglio” (attualmente out-of-scope; dopo L1 dovrebbe poter andare a Gemini). (4) Due messaggi in sequenza: primo in IT, secondo in EN — verificare che reply_lang segua l’ultimo messaggio o language-lock (L2).  
- **Operative:** “Qual è il prossimo passo?” / “Cosa devo fare ora?” — oggi risposta generica; dopo L1 verificare suggerimento concreto (BUZZ, mappa, Final Shot).  
- **Fallback:** Invio ripetuto di domanda fuori scope — verificare che non si abbia loop infinito e che dopo N risposte compaia messaggio di “canale instabile” (L2).  
- **RAG (L3):** Domanda su regola/FAQ presente solo in KB — verificare che la risposta citi o rifletta il contenuto del doc.

---

## RISCHI & NON-REGRESSION CHECKLIST

- **Rischi:** (1) Allargare isInScope può far rispondere a domande off-topic se non bilanciato. (2) Aumentare maxOutputTokens aumenta costo/latency. (3) RAG aggiunge latenza e dipendenze da embedding/DB. (4) Language-lock può “bloccare” lingua se detectLang sbaglia.  
- **Non-regression:** (1) check_aion_access e M1U/free plan invariati. (2) Non rivelare posizioni (regola sacra) resta nel prompt. (3) Formato risposta (reply, ssml, visemes) invariato per il client. (4) Test IT/EN/FR e “dove si trova il tesoro” devono restare coerenti con comportamento atteso (fallback o risposta sicura).

---

## RAG/KB — STATO ATTUALE (E IMPATTO STIMATO)

- **Esistente:** `norah-chat` (RAG su Product Bible), `norah-rag-search`, `populate-knowledge-base`, `ai-gateway` con RAG e `retrieve_docs`; `src/intel/norah/kb/localCache.ts` (fallback quando RAG 0 risultati).  
- **Intelligence (AION):** usa solo `norah-chat-v2`; nessuna chiamata a RAG né ad ai-gateway.  
- **Perché non usato in Intelligence:** norah-chat-v2 è stato implementato come flusso semplificato (M1U + Gemini + fallback) senza integrazione con il pipeline RAG esistente.  
- **Impatto per contesto dinamico:** integrare norah-rag-search in norah-chat-v2 permetterebbe risposte aggiornate da KB/FAQ; richiede gestione embedding, soglie match e dimensioni prompt; effort alto, beneficio alto per domande su regole/aggiornamenti.

---

**FINE REPORT — READ-ONLY. NESSUNA MODIFICA APPLICATA.**
