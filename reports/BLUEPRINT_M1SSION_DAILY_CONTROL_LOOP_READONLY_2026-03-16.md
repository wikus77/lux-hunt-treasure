# Blueprint read-only — M1SSION DAILY CONTROL LOOP™

**Data:** 2026-03-16  
**Tipo:** 100% read-only — definizione architetturale, nessuna modifica al codice  
**Scope:** App nativa wrappata iOS (Capacitor WKWebView)  
**Obiettivo:** Progetto architetturale completo del sistema di retention unificato M1SSION DAILY CONTROL LOOP™.

---

## 1. EXECUTIVE SUMMARY

Il **M1SSION DAILY CONTROL LOOP™** è il sistema di retention unificato che trasforma M1SSION da insieme di moduli forti ma frammentati in un’esperienza quotidiana orchestrata: **entri → fai le 3 azioni del giorno → completi la giornata → avanzi → torni domani**.

**Stato attuale (da audit):** Commit, Streak e Daily Mission V2 esistono e funzionano; non sono ordinati né presentati come un unico “daily”. Manca uno stato unificato “today_daily” e una gerarchia UX chiara.

**Obiettivo del blueprint:** Definire (senza implementare) il loop ideale, i moduli da riusare, i moduli mancanti minimi, lo stato unificato, la gerarchia UX, la logica reward, il legame economia, la return pressure, la progressione settimanale, e la strategia di ricucitura.

**Principi:** Riusare il massimo possibile (Commit, Streak, Daily Engine V2, M1U, PE, Next Action); aggiungere solo “colla” (checklist, stato unificato, reminder, copy); non rifare BUZZ, BUZZ MAP, DB, Edge, login, IAP.

---

## 2. DAILY CONTROL LOOP IDEALE

### A. Loop minimo giornaliero ideale

1. **Daily Hook** — Primo impatto all’apertura: messaggio chiaro (“Le 3 azioni di oggi” o “Completa la giornata”) e/o indicatore 0/3, 1/3, 2/3, 3/3.
2. **Commit** — Prima azione core: rituale 7s, +5 M1U, “ho fatto il mio impegno”. Una volta al giorno.
3. **Streak** — Seconda azione core: check-in, PE + M1U + milestone. Una volta al giorno.
4. **Daily Mission** — Terza azione core (o “consigliata”): missione del giorno (Daily Engine V2), reward. Una volta al giorno (con phase2 “torna domani”).
5. **Daily Completion Reward** — Se 3/3 (o 2/3 secondo variante): bonus (M1U o PE o entrambi), messaggio “Giornata completata”.
6. **Next Objective** — Cosa fare dopo: usare M1U in BUZZ, avanzare missione principale, Shop, ecc. (Next Action / Norah).
7. **Return Tomorrow** — Pressione soft: streak da non perdere, Commit e Mission disponibili domani, eventuale countdown a mezzanotte UTC.

**Ordine consigliato:** Hook → Commit → Streak → Daily Mission → (Daily Completion) → Next Objective → Return Tomorrow.

### B. Loop espanso — Collegamento con gli altri sistemi

| Sistema | Ruolo nel loop |
|--------|-----------------|
| **BUZZ** | Uso delle M1U guadagnate (Commit, Streak, Mission) per acquistare indizi; progressione missione principale. Non è un “step daily” ma l’uso naturale delle risorse dopo le 3 azioni. |
| **BUZZ MAP** | Come BUZZ: uso M1U, avanzamento. Opzionale nel daily. |
| **M1U** | Valuta unificata: si guadagna con Commit (+5), Streak (+2 + milestone), Mission (reward); si spende in BUZZ, BUZZ MAP, Shop, Battle. Il filo è “fai le 3 → guadagni M1U → usi M1U per avanzare”. |
| **PE** | Progressione e rank: si guadagna con Streak (DAILY_LOGIN), Mission, BUZZ, Battle, ecc. Feedback visivo (PulseBarPersonal, AgentEnergyPill). Non è “step daily” ma conseguenza. |
| **Rank** | Avanzamento a lungo termine legato a PE; visibile come “stato agente”. |
| **Shop** | Dove spendere M1U (e/o denaro); non parte del “3/3” ma parte dell’economy loop. |
| **Cashback** | Reward da claim; collegato a BUZZ/BUZZ MAP; non core daily. |
| **Profile** | Dove si vedono streak, rank, M1U; non un’azione daily. |
| **Panel / Next Action** | Contenitore ideale per “Prossima azione” dopo il daily: Daily Mission V2, suggerimenti Norah, Vera Bomb se attivo. Deve esporre anche “stato daily” (3/3) e CTA per Commit/Streak se non ancora fatti. |
| **Notifiche** | Supporto al ritorno: reminder Streak (esistente), reminder Commit, reminder Mission; “Non perdere la tua giornata” se 0/3 o 1/3 a fine giornata. |

### C. Loop settimanale

- **Streak giornaliera:** già presente (profiles.current_streak_days); rimane il “conteggio giorni consecutivi” e i milestone M1U (5, 10, 15, 25, 30, 50, 100 giorni).
- **Missioni weekly:** Daily Engine V2 ha già `retention.weekly_completion` e `retention.week_start`; si può esporre “Hai completato X/7 missioni questa settimana”.
- **Reward domenicale:** Daily Engine V2 ha già `sunday_reward_available`, `sunday_reward_day_key`, `SundaySuperRewardModal`; rimane il bonus domenica per chi ha completato la settimana.
- **Bonus 7/7 o 21/21:** Estensione opzionale: “Hai completato 7 giorni su 7 (Commit+Streak+Mission)” → bonus settimanale (M1U/PE/chest). Richiederebbe un contatore “daily full completion” settimanale (nuovo modulo o estensione retention).
- **Collegamento:** Lo “today_daily” (3/3) diventa input per “weekly_completion”: ogni giorno in cui l’utente fa 3/3 conta come 1 verso 7/7; la domenica si può dare reward extra se 7/7.

---

## 3. MODULI ESISTENTI DA RIUSARE

| Modulo target | File / sistema esistente | Riutilizzabile? | Limiti |
|---------------|---------------------------|-----------------|--------|
| **Daily Hook** | Nessun modulo dedicato; Home (AppHome, PrizeVision, pills). | Parziale | Serve solo copy/ordine e eventuale banner “3 azioni di oggi”; nessun nuovo componente obbligatorio. |
| **Commit** | `CommitModal.tsx`, `CommitRitual.tsx`, `CommitFlipOverlay.tsx`, `CommitNodesContainer.tsx`, `CommitNodeTrigger.tsx`. RPC `check_commit_ritual_status`, `apply_commit_ritual`, `mpe_record_daily_commit`. | ✅ Sì | Non toccare logica; solo “leggere” stato (already_done_today) per checklist. |
| **Streak** | `StreakPill.tsx`, `StreakModal.tsx`, `StreakWidget.tsx`, `DailyCheckInButton.tsx`. Profiles: `current_streak_days`, `last_check_in_date`. PE + M1U + milestone. | ✅ Sì | Non toccare; leggere `last_check_in_date === today` per checklist. |
| **Daily Mission** | `useDailyEngineV2`, `DailyEngineV2Card`, Edge `daily-mission-today`, `daily_mission_runs`, `retention`. Modali Cipher/WordDuel/SignalPattern, Sunday reward. | ✅ Sì | Già server-driven; leggere `run.status === 'completed'` e `run.phase === 3` per checklist. Portare la card in evidenza (stesso componente, posizione diversa). |
| **Daily Completion state** | Non esiste. | ❌ No | Da aggiungere (vedi Moduli mancanti). |
| **Reward bonus giornaliera (3/3)** | Nessun reward “3/3” oggi. M1U/PE si assegnano già per singola azione (Commit, Streak, Mission). | Parziale | Logica reward singoli riutilizzabile; serve una RPC o logica client “claim bonus 3/3” (modulo mancante). |
| **PE / Rank feedback** | `useAwardPE`, `PulseBarPersonal`, `AgentEnergyPill`, `award_xp`, `award_pulse_energy`. | ✅ Sì | Solo esporre meglio; eventuale award aggiuntivo per 3/3. |
| **Economy loop M1U** | `M1UPill`, `useM1UnitsRealtime`, `m1u-balance-update`, crediti da Commit/Streak/Mission/Buzz/Shop. | ✅ Sì | Nessun cambio; solo narrativa/copy “guadagni qui, spendi lì”. |
| **Return tomorrow / reminder** | `useStreakReminder` (notifica 20:00 per streak). Push FCM/VAPID/Native presenti. | ✅ Parziale | Riusare pattern per “reminder Commit” e “reminder Mission”; estendere, non rifare. |
| **Weekly progression** | `retention.weekly_completion`, `retention.sunday_reward_available`, `SundaySuperRewardModal`, `consumeSundayReward`. | ✅ Sì | Già in Daily Engine V2; eventuale estensione per “7/7 daily completion”. |

---

## 4. MODULI MANCANTI MINIMI

| Modulo logico | Funzione | Perché necessario | Frontend/Backend | Impatto | Priorità |
|---------------|----------|-------------------|------------------|---------|----------|
| **Daily checklist unificata (UI)** | Mostrare 0/3, 1/3, 2/3, 3/3 e quali azioni sono fatte (Commit, Streak, Mission). | Senza checklist l’utente non percepisce “le 3 cose del giorno”. | Frontend | Alto: chiarezza daily. | **Critica** |
| **today_daily state (logico)** | Singolo stato derivato: commit_done, streak_done, mission_done, count 0–3. | Oggi i tre stati sono in posti diversi; serve una “vista unificata” per UI e reward. | Ibrido: lettura da RPC + profiles + Daily V2; opzionale una RPC “get_today_daily” che aggrega. | Alto: single source of truth per checklist e bonus. | **Critica** |
| **Reward 3/3 (bonus completamento)** | Dare M1U e/o PE extra quando l’utente ha completato tutte e tre le azioni. | Aumenta motivazione a completare la giornata. | Ibrido: frontend verifica 3/3, backend (RPC) accredita bonus una volta al giorno. | Alto: retention. | **Importante** |
| **Reminder Commit** | Notifica (locale o push) “Non dimenticare il Commit oggi” se non ancora fatto. | Return pressure; oggi c’è solo reminder Streak. | Frontend (stesso pattern di useStreakReminder) + eventuale cron push. | Medio. | **Importante** |
| **Reminder Mission** | Notifica “Missione del giorno in scadenza” se non completata. | Come sopra. | Come sopra. | Medio. | **Importante** |
| **Barra / indicatore completamento giornaliero** | Progress 0/3 → 3/3 visibile (barra o badge). | Feedback immediato. | Frontend | Alto: percezione. | **Importante** |
| **“Almost completed” messaging** | Messaggi tipo “Manca solo la Mission!” (2/3), “Quasi 3/3!”. | Near-miss psicologico; aumenta completamento. | Frontend (copy + logica da today_daily). | Medio. | Opzionale |
| **Daily pressure / loss aversion layer** | Copy e/o UI che comunicano “Se non fai le 3 oggi, perdi il bonus / la streak”. | Aumenta urgenza senza essere punitivi. | Frontend (copy, timing messaggi). | Medio. | Opzionale |
| **Weekly summary (7/7)** | Vista “Hai completato X/7 giorni questa settimana” e reward domenicale legato a 7/7. | Meta retention settimanale. | Ibrido: retention V2 già ha weekly; estendere per “daily full completion” count. | Medio. | Opzionale |

---

## 5. TODAY_DAILY STATE UNIFICATO

Stato logico (derivato o esposto da backend) che rappresenta il “completamento giornaliero” in un unico punto.

### Campi proposti

| Campo | Significato | Origine dati | Uso UX |
|-------|-------------|---------------|--------|
| **commit_done** | L’utente ha completato il Commit oggi. | RPC `check_commit_ritual_status` → `already_done_today` (o equivalente da log applicativo). | Checkmark “Commit fatto”; conteggio 1/3. |
| **streak_done** | L’utente ha fatto check-in streak oggi. | `profiles.last_check_in_date === today` (ISO date). | Checkmark “Streak fatto”; conteggio 2/3. |
| **daily_mission_done** | L’utente ha completato la missione del giorno (Daily Engine V2). | `daily_mission_runs` per oggi (day_key) + `run.status === 'completed'` e `run.phase === 3`. | Checkmark “Missione fatta”; conteggio 3/3. |
| **daily_completion_count** | 0, 1, 2 o 3. | `(commit_done ? 1 : 0) + (streak_done ? 1 : 0) + (daily_mission_done ? 1 : 0)`. | Barra 0/3 → 3/3; messaggio “3/3 Giornata completata!”. |
| **daily_bonus_claimed** | L’utente ha già riscattato il bonus 3/3 oggi. | Nuovo: backend deve memorizzare (es. tabella `daily_completion_claims` o flag in profiles con data). | Evitare doppio claim; disabilitare pulsante “Riscatta bonus”. |
| **available_rewards** | Cosa è disponibile (es. “Bonus 3/3: +10 M1U”). | Derivato: se count === 3 e !daily_bonus_claimed → disponibile. | CTA “Riscatta bonus”. |
| **return_pressure_state** | Stato per messaggi di urgenza: “mancano N azioni”, “scade a mezzanotte”. | Derivato da count + ora (UTC). | Copy “Manca solo 1 azione!”; reminder. |
| **weekly_progress** | Quanti giorni “full” questa settimana (opzionale). | Estensione retention: contare giorni con 3/3 nella settimana corrente. | “Hai completato 5/7 giorni”; reward domenica. |

### Single source of truth

- **Oggi:** Tre fonti separate (RPC commit, profiles streak, daily_mission_runs). Nessuna aggregazione.
- **Blueprint:** Una **vista unificata** (client-side: tre chiamate + derivazione; oppure una **RPC `get_today_daily`** che restituisce commit_done, streak_done, mission_done, count, bonus_claimed). La RPC riduce round-trip e garantisce coerenza; non è obbligatoria per la versione minima (si può derivare in frontend).

---

## 6. GERARCHIA UX CORRETTA

### Prima cosa che l’utente vede/sente

- **Ideale:** Un messaggio chiaro di “stato giornata”: “Le 3 azioni di oggi” con indicatore 0/3, 1/3, 2/3 o 3/3, e la prima azione da fare (es. “Inizia con il Commit” se commit_done === false).
- **Alternativa minima:** La Home attuale con in cima (sopra o sotto PrizeVision) un blocco “Daily: 0/3” o “Completa le 3 azioni” che guida alla prima azione.

### Prima azione che compie

- **Ideale:** Commit (rituale 7s, +5 M1U), perché è il gesto più “impegnativo” e distintivo; poi Streak (check-in rapido), poi Daily Mission.
- **Ordine suggerito:** Commit → Streak → Daily Mission. Opzionale: consentire Streak prima di Commit (entrambi sono “daily”); l’importante è che le tre siano chiaramente “le 3 del giorno”.

### Ordine di comparsa (gerarchia logica)

1. **Core actions del giorno:** Commit, Streak, Daily Mission (in quest’ordine o con Commit in evidenza).
2. **Reward / completamento:** Daily completion 3/3, bonus claim.
3. **Next objective:** BUZZ, avanzare missione, Shop (Next Action / Norah).
4. **Economy / avanzamento:** M1U pill, PE bar, Rank (sempre visibili ma non “azioni”).
5. **Secondary:** Shop pill, Cashback pill (accesso rapido).
6. **Advanced:** Panel, impostazioni, profilo (periferici).

### Classificazione azioni

- **Core (ogni giorno):** Commit, Streak, Daily Mission. Cosa l’utente “deve” fare per “completare la giornata”.
- **Secondary (dopo il core):** BUZZ, BUZZ MAP (usare M1U), esplorare missione principale.
- **Economy actions:** Shop, Cashback claim (spendere/riscuotere).
- **Advanced:** Battle, Pulse Breaker, Panel, altro (suggeriti solo in certi casi da Next Action / Norah).

---

## 7. LOGICA REWARD E LOSS AVERSION

### Struttura reward ideale

1. **Reward immediate (per singola azione):**  
   - Commit: +5 M1U (esistente).  
   - Streak: PE (con moltiplicatore) + 2 M1U + milestone (esistente).  
   - Daily Mission: reward mission (esistente).  
   Nessun cambio; restano i reward per step.

2. **Reward da completamento 3/3:**  
   Bonus extra una volta al giorno: es. +10 M1U, o +15 PE, o entrambi. Deve essere **claim esplicito** (pulsante “Riscatta bonus”) dopo aver fatto le 3, per dare momento di celebrazione e chiarezza.

3. **Reward settimanale:**  
   Già parzialmente presente (Sunday reward in Daily Engine V2). Estensione: “7/7 giorni completati” → bonus aggiuntivo domenica (opzionale).

4. **Bonus variabile / sorpresa:**  
   Opzionale: reward 3/3 può variare (es. 8–12 M1U random) per sensazione “sorpresa”. Non critico per la versione minima.

5. **Pressione se non completi:**  
   - **Loss aversion soft:** “Se non fai le 3 oggi, perdi il bonus 3/3” (non punire, ma far capire che c’è un premio per completare).  
   - **Streak:** già presente (“non perdere la streak”); rimane.  
   - **Messaggi serali:** “Hai fatto 2/3 — manca solo la Mission!” (almost completed).  
   Evitare toni punitivi; preferire “Hai ancora tempo” e “Completa per il bonus”.

### Scelte progettuali

- **Commit:** Resta reward da solo (+5 M1U) **e** conta come 1 dei 3 step. Non solo “step”: il reward proprio mantiene motivazione intrinseca.
- **Streak:** Resta autonoma (conseguenze reali: PE, M1U, milestone) **e** diventa parte del 3/3. Così si evita ridondanza e si rafforza “fare check-in = parte del daily”.
- **Daily Mission:** Nel blueprint ideale è **parte del 3/3** (obbligatoria per il bonus 3/3). Variante: “2 obbligatorie (Commit + Streak) + 1 consigliata (Mission)” per bonus 3/3; così chi non fa la Mission non è “punito”, ma chi fa tutte e 3 prende il bonus. **Raccomandazione:** 3/3 = Commit + Streak + Mission; bonus solo per 3/3.
- **Sistema misto:** 3 azioni chiare; bonus 3/3; opzionale bonus 2/3 (minore) per chi fa solo Commit + Streak. La versione minima può essere solo 3/3 con un unico bonus.
- **Loss aversion:** Messaggi chiari (“Completa le 3 per il bonus”), countdown a mezzanotte (opzionale), reminder; niente penalità o streak “daily” che si resetta (la streak è giorni consecutivi di check-in, non di 3/3).

### Reward giornaliera extra (3/3)

- **Raccomandazione:** M1U (es. +10) **e/o** PE (es. +15). Entrambi allineano con economy esistente.  
- Alternative: unlock BUZZ gratuito 1x, chest, cashback boost — possibili ma meno coerenti con il sistema attuale. Per la versione minima: **M1U** è la scelta più semplice e coerente.

---

## 8. LEGAME ECONOMIA / PROGRESSIONE

### Filo narrativo ideale

“Fai le 3 azioni del giorno (Commit, Streak, Mission) → guadagni M1U e PE → usi M1U per BUZZ e BUZZ MAP per avanzare nella missione principale → il PE fa salire il rank → torni domani per ripetere e non perdere streak e bonus 3/3.”

### Oggi

- **Dove esiste:** M1U si guadagna con Commit, Streak, Mission (e altri); si spende in BUZZ, Shop, Battle. PE si guadagna con Streak, Mission, BUZZ, Battle; rank sale con PE. I legami **tecnici** ci sono.
- **Dove si spezza:** La **narrativa** non è esplicita: l’utente non legge “fai le 3 → guadagni → spendi in BUZZ”. Manca la “spine” (checklist + copy) che rende evidente il ciclo.

### Blueprint ideale

- **Copy e micro-copy:** Sulla Home o nella checklist: “Completa le 3 azioni per guadagnare M1U e PE”, “Usa le tue M1U in BUZZ per nuovi indizi”, “Il tuo rank sale con i PE”.
- **Flusso guidato:** Dopo 3/3, Next Action può suggerire “Ora usa le tue M1U in BUZZ” (già parzialmente possibile con Norah/Next Best Action).
- **Nessun cambio di economia:** Stesse fonti e usi di M1U/PE; solo esposizione e ordine mentale (daily first → then spend).

---

## 9. RETURN PRESSURE / NOTIFICHE

### Cosa deve spingere a tornare domani

- **Streak:** Non perdere i giorni consecutivi (già presente).
- **Commit:** “Il tuo Commit giornaliero ti aspetta” (+5 M1U persi se non entri).
- **Daily Mission:** “Missione del giorno in scadenza a mezzanotte.”
- **Bonus 3/3:** “Completa le 3 oggi per il bonus” (se 0/3 o 1/3 o 2/3).

### Notifiche ideali

| Notifica | Quando | Contenuto tipo | Priorità |
|----------|--------|----------------|----------|
| Streak reminder | Già esistente (es. 20:00) se streak > 0 e non check-in oggi. | “Non perdere la tua streak! Fai check-in.” | Già presente |
| Commit reminder | Una volta al giorno (es. 18:00 o 20:00) se commit_done === false. | “Il tuo Commit giornaliero ti aspetta. +5 M1U.” | Nuovo |
| Mission reminder | Se mission non completata e ora tarda (es. 21:00). | “Missione del giorno in scadenza a mezzanotte.” | Nuovo |
| Daily incomplete | Opzionale: sera, se 1/3 o 2/3. | “Manca solo 1 azione per il bonus 3/3!” | Opzionale |

### Countdown

- **Mezzanotte UTC:** Daily Engine V2 già usa `day_key` e countdown a next UTC midnight; si può esporre “La missione scade tra Xh Ym”. Opzionale: countdown per “giornata” (locale o UTC) visibile sulla checklist.

### Reward che “scadono”

- **Commit:** “Disponibile oggi”; domani è un nuovo giorno (stesso comportamento attuale).
- **Streak:** Se non fai check-in oggi, la streak si resetta (già così).
- **Mission:** Nuova missione ogni giorno (già così).
- **Bonus 3/3:** Valido solo per il giorno corrente; non accumulabile (claim oggi per oggi).

### Cosa mostrare la sera se daily incompleto

- Se 0/3 o 1/3 o 2/3: messaggio tipo “Hai ancora tempo per completare le 3 azioni e ottenere il bonus” + reminder (notifica).
- In app: barra 1/3 o 2/3 con CTA per l’azione mancante.

### Comportamento per 1/3, 2/3, 3/3

- **1/3 o 2/3:** Mostrare “Mancano N azioni per il bonus”; elencare quali (Commit/Streak/Mission) non sono ancora fatte; CTA dirette.
- **3/3:** “Giornata completata!” + CTA “Riscatta bonus” (se non ancora fatto) + poi “Prossima azione” (BUZZ, Mission principale, ecc.).

---

## 10. PROGRESSIONE SETTIMANALE

### Blueprint

- **Progresso settimanale:** Utilizzare `retention.weekly_completion` (Daily Engine V2) e, se si introduce “daily full completion”, contare i giorni in cui l’utente ha fatto 3/3 in quella settimana (es. 5/7).
- **Bonus 7 giorni:** “Hai completato 7/7 giorni questa settimana” → reward extra (M1U o PE o chest) alla domenica, oltre al Sunday reward già esistente.
- **Reward domenicale:** Già presente (SundaySuperRewardModal, consumeSundayReward); si può legare a “weekly full completion” (7/7) per un bonus aggiuntivo.
- **Weekly board:** Vista opzionale “Lun–Dom” con checkmark per ogni giorno (Commit fatto, Streak fatto, Mission fatta, 3/3). Non obbligatoria per la versione minima.
- **Combinazione daily + weekly:** Ogni giorno 3/3 incrementa il contatore settimanale; la domenica l’utente può riscattare il reward settimanale (e opzionalmente il “7/7 bonus”).

### Rapporto con retention Daily Engine V2

- **Già presente:** `retention.streak`, `retention.week_start`, `retention.weekly_completion`, `retention.sunday_reward_available`. Si tratta di retention lato “missioni giornaliere”.
- **Estensione:** Se si definisce “daily full” = 3/3 (Commit + Streak + Mission), il backend (o un nuovo contatore) può tracciare “giorni con 3/3 in questa settimana” e esporre 7/7 per reward domenicale aggiuntivo. Questo è un modulo “opzionale” ma coerente con il blueprint.

---

## 11. VERSIONE MINIMA vs VERSIONE COMPLETA

### A. M1SSION Daily Control Loop™ — Versione minima

Obiettivo: **forte miglioramento retention con il minimo di nuovi pezzi.**

- **Stato unificato:** Derivato in frontend: tre letture (check_commit_ritual_status o equivalente, profiles.last_check_in_date, Daily Engine V2 run per oggi) → commit_done, streak_done, mission_done, count 0–3.
- **UI:** Un blocco “Daily” sulla Home (sopra o sotto PrizeVision): “Le 3 azioni di oggi” con 0/3, 1/3, 2/3, 3/3 e tre checkmark (o CTA) per Commit, Streak, Mission. Ordine: Commit → Streak → Mission.
- **Reward 3/3:** Bonus M1U (es. +10) claimabile una volta al giorno se count === 3; backend: una RPC “claim_daily_completion_bonus” che verifica 3/3 e accredita (e registra claim per oggi).
- **Copy:** “Inizia con il Commit”, “Poi fai check-in”, “Infine la missione del giorno”; “Completa le 3 per il bonus.”
- **Reminder:** Estendere useStreakReminder con stesso pattern per “Commit non fatto” e “Mission non completata” (una notifica ciascuno, orario configurabile).
- **Next Action:** Includere nello stesso modale (o in evidenza) le tre azioni daily se non fatte; DailyEngineV2Card già presente, portarla in evidenza insieme a Commit e Streak (stesso componente, posizione più alta o sezione “Daily” dedicata).

**Niente:** Weekly 7/7, barra animata complessa, near-miss messaggi, reward variabile; niente cambi a BUZZ, BUZZ MAP, DB strutturale, login, IAP.

### B. M1SSION Daily Control Loop™ — Versione completa

Tutto quanto nella versione minima, più:

- **RPC `get_today_daily`:** Backend che aggrega commit_done, streak_done, mission_done, count, bonus_claimed (e opzionalmente weekly_progress). Single source of truth per client.
- **Barra / indicatore completamento:** Progress bar 0/3 → 3/3 con micro-animazione al completamento.
- **“Almost completed” messaging:** “Manca solo la Mission!” (2/3), “Quasi 3/3!”.
- **Daily pressure layer:** Copy “Completa entro mezzanotte per il bonus”; countdown a mezzanotte UTC (o locale) sulla checklist.
- **Weekly 7/7:** Contatore “giorni con 3/3” in settimana; reward domenicale aggiuntivo se 7/7; vista “Settimana: 5/7” (opzionale).
- **Notifiche complete:** Commit reminder, Mission reminder, “Daily incompleto” serale (2/3).
- **Narrativa economia:** Micro-copy in app che spiega “Fai le 3 → guadagni M1U/PE → usi in BUZZ”.

---

## 12. STRATEGIA DI RICUCITURA

### Cosa si collega

- **Commit:** Resta invariato; si “collega” solo leggendo lo stato (already_done_today) per la checklist e per il count 3/3.
- **Streak:** Resta invariato; si collega leggendo last_check_in_date === today per checklist.
- **Daily Mission V2:** Resta invariato; si collega leggendo run per day_key con status completed per checklist.
- **Next Action / Panel:** Si collega mostrando in evidenza “Daily 0/3, 1/3, 2/3, 3/3” e CTA per Commit, Streak, Mission; DailyEngineV2Card può stare in cima alla sezione “Prossima azione” o in un blocco “Le 3 azioni” sulla Home.
- **M1U / PE:** Si collegano solo a livello di copy e di eventuale reward 3/3 (accredito M1U/PE); nessun cambio di logica esistente.

### Cosa si aggiunge

- **Checklist daily (UI):** Blocco “Le 3 azioni di oggi” con stato derivato (o da RPC get_today_daily).
- **Reward 3/3:** Logica claim + backend (RPC + storage “bonus già dato oggi”).
- **Reminder Commit e Mission:** Stesso pattern di useStreakReminder.
- **Copy e ordine:** Testi e gerarchia visiva (Commit primo, poi Streak, poi Mission).

### Cosa si lascia stare

- BUZZ, BUZZ MAP: nessun cambio logica; solo suggeriti come “uso successivo” delle M1U.
- Shop, Cashback: nessun cambio; restano economy actions.
- Login, IAP, DB strutturale, Edge (eccetto eventuale nuova RPC leggera), routing, i18n (solo nuove chiavi per copy).
- Xcode, Capacitor, Podfile, scripts, package.json.

### Cosa NON va messo al centro

- BUZZ e BUZZ MAP non sono “azioni daily” del 3/3; sono uso delle risorse dopo.
- Shop e Cashback non sono core daily; sono periferici.
- Battle, Pulse Breaker, Panel: avanzati, suggeriti da Next Action quando rilevante.

---

## 13. VERDETTO FINALE

### Fattibilità reale

- **Si può fare con l’architettura attuale?** Sì. Commit, Streak e Daily Mission V2 sono già implementati; servono solo aggregazione stato (client o RPC), UI checklist, reward 3/3, reminder.
- **Quanta parte esiste già?** Circa 70–75%: le tre azioni, M1U, PE, rank, Next Action, notifiche (pattern), retention V2 con weekly/sunday.
- **Quanto manca davvero?** Circa 25–30%: stato unificato (derivato o RPC), UI checklist, reward 3/3 (RPC + claim), due reminder (Commit, Mission), copy e gerarchia.
- **Quanto è vicino M1SSION a un sistema retention serio?** Molto vicino. I pezzi ci sono; manca la “regia” (un loop narrativo unico e una checklist chiara).

---

## SINTESI FINALE (formato richiesto)

- **Backbone ideale M1SSION:** OPEN APP → Hook (“Le 3 azioni di oggi”) → COMMIT → STREAK → DAILY MISSION → DAILY COMPLETION (3/3) → BONUS CLAIM → GUADAGNO M1U/PE → USO M1U (BUZZ/BUZZ MAP) → AVANZAMENTO RANK → RITORNO DOMANI (reminder, streak, bonus 3/3).
- **Moduli già sufficienti:** Commit (modale, rituale, RPC, reward); Streak (pill, modal, check-in, PE+M1U+milestone, reminder); Daily Mission V2 (Edge, useDailyEngineV2, card, modali, Sunday reward); M1U (pill, balance, crediti da più fonti); PE/Rank (useAwardPE, barra, AgentEnergyPill); Next Action (contenitore, Norah); notifiche (pattern Streak reminder); retention weekly/sunday (V2).
- **Moduli mancanti critici:** (1) Daily checklist unificata (UI 0/3–3/3), (2) today_daily state (derivato o RPC get_today_daily), (3) Reward 3/3 (claim + backend). Importanti: reminder Commit, reminder Mission, barra/indicatore completamento.
- **Strategia migliore:** **Collegare + aggiungere** (collegare i tre stati in una checklist e in un flusso narrativo; aggiungere solo checklist UI, stato unificato, reward 3/3, due reminder; non rifare).
- **Rischio architetturale:** **Basso** (nessun refactor di Commit, Streak, Mission, BUZZ, DB; solo strato “orchestrazione” e moduli minimi).
- **Potenziale retention dopo ricucitura:** **Alto** (daily loop chiaro, loss aversion soft, bonus 3/3, return pressure con reminder; coerenza con economia esistente).
- **Fiducia nel blueprint:** **85%** (allineato all’audit, riuso massimo, moduli mancanti ben delimitati e realizzabili sull’architettura attuale).

---

*Blueprint read-only. Nessuna modifica al codice, ai file di progetto o alle configurazioni. Solo definizione architetturale e piano modulare.*
