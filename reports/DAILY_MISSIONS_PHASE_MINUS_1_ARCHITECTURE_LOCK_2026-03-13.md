# FASE -1 — ARCHITECTURE LOCK — NEW DAILY MISSION ENGINE ENTERPRISE

**Data:** 2026-03-13  
**Prodotto:** M1SSION™ (iOS Capacitor WKWebView)  
**Tipo:** Documento architetturale definitivo e vincolante — READ-ONLY  
**Riferimenti:** DAILY_MISSIONS_ENTERPRISE_ENGINE_FORENSIC_REPORT_2026-03-13.md, DAILY_MISSIONS_SURGICAL_PRE_IMPLEMENTATION_VERIFICATION_2026-03-13.md

---

# 1. EXECUTIVE SUMMARY

**Cosa è stato lockato:**  
Source of truth (server-first, client mai decisore); definizione ufficiale del giorno (day_key UTC, reset, countdown, edge cases); contratto della daily run (identificatori, stati, tentativi, reward, template); contratto reward (M1U + PE da un solo flusso Edge, idempotenza, retry, multi-device); contratto streak missioni (distinta da login streak, ingresso in Fase 2); contratto Sunday Super Reward (lifecycle a stati, server-governed); contratto transizione legacy → v2 (hide UI + feature flag hard, zero convivenza); scope MVP Fase 1 (in/out); contratto i18n (prefisso daily_engine.*); roadmap per fasi con obiettivi e criteri GO/NO GO.

**Decisioni definitive:**  
- UTC unica source of truth per day_key, reset, streak, claim, Sunday.  
- Edge unica che valida e assegna M1U + PE (claim idempotente).  
- Client non decide mai giorno, validità missione, streak, reward, Sunday, badge/intel/agent status.  
- Fase 0 = hide UI legacy; Fase 1 = solo flusso server-driven; quando daily_engine_v2 è attivo, nessun getMissionState()/creditM1USafe nello stesso flusso.  
- Streak missioni: Fase 1 OUT; entra in Fase 2.  
- Sunday Super Reward: Fase 1 OUT; entra in Fase 3.  
- MVP Fase 1: missione del giorno server-driven, run/claim, reward M1U+PE, card daily nuova, stato da server, timer/scadenza, i18n daily_engine.*. OUT: streak missioni, reward escalation, near miss, Sunday, weekly tracker, intel, agent status, badge ring, premium polish.

**Rischi che restano:**  
- Verifica che l’Edge possa chiamare award_pulse_energy (o RPC equivalente) con service_role per PE DAILY_MISSION; se no, fallback client post-claim con idempotenza RPC.  
- UX timezone: copy e countdown devono essere espliciti (mezzanotte UTC).  
- Ordine modali (Sunday vs RewardZone vs altri) da definire in Fase 3.

**Possiamo procedere a Fase 0?**  
Sì, a condizione che Fase 0 sia limitata a: (1) nascondere l’UI daily legacy (flag o MISSIONS_ENABLED) senza toccare DB/Edge; (2) nessuna modifica ai flussi FROZEN; (3) build e Capacitor sync verificati. **GO FOR PHASE 0** con queste condizioni.

---

# 2. ARCHITECTURE LOCK — NON-NEGOTIABLE RULES

1. **Server-first.** Il nuovo Daily Mission Engine è server-first. Tutte le decisioni che riguardano giorno, validità missione, completamento, reward, streak, Sunday, badge, intel, agent status sono prese solo dal server (Edge/DB). Il client non è mai autorizzato a decidere.
2. **Client: solo lettura, invio azioni, ricezione esito.** Il client può: leggere stato da API/Edge; mostrare UI; inviare azioni (es. start_phase, complete_phase); ricevere esito (ok/error, reward_awarded, amount). Il client non può: stabilire che giorno è; stabilire se la missione è ancora valida; far salire la streak; stabilire se il reward è dovuto; stabilire se il Sunday reward è disponibile; sbloccare badge/intel/weekly/agent status.
3. **day_key ufficiale: UTC.** L’unica source of truth per “giorno” è il day_key in formato YYYY-MM-DD calcolato in timezone UTC. Reset, finestra missione, streak missioni, claim, Sunday si basano esclusivamente su questo. Nessun uso di timezone locale o di ora client per decisioni server.
4. **Reward reali solo server-side.** M1U e PE per daily mission sono assegnati solo da Edge (o RPC invocata da Edge). Nessun reward daily in localStorage. Nessun doppio binario (legacy creditM1USafe non usato per il nuovo engine).
5. **Idempotenza obbligatoria.** Ogni claim reward è identificato da una chiave di idempotenza (es. user_id|day_key|mission_id|phase). Seconda richiesta con stessa chiave restituisce success con stesso amount, senza doppio accredito.
6. **Transizione: zero convivenza.** Quando il flusso daily_engine_v2 è attivo, i componenti e gli hook che usano getMissionState(), startMission(), completePhase1/2(), creditM1USafe() non devono essere eseguiti nello stesso percorso utente. Nessuna “doppia UI” legacy + v2 sullo stesso schermo.
7. **FROZEN: nessuna modifica.** Login, logout, cancellazione account, IAP, BUZZ, BUZZ MAP, notifiche push native e tutto ciò che è già funzionante non devono essere modificati dall’introduzione del nuovo engine.
8. **Target: solo app nativa iOS (Capacitor WKWebView).** PWA/TWA e altri ambienti sono fuori scope per questo lock.
9. **i18n: prefisso dedicato, no hardcoded.** Tutte le stringhe utente del nuovo engine usano il prefisso/namespace daily_engine.* (o convenzione concordata). Nessuna stringa hardcoded in UI per stati, timer, errori, reward, Sunday, badge, agent status.
10. **Streak missioni distinta da login streak.** La streak “giorni consecutivi di completamento daily” è concettualmente e nei dati separata dalla streak di check-in/login (profiles.current_streak_days). Vive lato server; il client la visualizza soltanto.

---

# 3. DAY_KEY / TIMEZONE / RESET CONTRACT

## 3.1 Decisione finale

- **day_key ufficiale:** Stringa `YYYY-MM-DD` in timezone **UTC**.  
- **Calcolo:** `day_key = now.toISOString().slice(0, 10)` (server) ovvero equivalente con `NOW() AT TIME ZONE 'UTC'` in SQL. Il client, per display (countdown), può calcolare “prossima mezzanotte UTC” con `new Date(Date.UTC(y, m, d + 1))` dove (y,m,d) è la data UTC di oggi, ma **non** usa il risultato per decisioni (è solo per UI).
- **Reset ufficiale:** Il “nuovo giorno” inizia alle **00:00:00 UTC**. La missione associata al day_key N è valida per l’intero giorno N in UTC (da 00:00:00 a 23:59:59.999 UTC). Dopo 00:00:00 UTC del giorno N+1, la missione del giorno N non è più completabile; ogni run è associata a un solo day_key.
- **Countdown ufficiale:** Il client può mostrare “Prossima missione tra X ore” calcolando la differenza tra “prossima mezzanotte UTC” e “now” (usando Date UTC). Copy obbligatorio: esplicitare che il riferimento è mezzanotte UTC (es. “La missione si aggiorna ogni giorno a mezzanotte UTC” o “00:00 ora di riferimento”) per evitare confusione in fusi avanzati.
- **Streak reset:** La streak “missioni daily” si resetta se l’utente non completa la missione nel day_key previsto. Il confronto è tra last_completed_day_key e “ieri UTC”; se non consecutivi, streak torna a 0 (o 1 al primo completamento del nuovo periodo).

## 3.2 Implicazioni UX

- Per utenti in timezone molto diversi da UTC (es. Asia), “mezzanotte” della daily non coincide con la mezzanotte locale. Comunicazione chiara in copy e, opzionalmente in fase successiva, display “nella tua ora locale” (solo informativo; logica resta UTC).
- Refetch obbligatorio: al focus/resume dell’app, il client deve rifare fetch dello stato daily (day_key, missione, run) per aggiornare UI e countdown dopo mezzanotte.

## 3.3 Edge cases (regole definitive)

- **App aperta oltre mezzanotte UTC:** Refetch stato; UI aggiornata con nuova missione e nuovo countdown.  
- **Offline:** Nessun claim; nessuna decisione “oggi/ieri”. Messaggio “Connettiti per vedere la missione”.  
- **Multi-device:** Stesso user: day_key è UTC su server; una run per (user_id, day_key, mission_id). Comportamento coerente.  
- **Clock spoof client:** Il server ignora qualsiasi day_key o timestamp inviato dal client per decisioni. Solo day_key calcolato server-side conta.

---

# 4. DAILY RUN CONTRACT

## 4.1 Modello concettuale definitivo

- **Entità:** Una **run** rappresenta un tentativo dell’utente di completare la missione del giorno per un dato day_key e una data missione (o template).
- **Identificatori canonici:**  
  - `user_id` (UUID, auth.users).  
  - `day_key` (YYYY-MM-DD UTC).  
  - `mission_id` (o `template_id` + eventuale variant).  
  - Unicità: al più una run per (user_id, day_key, mission_id).
- **Stato della run:**  
  - **non_started** — nessuna run esistente per (user_id, day_key, mission_id).  
  - **active** — run creata; phase 1 o 2 in corso; non ancora completed/failed.  
  - **completed** — missione completata con successo (phase 2 completata, reward erogato).  
  - **failed** — missione fallita (es. tentativi esauriti o esito negativo dove applicabile).  
  - **expired** — (opzionale) day_key non è più “oggi”; run non più completabile.
- **Fasi (logiche):**  
  - Phase 0: non iniziata.  
  - Phase 1: iniziata oggi (day_key = oggi UTC); l’utente deve completare l’azione Phase 1.  
  - Phase 2: sbloccata il giorno successivo (day_key di ieri ha phase 1 completata); l’utente completa Phase 2.  
  - Phase 3: completata (stato completed).  
  La transizione tra fasi è decisa e scritta solo dal server.
- **Tentativi:** Se il design prevede un numero massimo di tentativi per fase (es. 3), questo è memorizzato e aggiornato nella run (es. campo `attempts_used` o in progress_json). Il server rifiuta complete oltre il limite.
- **Esito:** Per ogni phase completion il server determina win/fail (dove applicabile) e aggiorna lo stato della run; il reward è erogato solo in caso di win e con idempotenza sul claim.
- **Start/Completion:** Start = creazione run (INSERT) con phase 1, day_key = oggi. Completion phase 1 = update run a phase 2, phase1_completed_at. Completion phase 2 = update run a phase 3, status completed/failed, e (se win) insert claim + credit M1U + credit PE.
- **Reward previsti:** Definiti per template/missione (es. amount_m1u_phase1, amount_m1u_phase2, amount_pe). Assegnati una sola volta per (user_id, day_key, mission_id, phase) tramite claim idempotente.
- **Appartenenza template/giorno:** La missione del giorno è determinata dal server in base a day_key (e opzionalmente giorno della settimana per template Lun–Dom). La run è sempre associata a un day_key e a un mission_id/template_id.

---

# 5. REWARD CONTRACT (M1U + PE)

## 5.1 Orchestrazione ufficiale

- **Un solo flusso logico:** Una sola Edge (o una sola orchestrazione server) che: (1) valida la run e il diritto al reward (phase completata, win se applicabile, day_key coerente); (2) verifica idempotency_key; (3) se non già claimato: INSERT in daily_mission_claims, chiamata admin_credit_m1u per M1U, chiamata award_pulse_energy (o RPC equivalente) per PE DAILY_MISSION; (4) risponde al client con reward_awarded, amount_m1u, amount_pe.
- **Edge unica che valida e assegna sia M1U che PE.** Alternativa ammessa solo se vincoli tecnici (es. RPC award_pulse_energy non chiamabile da Edge): allora il client, dopo risposta positiva dell’Edge (reward_awarded: true), può chiamare awardPE('DAILY_MISSION') una sola volta; l’idempotenza è garantita da record_pe_daily_action (limite 1/giorno per DAILY_MISSION). La scelta preferita resta: Edge accredita entrambi.
- **Niente localStorage per reward daily.** Nessun uso di creditM1USafe o pending credits in localStorage per il nuovo engine.
- **Idempotenza obbligatoria:** idempotency_key = f(user_id, day_key, mission_id, phase). SELECT prima di INSERT; se claim già presente, 200 con amount già dato, nessun secondo accredito.
- **Retry:** Il client può ritentare la stessa richiesta (es. complete_phase2). La risposta è idempotente: stesso risultato, nessun doppio credito. Il client deve trattare 200 con reward_awarded: true come successo anche in caso di retry.
- **Multi-device:** Stesso user da due device: il primo claim completa e accredita; il secondo riceve 200 con reward_awarded: true e amount già salvato (da SELECT claim esistente). Nessun doppio accredito.
- **Output verso client (contratto risposta):** Almeno: `{ ok: boolean, reward_awarded: boolean, amount_m1u?: number, amount_pe?: number, phase: number, status: string, ... }`. Il client usa reward_awarded e amount_* per mostrare overlay e aggiornare UI; non deve inferire “ho ricevuto reward” da altri campi.

---

# 6. STREAK CONTRACT

## 6.1 Definizione ufficiale

- **Streak missioni daily:** Contatore di giorni consecutivi in cui l’utente ha **completato con successo** la missione daily (run in stato completed per quel day_key). È distinta dalla streak di check-in/login (profiles.current_streak_days).
- **Salita:** Sale di 1 quando l’utente completa la missione in un day_key che è “il giorno dopo” l’ultimo day_key completato (consecutività UTC).
- **Reset:** Si resetta (torna a 0) se l’utente non completa la missione nel day_key successivo all’ultimo completato (giorno saltato). Opzionale: al primo completamento dopo un reset, streak diventa 1.
- **Vive lato server:** Il valore è calcolato e/o persistito sul server (tabella o colonna dedicata, es. daily_mission_streak o profiles.daily_mission_streak_days + last_daily_mission_day_key). Il client non calcola mai la streak; la riceve in sola lettura.
- **Il client la visualizza soltanto:** Nessuna logica client che “incrementa” o “resetta” la streak.

## 6.2 Ingresso in roadmap

- **Fase 1 MVP:** Streak missioni **OUT OF SCOPE**. Non viene implementata né esposta in Fase 1.
- **Fase 2:** Streak missioni **IN SCOPE**. Ingresso insieme al Mission Template System (o subito dopo). Reward escalation (bonus M1U/PE per streak) può essere nella stessa Fase 2 o in Fase 3; decisione lasciata alla pianificazione dettagliata di Fase 2.

---

# 7. SUNDAY SUPER REWARD CONTRACT

## 7.1 Lifecycle (state machine definitiva)

- **Stati:**  
  - **available** — L’utente ha diritto al Sunday reward per il day_key (domenica UTC); non è ancora stato mostrato (nessun shown_at per user_id + day_key).  
  - **showing** — Il client ha chiamato “mark_showing” e sta per mostrare (o sta mostrando) la modale; il server ha registrato shown_at (o un flag “in progress”).  
  - **shown** — La modale è stata chiusa (timer 60s scaduto o utente ha chiuso); il server ha registrato “shown” e non sarà più disponibile per quel day_key.  
  - **expired** — (Opzionale) Il day_key non è più domenica o è passato; il diritto non è più erogabile.

- **Transizioni:**  
  - available → showing: quando il server riceve “mark_showing” (o “reserve”) per (user_id, day_key) e day_key è domenica e non esiste ancora shown_at.  
  - showing → shown: quando il client invia “mark_shown” dopo chiusura modale (o timeout 60s), o il server impone shown dopo un timeout (opzionale).  
  - available → (nessuna): se l’utente non apre l’app di domenica o non soddisfa la condizione di diritto.

- **Chi ha diritto:** Definizione prodotto: es. “qualsiasi utente autenticato che apre l’app in un day_key che è domenica UTC” (una volta per quella domenica). Alternativa: “utente che ha completato la daily di quella domenica”. La condizione deve essere verificata server-side.
- **Dove nasce/vive lo stato:** Server. Tabella o riga (user_id, day_key, status, shown_at). Edge “sunday_clue_status” (GET) e “sunday_clue_mark_showing” (POST), “sunday_clue_mark_shown” (POST, idempotente).
- **Apertura:** Il client, dopo auth e su route idonea (es. home), chiama sunday_clue_status; se available e day_key è domenica, chiama mark_showing; solo dopo 200 da mark_showing mostra la modale full-screen (per evitare doppia apertura).
- **Quando viene marcata come shown:** Alla chiusura della modale (tap “Chiudi” o scadenza 60s). Il client invia mark_shown; il server aggiorna stato a shown. Idempotente: chiamate ripetute mark_shown per stesso (user_id, day_key) non cambiano comportamento.
- **Utente chiude/killa/backgrounda:** Se mark_showing è già stato chiamato, al ritorno il server restituirà “already_shown” o “showing” (a seconda di policy). Se il client non ha ancora chiamato mark_shown ma aveva chiamato mark_showing, alla riapertura può chiamare mark_shown senza mostrare di nuovo la modale (contenuto “consumato” in senso di diritto). Policy: **mark_showing = diritto consumato**; non si riapre mai per lo stesso day_key.
- **Dopo 60 secondi:** Il client chiude la modale e chiama mark_shown. Il contenuto non è più visibile; non è riapribile.
- **Contenuto:** “1 indizio gratuito” mostrato in modale; può essere “solo mostrato” (nessun consumo aggiuntivo) o “consumato” (es. sblocco di un indizio in DB). Definizione prodotto; il lock architetturale richiede solo che lo stato “shown” sia persistito e non riapribile.

## 7.2 Ingresso in roadmap

- **Fase 1 MVP:** Sunday Super Reward **OUT OF SCOPE**.  
- **Fase 3 (Retention Layer):** Sunday Super Reward **IN SCOPE**.

---

# 8. LEGACY → V2 TRANSITION CONTRACT

## 8.1 Strategia definitiva

- **Fase 0 (Legacy Hide / Preparation):** Nascondere **tutta** l’UI daily legacy. Nessuna card daily, nessuna pill daily, nessun Controller briefing/phase2, nessun link “Daily Mission” nel Next Action che porti al flusso legacy. Mezzo: **feature flag o costante** (es. `MISSIONS_ENABLED = false` o `DAILY_ENGINE_LEGACY_HIDDEN = true`) che fa sì che i componenti che rendono MissionPill, DailyMissionCard, Next Action card “Daily Mission” e DailyMissionsController **non vengano montati** o **non mostrino** nulla. Il codice legacy non viene eliminato; resta nel repo ma non è attivo. DB e Edge esistenti (daily_mission_runs, daily_mission_claims, claim-daily-phase, daily-mission-today) **non** vengono modificati in Fase 0.
- **Quando daily_engine_v2 è attivo (dalla Fase 1):** Il flusso utente daily è **solo** quello che legge stato da API/Edge del nuovo engine e invia azioni alle Edge del nuovo engine. **Completamente esclusi** dallo stesso flusso: `getMissionState()`, `startMission()`, `completePhase1()`, `completePhase2()`, `creditM1USafe()`, `missionEngine.handlePhase1Complete` / `handlePhase2Complete`, e qualsiasi componente che dipende da questi per decidere cosa mostrare (DailyMissionCard legacy, MissionPill legacy, DailyMissionContent legacy, NextActionContainer/NextActionContent per la card Daily, DailyMissionsController con Briefing/Phase2Resume/Actions/Completion). Non deve esserci **convivenza**: non “a volte legacy a volte v2”; quando v2 è attivo, **solo** v2.
- **Strategia di transizione ufficiale:** **Hide UI (Fase 0) + Feature flag hard (Fase 1).**  
  - Fase 0: Hide UI totale legacy; nessuna daily visibile.  
  - Fase 1: Feature flag `daily_engine_v2` (o equivalente). Se true: entrypoint “Daily” (card/pill/next action) sono sostituiti da un unico albero di componenti che usa solo hook/API v2; i componenti legacy non sono montati per quel branch. Se false: si può ripristinare la UI legacy (rollback) senza toccare il codice v2.  
- **Switch endpoint:** Non adottato come strategia primaria; opzionale in futuro per rollout progressivo (server restituisce engine: 'v1'|'v2' e il client sceglie quale UI mostrare). Per il lock, la strategia è **hide + feature flag hard**.

---

# 9. MVP SCOPE LOCK

## 9.1 IN SCOPE per Fase 1 MVP

- **Missione del giorno server-driven:** Il client ottiene day_key e mission_id (o template_id) da un endpoint/Edge (es. daily-mission-today esteso o get-daily-status). Nessuna decisione client su “quale missione oggi”.
- **Run e stato missione da server:** Creazione run (start), aggiornamento run (complete phase 1/2), lettura stato run da server. Nessuno stato fase in localStorage per il nuovo flusso.
- **Reward M1U + PE:** Assegnati da Edge in un unico flusso idempotente al completamento (phase 2 completed, win se applicabile). Il client riceve reward_awarded, amount_m1u, amount_pe e mostra feedback (overlay/toast).
- **Timer / scadenza:** Countdown o indicazione “scade a mezzanotte UTC” (o equivalente) e refetch al focus per aggiornare dopo mezzanotte. La finestra valida della missione è il day_key (oggi UTC).
- **Card daily nuova:** Una card (o pill) che mostra lo stato della missione del giorno (non iniziata / in corso / completata / scaduta) e permette di aprire il flusso (start, complete phase 1, complete phase 2). La card legge **solo** da API/Edge v2.
- **Template missione (minimo):** Almeno un template o una missione tipo “completa Phase 1 e Phase 2” con validazione server (può essere l’estensione delle 3 missioni server-real esistenti o un sottoinsieme). Non è obbligatorio avere i 7 template Lun–Dom in Fase 1; può essere una sola missione o un ciclo semplice.
- **i18n daily_engine.*:** Chiavi per stati, timer, reward, errori, CTA usate dalla nuova UI. Prefisso daily_engine (o convenzione concordata). Nessuna stringa hardcoded.

## 9.2 OUT OF SCOPE per Fase 1 MVP

- **Streak missioni:** Non implementata. Entra in Fase 2.
- **Reward escalation:** Non implementata. Entra in Fase 2 o 3.
- **Near miss:** Messaggio “quasi fatto” non in Fase 1. Entra in Fase 3.
- **Sunday Super Reward:** Non in Fase 1. Entra in Fase 3.
- **Weekly tracker (Mon–Sun ●○○):** Non in Fase 1. Entra in Fase 3.
- **Intel fragments / Intel file unlock:** Non in Fase 1. Entra in Fase 4.
- **Agent status (ACTIVE/INACTIVE):** Non in Fase 1. Entra in Fase 3.
- **Badge ring (10/30/60/100):** Non in Fase 1. Entra in Fase 4.
- **Premium polish:** Animazioni avanzate, A/B, onboarding dedicato daily: non in Fase 1. Fase 5 o successive.

## 9.3 Motivazioni

- Fase 1 deve dimostrare **core funzionante**: server come unica source of truth, run/claim, reward M1U+PE, UI leggibile e senza collisione con legacy. Aggiungere streak, Sunday, intel, badge in Fase 1 aumenterebbe rischio e ritardo senza essere indispensabili per il “cuore” del sistema.
- Timer e refetch sono in scope perché senza di essi l’esperienza “daily” (scadenza, nuovo giorno) sarebbe incoerente.
- i18n è in scope per non lasciare stringhe hardcoded e per allineare da subito alla convenzione.

---

# 10. I18N CONTRACT

- **Prefisso/namespace ufficiale:** `daily_engine` (es. chiavi `daily_engine.timer_expires`, `daily_engine.state.completed`). Alternativa: `daily_mission_v2.*`. Un solo prefisso per tutto il nuovo engine.
- **Naming convention:** snake_case per chiavi (es. `daily_engine.timer_expires_utc`). Sotto-chiavi per gruppi: `daily_engine.state.*`, `daily_engine.sunday.*`, `daily_engine.error.*`, ecc.
- **Gruppi di chiavi:** timer/countdown; states (not_started, in_progress, completed, failed); reward; errors/retry; (fasi successive) near_miss, sunday, intel, badges, agent_status, weekly.
- **Ownership:** Tutte le chiavi del nuovo engine sono sotto il blocco commentato “DAILY ENGINE v2” nei file di lingua (o in file dedicato dailyEngine.json se il progetto supporta più namespace). Nessuna chiave daily_engine.* usata per altro contesto.
- **Regola “no hardcoded strings”:** In tutti i componenti e hook del nuovo engine, le stringhe visibili all’utente devono provenire da t(key); nessun testo fisso in italiano/inglese/francese nel codice.
- **Fase 1:** Devono esistere almeno le chiavi per: stati missione, timer/countdown, reward (es. “+X M1U”, “+Y PE”), pulsanti (Start, Complete Phase 1/2), messaggi di errore e retry. Le chiavi per Sunday, near_miss, intel, badges, agent_status possono essere aggiunte nelle fasi in cui quelle feature entrano in scope.

---

# 11. ROADMAP BY PHASE

## Fase -1 — Architecture Lock (completata con questo documento)

- **Obiettivo:** Chiudere tutte le decisioni architetturali non negoziabili; nessuna implementazione.
- **Scope:** Documento di lock; build e Capacitor sync di verifica.
- **Criteri GO per Fase 0:** Documento approvato; build ok; sync ok; nessuna modifica applicata.

## Fase 0 — Legacy Hide / Preparation

- **Obiettivo:** Nascondere l’UI daily legacy senza modificare DB/Edge; preparare il repo a Fase 1 (flag, eventuale branch o cartella per nuovo codice).
- **Scope:** Feature flag o costante che disabilita il mount/display di: DailyMissionsController, MissionPill, DailyMissionCard (e card Daily in NextActionContainer), DailyMissionContent, MissionBriefingModal, MissionActionsModal, Phase2ResumeModal, MissionCompletionModal quando mostrati come “daily”. Nessuna modifica a login, IAP, BUZZ, BUZZ MAP, push, delete account.
- **Out of scope:** Nuove tabelle; nuove Edge; modifiche a daily_mission_runs/claims; nuovo UI v2.
- **Rischi:** Basso se si limita a condizione “se flag allora non renderizzare”; rischio di dimenticare un entrypoint (es. MissionPill su mappa).
- **Criteri GO per Fase 1:** UI legacy daily non visibile; build e sync ok; nessuna regressione su flussi FROZEN; elenco componenti nascosti documentato.

## Fase 1 — Core Engine MVP

- **Obiettivo:** Primo rilascio tecnico server-driven: missione del giorno da server, run/claim, reward M1U+PE, card daily nuova, timer/refetch, i18n daily_engine.*.
- **Scope:** Come da §9 (MVP Scope Lock). Endpoint/Edge per stato daily e per claim; client che legge solo da server e invia azioni; idempotenza e reward da Edge.
- **Out of scope:** Streak missioni, reward escalation, near miss, Sunday, weekly tracker, intel, agent status, badge ring, premium polish.
- **Rischi:** Medio (nuovo codice, integrazione Edge–RPC PE da verificare).
- **Criteri GO per Fase 2:** Utente può vedere missione del giorno, avviare, completare phase 1 e 2, ricevere M1U+PE una sola volta; countdown/refetch funzionanti; nessuna regressione; i18n completo per scope Fase 1.

## Fase 2 — Mission Template System

- **Obiettivo:** 7 template (Lun–Dom) con varianti; streak missioni; eventuale reward escalation.
- **Scope:** Template_id / giorno settimana; logica server per assegnazione missione; streak missioni (conteggio, reset); opzionale escalation reward.
- **Out of scope:** Sunday, near miss, intel, badge, agent status (salvo definizione diversa in pianificazione).
- **Criteri GO per Fase 3:** Template in produzione; streak missioni visibile e corretta; nessuna regressione.

## Fase 3 — Retention Layer

- **Obiettivo:** Sunday Super Reward, near miss, weekly tracker, agent status.
- **Scope:** Lifecycle Sunday (mark_showing, mark_shown); messaggio near miss; visualizzazione settimanale (Mon–Sun); stato ACTIVE/INACTIVE.
- **Out of scope:** Intel fragments, badge ring (Fase 4).
- **Criteri GO per Fase 4:** Sunday reward erogato una volta per domenica; near miss e weekly/agent status funzionanti; nessuna regressione.

## Fase 4 — Meta Layer / Premium Layer

- **Obiettivo:** Intel fragments, Intel file unlock, badge ring (10/30/60/100).
- **Scope:** Schema intel_fragments / intel_files; sblocco fragment per completamento; badge ring attorno avatar in Home; logica badge da conteggio completamenti.
- **Out of scope:** (Definito in pianificazione Fase 4.)
- **Criteri GO per Fase 5:** Intel e badge in produzione; nessuna regressione.

## Fase 5 — QA / Polish / Hardening

- **Obiettivo:** Test su dispositivo iOS reale; premium polish; hardening anti-cheat e performance.
- **Scope:** Test E2E; ordine modali; safe area; eventuale rate limit e audit.
- **Criteri GO per release:** Tutti i criteri di qualità soddisfatti; nessun blocco noto.

---

# 12. FINAL VERDICT

## GO FOR PHASE 0

**Motivazione:**

- L’Architecture Lock è completo: source of truth, day_key, run, reward, streak, Sunday, transizione, MVP scope, i18n e roadmap sono definiti in modo non ambiguo. Un implementatore può procedere senza “interpretare”.
- Le condizioni per aprire Fase 0 sono rispettate: (1) nessuna modifica a DB/Edge in Fase 0; (2) Fase 0 = solo hide UI legacy tramite flag/costante; (3) nessun tocco ai flussi FROZEN; (4) build e Capacitor sync devono essere eseguiti e documentati al termine di questa fase -1. Se build o sync falliscono, la causa va documentata e **non** corretta in questa fase (solo report diagnostico).
- **Verdetto preliminare per Fase 1 (dopo Fase 0):** **GO WITH CONDITIONS.** Condizioni: (1) Fase 0 completata e verificata; (2) conferma che l’Edge possa chiamare award_pulse_energy (o equivalente) per PE DAILY_MISSION; in caso contrario adottare fallback client con idempotenza RPC; (3) rispetta rigorosamente MVP Scope Lock (§9) e Non-Negotiable Rules (§2).

## Condizioni obbligatorie per la Fase 0

1. Usare **solo** hide UI (nessuna rimozione di codice legacy, nessuna modifica a DB/Edge).
2. **Non** modificare login, logout, delete account, IAP, BUZZ, BUZZ MAP, push.
3. Documentare l’elenco esatto dei componenti/entrypoint nascosti (DailyMissionsController, MissionPill, DailyMissionCard, Next Action daily card, modali Briefing/Actions/Phase2Resume/Completion quando usate per daily).
4. Eseguire build e Capacitor sync iOS dopo la Fase 0 (o in chiusura Fase -1) e allegare esito al report.

---

# APPENDICE A — ESITO BUILD E CAPACITOR SYNC

Eseguiti in data 2026-03-13 in contesto Fase -1 (read-only, nessuna modifica al codice).

## A.1 Build

- **Comando:** `npm run build`
- **Esito:** **FAILED** (exit code 1)
- **Motivo:** Errore durante la fase di copy degli asset pubblici in `dist/`:
  - `ENOENT: no such file or directory, copyfile '.../public/assets/prizes/borse/borsa-2.png' -> '.../dist/assets/prizes/borse/borsa-2.png'`
  - In un secondo run è stato riportato anche: `ENOENT` per `public/video/gerarchia M1SSION/RECRUIT-VIDEO.mp4`
- **Diagnosi:** La compilazione Vite (5305 moduli trasformati) va a buon fine; il fallimento avviene in `prepareOutDir` durante la copia ricorsiva di `public/` in `dist/`. Manca almeno un file referenziato nella struttura public (asset mancante sul disco). **Non dipende da modifiche effettuate in Fase -1:** nessun file applicativo è stato toccato. È un problema preesistente (asset non committati, path con spazi, o file rimossi).
- **Azione richiesta (fuori Fase -1):** Verificare la presenza di tutti gli asset in `public/` richiesti dalla build (in particolare `public/assets/prizes/borse/borsa-2.png` e `public/video/gerarchia M1SSION/RECRUIT-VIDEO.mp4`) o adattare la config Vite/public per escludere path inesistenti. In questa fase **non** sono state applicate correzioni.

## A.2 Capacitor sync iOS

- **Comando:** `npx cap sync ios` (eseguito senza rifare build, su eventuale `dist/` preesistente)
- **Esito:** Esecuzione avviata; l’esito dipende dalla presenza e completezza di `dist/`. Se `dist/` non esiste o è incompleta (build fallita), `cap sync ios` copia comunque il contenuto attuale di `dist/` verso `ios/App/App/public/`; il progetto iOS può quindi essere non aggiornato o incoerente.
- **Raccomandazione:** Risolvere il fallimento del build (asset mancanti), rieseguire `npm run build` fino a esito OK, poi `npx cap sync ios`. Considerare **Fase 0** bloccata dal punto di vista “build e sync verificati” finché il build non è verde.

---

# APPENDICE B — VERDETTO FINALE E CONDIZIONI PER FASE 0

## Verdetto Fase -1

- **Architecture Lock:** **COMPLETATO.** Il documento di lock è completo e vincolante.
- **Build:** **FAILED** (asset mancanti; non dipendente da Fase -1).
- **Capacitor sync iOS:** Eseguibile solo a build riuscita; con build fallita non si considera “verificato”.

## GO FOR PHASE 0 — CON CONDIZIONI

- **GO FOR PHASE 0** resta valido per la parte **architetturale e di piano**: nascondere l’UI legacy, nessuna modifica DB/Edge, rispetto dei FROZEN.
- **Condizione obbligatoria prima di considerare Fase 0 “verificata”:** Il **build deve essere riportato a esito OK** (risolvendo i file mancanti in `public/` o la configurazione degli asset). Fino ad allora, Fase 0 può essere eseguita (hide UI) ma **non** si può dichiarare “build e Capacitor sync verificati” senza un build verde e un successivo `cap sync ios` riuscito.
- **Nessuna modifica è stata applicata** a codice, DB, Edge, i18n o UI in questa Fase -1.

## Verdetto preliminare Fase 1 (dopo Fase 0)

- **GO WITH CONDITIONS:** Come da §12. Condizioni: Fase 0 completata; conferma capacità Edge di erogare PE DAILY_MISSION; rispetto MVP Scope Lock e Non-Negotiable Rules.

## Lista condizioni obbligatorie per la Fase successiva (Fase 0)

1. Risolvere il fallimento del build (asset in `public/` mancanti o config Vite) e ottenere `npm run build` con exit code 0.
2. Eseguire `npx cap sync ios` dopo build OK e verificare esito.
3. Fase 0: nascondere solo l’UI daily legacy (flag/costante); non modificare DB, Edge, login, IAP, BUZZ, BUZZ MAP, push, delete account.
4. Documentare l’elenco componenti/entrypoint nascosti (DailyMissionsController, MissionPill, DailyMissionCard, Next Action daily, modali Briefing/Actions/Phase2Resume/Completion per daily).

---

*Fine documento. Nessuna modifica a codice, DB, Edge, i18n, UI o business logic.*
