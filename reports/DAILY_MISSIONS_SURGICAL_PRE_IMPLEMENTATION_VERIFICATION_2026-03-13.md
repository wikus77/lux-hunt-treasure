# DAILY MISSIONS — VERIFICA CHIRURGICA PRE-IMPLEMENTAZIONE “NEW DAILY MISSION ENGINE”

**Data:** 2026-03-13  
**Prodotto:** M1SSION™ (iOS Capacitor WKWebView)  
**Modalità:** READ-ONLY ASSOLUTO — nessuna modifica a codice, DB, Edge, i18n, UI  
**Scope:** Timezone/day_key, reward M1U+PE, source of truth, Sunday Super Reward, anti-cheat, badge ring, i18n

---

# 1. EXECUTIVE SUMMARY

**Cosa è stato verificato:**  
Inventario e analisi di (A) timezone/day_key e reset giornaliero, (B) flusso reward M1U e PE e idempotenza, (C) collisioni tra sistema legacy e server-real e strategia di transizione, (D) lifecycle Sunday Super Reward, (E) anti-cheat esistente e minimo enterprise, (F) integrazione badge ring attorno avatar in Home, (G) architettura i18n attuale e struttura consigliata per il nuovo engine.

**Principali rischi:**  
- **Timezone:** Il client usa `getTodayKey() = new Date().toISOString().split('T')[0]` che in JavaScript è **UTC** (toISOString è sempre UTC). Server Edge usa `getDayKeyUtc()`. Quindi oggi client e server sono già allineati su UTC. Il rischio è **UX**: utenti in fusi avanzati (es. Asia) vedono “nuova missione” e “fine giornata” a mezzanotte UTC, non alla loro mezzanotte locale; countdown e copy devono essere espliciti (“UTC” o “mezzanotte ora di riferimento”).  
- **Reward:** Doppio percorso: legacy (creditM1USafe → localStorage) e server-real (claim-daily-phase → daily_mission_claims + admin_credit_m1u). PE tipo DAILY_MISSION è definito (50 PE, 1/giorno) ma **non è mai chiamato** al completamento daily; nessun doppio claim lato server grazie a idempotency_key.  
- **Source of truth:** Molti componenti leggono ancora `getMissionState()` (localStorage). Durante la transizione, un feature flag netto deve nascondere tutta l’UI daily legacy e mostrare solo il flusso che legge da server; altrimenti collisione garantita.  
- **Sunday Super Reward:** Non esiste; richiede stato server (disponibile / aperto / scaduto), timer 60s ancorato (client + server “shown_at”) e hook su app open / home mount; edge case critici: background, kill app, offline, doppia apertura.  
- **Badge ring:** Avatar in Home vive in ProfileDropdown → ProfileAvatar; oggi c’è solo ring subscription in ProfileInfo (pagina profilo). Aggiungere un ring “badge missioni” in Home richiede un wrapper o variante che non sovrascriva il ring subscription dove già usato.  
- **i18n:** Un solo namespace `common` (it/en/fr); già presenti chiavi `home_daily_*`, `streak_*`, `daily_mission.*`. Il nuovo engine deve usare un prefisso dedicato (es. `daily_engine.*`) e non spargere chiavi in flat.

**Decisioni obbligatorie:**  
1. **Day_key:** Confermare **UTC come unica source of truth** per giorno, reset, streak missioni, claim e Sunday. Documentare in copy/countdown che il riferimento è mezzanotte UTC (o introdurre in fase successiva “timezone profilo” se prodotto lo richiede).  
2. **Reward:** Nuovo engine deve **solo** usare Edge (claim) → daily_mission_claims + admin_credit_m1u per M1U e, **dalla stessa Edge**, invocare award_pulse_energy (o RPC equivalente) per PE DAILY_MISSION; mai creditM1USafe per reward reali.  
3. **Transizione:** **Feature flag hard**: nascondere tutta l’UI che usa getMissionState()/creditM1USafe (card, pill, Next Action daily, Controller briefing/phase2); mostrare solo UI che legge da API/Edge del nuovo engine. Zero giorni di convivenza “stesso schermo” tra vecchio e nuovo.  
4. **Sunday:** Stato “sunday_clue” (available / shown_at / expired) deve vivere su server; timer 60s può essere client con sync “marked_shown” su server alla chiusura/scadenza; trigger dopo auth + home (o primo route autenticato) con check day_of_week server.  
5. **Anti-cheat MVP:** Mantenere idempotency_key su claim; day_key sempre da server; nessun trust del client per “ho completato” o “oggi”; opzionale rate-limit per action per user/day.  
6. **Badge ring:** Componente `BadgeRing` (o prop su ProfileAvatar) che riceve livello badge e rende un anello; in Home usare solo per badge missioni; in Profile/altre pagine lasciare invariato ring subscription.  
7. **i18n:** Namespace o prefisso `daily_engine` (o `daily_mission_v2`); gruppi: timer, states, near_miss, sunday, intel, badges, agent_status, errors.

**Cosa è già abbastanza chiaro:**  
- UTC ovunque per day_key (client getTodayKey è già UTC); idempotenza claim solida; RLS e CASCADE su runs/claims; PE con check_pe_daily_limit e record_pe_daily_action; pattern MapPillFlipOverlay per modali full-screen; i18n IT/EN/FR su common con chiavi daily/streak.

**Cosa è ancora da blindare prima di implementare:**  
- **Documento decisione timezone** (UTC vs locale) e copy/countdown; **contratto Edge** per “claim daily + award PE” in una sola chiamata idempotente; **schema stato Sunday** (tabella o colonna + flusso “shown”); **punto di mount univoco** per Sunday modal (es. App dopo auth o prima route home); **elenco esatto componenti** da nascondere con feature flag; **convenzione chiavi i18n** daily_engine.* e ownership.

---

# 2. TIMEZONE / DAY_KEY / RESET

## 2.1 Inventario attuale

| Dove | Come viene calcolato | Effettivo |
|------|----------------------|-----------|
| **Client `missionState.getTodayKey()`** | `new Date().toISOString().split('T')[0]` | **UTC** (toISOString in JS è sempre UTC) |
| **Client `missionsRegistry.getMissionOfTheDay()`** | `new Date().toISOString().split('T')[0]` come day_key per epochDay % cycle | **UTC** |
| **Client `useMissionOfTheDay`** | Server `day_key` da daily-mission-today; fallback con getTodayKey() locale | Server **UTC**; fallback **UTC** |
| **Client StreakModal / StreakWidget / StreakPill** | `new Date().toISOString().split('T')[0]` per “today” | **UTC** |
| **Client useBuzzGrants / useTierFreeBuzz** | `toISOString().split('T')[0]` o equivalente | **UTC** |
| **Edge daily-mission-today** | `getDayKeyUtc(): now.toISOString().slice(0,10)` | **UTC** |
| **Edge claim-daily-phase** | `getDayKeyUtc()`, `getYesterdayKeyUtc()` | **UTC** |
| **Edge spin-wheel** | `getDayKeyUtc()` | **UTC** |
| **Vera mission bomb (migration)** | `TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD')` | **UTC** |

Non esiste nel codebase un “day key” esplicitamente calcolato in timezone locale (es. getFullYear/getMonth/getDate sul Date locale). Tutti gli usi rilevanti per daily/streak/wheel sono **UTC**.

## 2.2 Problemi

- **Percezione UX:** Per un utente in GMT+9, “mezzanotte” della daily è alle 09:00 ora locale. Il “nuovo giorno” e “missione scaduta” non coincidono con la mezzanotte locale. Copy e countdown devono dire chiaramente “Scade a mezzanotte UTC” o equivalente, oppure si introduce in futuro un “timezone profilo” (scelta prodotto).
- **Collisione teorica:** Se in futuro qualcuno introducesse un “today” locale (es. per streak “giorno italiano”), streak e daily potrebbero divergere (es. “hai completato ieri” vs “oggi” in Italia vs UTC). Oggi non c’è: streak check-in usa lo stesso UTC.
- **Edge a cavallo mezzanotte:** La richiesta arriva a 23:59:59 UTC: day_key è ancora “oggi”; a 00:00:01 UTC il giorno dopo, day_key cambia. Comportamento corretto; nessuna correzione necessaria.

## 2.3 Edge case

- **Utente cambia timezone dispositivo:** Il client non invia timezone al server; day_key è sempre calcolato server-side in Edge. Quindi **nessun impatto** su claim/reset. L’unica cosa che “cambia” è l’ora locale mostrata in eventuale countdown (es. “tra 5 ore”): il valore numerico può cambiare, ma la scadenza reale (mezzanotte UTC) no.
- **Utente cambia ora telefono (clock spoof):** Il client, se usasse solo ora locale per “oggi”, sarebbe manipolabile. Oggi getTodayKey() è UTC, quindi l’ora del telefono non cambia il risultato di toISOString()… **Falso**: in JavaScript `new Date()` usa l’orario di sistema. Se l’utente mette il telefono a “domani”, `new Date().toISOString()` restituisce “domani” UTC. Quindi **il client è spoofabile** per tutto ciò che dipende da getTodayKey() lato client (es. “è un nuovo giorno?” in isNewDay()). Per il **nuovo engine** la regola è: **nessuna decisione “è oggi?” / “nuovo giorno?” in base a dati client**. Solo server (day_key da Edge/DB) deve decidere finestra e reset. Il client può mostrare un countdown “alla prossima mezzanotte UTC” calcolato in JS, ma non deve mai decidere se la missione è “ancora di oggi” o “già di domani”.
- **Due dispositivi:** Stesso user: entrambi chiamano Edge; day_key è UTC su server; una run per (user_id, day_key, mission_id). Comportamento corretto.
- **App aperta prima di mezzanotte e lasciata aperta oltre:** Lo stato “missione del giorno” deve essere **ristampato** da server (es. refetch useMissionOfTheDay o nuovo endpoint). Se l’UI si basasse solo su uno snapshot “mission_id + day_key” preso al mount, dopo mezzanotte mostrerebbe ancora la missione “vecchia”. Obbligatorio: **refetch periodico o al focus** per aggiornare day_key/missione e nascondere/mostrare countdown e “nuova missione”.
- **Background e riapri:** Idem: al resume, refetch stato daily da server; non fidarsi di cache client oltre alla sessione.
- **Offline:** Senza rete non si può claimare né sapere il day_key ufficiale. Comportamento accettabile: “Connettiti per vedere la missione del giorno” e nessun claim offline.

## 2.4 Raccomandazione finale

- **Sistema da adottare:** **UTC come unica source of truth** per day_key, reset, streak missioni, claim, Sunday.
- **Perché:** Coerenza server/client senza dipendere da timezone profilo; idempotenza e multi-device già corretti; meno bug e meno superficie di attacco (no trust client).
- **Problemi che risolve:** Allineamento client/server; nessuna divergenza “ieri/oggi” tra dispositivi; claim e reset deterministici.
- **Problemi che introduce:** Per utenti in fusi molto avanti/indietro, “mezzanotte” della daily non è la loro mezzanotte locale; possibile percezione “strana”.
- **Mitigazione:** (1) Copy esplicito: “La missione si aggiorna a mezzanotte UTC” o “Ogni giorno alle 00:00 (ora di riferimento)”. (2) Countdown: “Prossima missione tra X ore” calcolato come (next UTC midnight - now). (3) In fase successiva, se il prodotto lo richiede: campo `timezone` in profilo e, **solo per display** (es. “La tua mezzanotte è tra X ore”), usare quel timezone; **mai** usare timezone per decidere claim/reset/streak (restano UTC).

---

# 3. REWARD FLOW M1U + PE

## 3.1 Inventario attuale

**M1U – Percorsi:**

| Percorso | Dove | Note |
|----------|------|------|
| **creditM1USafe** | missionEngine, DailyMissionCard, DailyMissionContent, MissionPill | SAFE_MODE: append in `m1_daily_missions_pending_credits` (localStorage) + addPendingReward in missionState. **Nessun** write su DB. |
| **admin_credit_m1u (RPC)** | StreakModal, StreakWidget (fallback update m1_units su profiles) | Chiamata diretta da client con p_user_id, p_amount, p_reason. |
| **Edge claim-daily-phase** | Dopo insert in daily_mission_claims (idempotency_key), chiama `admin.rpc('admin_credit_m1u', { p_user_id, p_amount, p_reason })` | Solo per le 3 missioni server-real (cipher_drill, word_duel, signal_pattern). Idempotente: se claim già presente, restituisce amount già accreditato, non accredita due volte. |
| **Edge claim-marker-reward, claim-welcome-bonus, credit-m1u-purchase, stripe-webhook, spin-wheel** | Vari | Stesso RPC admin_credit_m1u; fuori scope daily. |

**PE – Percorsi:**

| Percorso | Dove | Note |
|----------|------|------|
| **useAwardPE** | StreakModal (DAILY_LOGIN), StreakWidget (DAILY_LOGIN), PulseBreaker, BattleCreationForm, useMapTimeTracking, useIntelAnalyst, useForum, BuzzMapButtonSecure, useBuzzHandler, OnboardingOverlay | RPC `award_pulse_energy` + optional `check_pe_daily_limit` + `record_pe_daily_action`. |
| **DAILY_MISSION** | Definito in useAwardPE: PE_VALUES.DAILY_MISSION = 50, PE_DAILY_LIMITS.DAILY_MISSION = 1 | **Nessuna chiamata** `awardPE('DAILY_MISSION', ...)` nel codebase al completamento di una daily. Solo DAILY_LOGIN è usato (StreakModal/StreakWidget). |
| **peCreditEvent / GlobalPERewardOverlay** | Dopo award PE, dispatch `pe-credit-event` con delta; overlay fullscreen | Già usato per altri tipi; funzionerebbe per DAILY_MISSION se awardPE('DAILY_MISSION') fosse chiamato. |

## 3.2 Percorsi reali per il nuovo engine

- **M1U:** Unica via sicura: **Edge** (claim-daily o analoga) che (1) valida run/day_key/tentativi, (2) inserisce in `daily_mission_claims` con idempotency_key, (3) chiama `admin_credit_m1u`. Il client **non** deve mai chiamare admin_credit_m1u per reward daily; solo Edge con service_role.
- **PE:** Due opzioni: (A) **Edge** che, dopo aver scritto il claim M1U, chiama una RPC tipo `award_pulse_energy` (o la stessa award_pulse_energy con p_reason = 'DAILY_MISSION') in contesto service_role; (B) **Client** che, dopo risposta positiva dell’Edge (reward_awarded: true), chiama `awardPE('DAILY_MISSION')`. (A) è più robusta (un solo round-trip, nessun rischio “claim ok ma PE fallito” lato client); (B) riusa il flusso esistente ma richiede due round-trip e gestione “claim ok, PE fallito”. **Raccomandazione:** (A) — Edge accredita sia M1U sia PE nella stessa transazione logica; il client riceve “reward_awarded: true, amount_m1u: X, amount_pe: Y” e può mostrare overlay/animazione senza chiamare useAwardPE. Se l’Edge non può chiamare award_pulse_energy (RLS/permessi), allora (B) con retry e idempotenza lato RPC (record_pe_daily_action già limita 1/giorno per DAILY_MISSION).

## 3.3 Idempotenza

- **daily_mission_claims:** UNIQUE(idempotency_key). buildIdempotencyKey(userId, dayKey, missionId, phase). Prima di accreditare M1U, Edge fa SELECT su idempotency_key; se esiste, restituisce 200 con amount già dato, senza ri-accreditare. **Solido.**
- **Retry / double tap / app reopen:** Stesso idempotency_key → stesso risultato; nessun doppio accredito.
- **Race condition:** Due richieste contemporanee stesso user/day/mission/phase: la prima INSERT claim + credit; la seconda INSERT fallisce (UNIQUE) o SELECT vede già il claim e restituisce success con amount. Nessun doppio credito se la logica Edge è “check claim → insert claim → credit” in sequenza (o transazione).

## 3.4 Raccomandazione finale

- **Flusso enterprise corretto:**  
  (1) Client invia “complete_phase” (o equivalente) con identificatori run/day/mission; (2) Edge calcola day_key UTC; (3) Edge valida run, tentativi, stato; (4) Edge verifica idempotency_key in daily_mission_claims; (5) se già presente → 200 con reward_awarded: true, amount come già salvato; (6) se assente → INSERT daily_mission_claims, admin_credit_m1u, e (opzione A) chiamata RPC award_pulse_energy per PE DAILY_MISSION da Edge, oppure (opzione B) risposta al client che invoca awardPE('DAILY_MISSION'); (7) risposta unica con reward_awarded, amount_m1u, amount_pe.  
- **Nuove tabelle/campi:** Non strettamente necessari; daily_mission_claims e runs già sufficienti. Se si vuole tracciare “PE dato per questa daily” in modo esplicito, si può aggiungere una colonna amount_pe su claims o un log separato; altrimenti il limite 1/giorno DAILY_MISSION in record_pe_daily_action è sufficiente.  
- **Nuova Edge dedicata:** Possibile estendere claim-daily-phase per “tutte” le missioni del nuovo engine (template_id, ecc.) e lì includere award PE; oppure una nuova “claim-daily-reward” che riceve run_id/day_key e fa solo claim + M1U + PE. Evitare due Edge separate (una per run, una per reward) per non complicare idempotenza.

---

# 4. SOURCE OF TRUTH / TRANSIZIONE

## 4.1 Collisioni col vecchio sistema

**File/hook che leggono stato daily da localStorage (missionState):**

- `src/missions/missionState.ts` — getMissionState(), getTodayKey(), isPhase2Available(), ecc.
- `src/missions/missionEngine.ts` — getMissionState(), getEngineState()
- `src/missions/DailyMissionsController.tsx` — getMissionState(), getEngineState()
- `src/missions/ui/MissionPill.tsx` — getMissionState()
- `src/missions/ui/MissionActionsModal.tsx`, Phase2ResumeModal, MissionCompletionModal — missionState in props (da Controller)
- `src/components/feedback/DailyMissionCard.tsx` — getMissionState()
- `src/components/feedback/DailyMissionContent.tsx` — getMissionState()
- `src/components/feedback/NextActionContainer.tsx` — getMissionState()
- `src/components/feedback/NextActionContent.tsx` — getMissionState()

**File che usano creditM1USafe (reward client):**

- missionEngine.ts, DailyMissionCard.tsx, DailyMissionContent.tsx, MissionPill.tsx

**File che usano server-real (claimDailyPhase + runs):**

- CipherDrillModal, WordDuelMemoryModal, SignalPatternNumbersModal — chiamano claimDailyPhase; **non** usano creditM1USafe per quelle 3 missioni; leggono ancora missionState per stato locale (es. phase) in parte.

**Doppi percorsi:**

- DailyMissionCard e useMissionOfTheDay usano **mission_id** da server (daily-mission-today) ma **phase e completamento** da getMissionState() (localStorage) per tutte le missioni; per le 3 server-real i modal dedicati bypassano il flusso “complete Phase 1/2” della card e usano claimDailyPhase. Quindi: stessa “missione del giorno” può essere mostrata in card con stato localStorage **oppure** aperta in Cipher/WordDuel/Signal con stato server. **Collisione:** se l’utente apre la card e vede “Phase 1” (localStorage) ma la missione è cipher_drill, potrebbe avere stato diverso su server (es. già phase 2).  
- NextActionContainer/NextActionContent e DailyMissionCard mostrano “Daily Mission” in base a getMissionState(); il Controller (DailyMissionsController) mostra Briefing/Phase2Resume in base a getEngineState() (stesso missionState). Tutti leggono localStorage.

## 4.2 Strategia di migrazione più sicura

- **Opzione 1 – Hide UI totale:** MISSIONS_ENABLED = false (o feature flag “daily_engine_v2”) nasconde: DailyMissionsController (no briefing/phase2), MissionPill, card Daily in NextAction e in Home (DailyMissionCard), e qualsiasi link “Daily Mission”. Le 3 modali server-real (Cipher, WordDuel, Signal) non vengono mai aperte perché la “missione del giorno” non è più mostrata. **Pro:** Zero collisione. **Contro:** Per un periodo nessuna daily visibile; utenti non vedono nulla fino al rilascio del nuovo engine.
- **Opzione 2 – Feature flag hard su “solo nuovo engine”:** Flag “use_daily_engine_v2”. Se true: (1) stessi entrypoint (card/pill/next action) ma il contenuto viene da un nuovo componente che **solo** legge da API/Edge (stato run, day_key, template); (2) nessuna chiamata a getMissionState(), startMission(), completePhase1/2(), creditM1USafe; (3) DailyMissionsController non monta modali legacy; (4) MissionPill e card mostrano “Daily” ma cliccando si apre il flusso nuovo (solo server). **Pro:** UX continua (sempre un “Daily” visibile). **Contro:** Bisogna duplicare entrypoint e assicurarsi che nessun path chiami ancora missionState/creditM1USafe quando flag = true.
- **Opzione 3 – Switch su endpoint:** Il client chiama un endpoint “daily/status” che restituisce { engine: 'v1' | 'v2', ... }. Se v2, tutta l’UI daily usa solo dati da API v2; se v1, comportamento attuale. Stessa idea dell’opzione 2 ma la scelta è server-driven (rollout per user o A/B).

**Raccomandazione:** **Opzione 1 per Fase 0** (nascondere tutto) finché il nuovo engine non è pronto in staging; poi **Opzione 2** con feature flag “daily_engine_v2”: un solo branch UI che, se flag true, non importa missionState/creditM1USafe e non monta Controller legacy; legge solo da hook/API del nuovo engine. **Zero giorni** in cui lo stesso schermo mostri sia “completa Phase 1” (localStorage) sia “missione server”: quando il flag è true, il vecchio codice daily non viene eseguito.

## 4.3 Raccomandazione finale

- **Strategia più sicura:** Fase 0 = hide UI (MISSIONS_ENABLED false o flag hide_daily_ui). Fase 1 = feature flag “daily_engine_v2”: entrypoint (card/pill/next action) esistono ma il contenuto è un **solo** albero di componenti che legge esclusivamente da server (nuovo hook/API); nessun getMissionState(), nessun creditM1USafe, nessun DailyMissionsController con modali legacy. Lista file da toccare per il flag: App.tsx (no mount DailyMissionsController se v2), componenti che rendono MissionPill e DailyMissionCard e NextActionContainer (condizione: se v2 allora render <DailyEngineCard /> o simile, altrimenti legacy). Non fare “doppia UI temporanea” sullo stesso schermo.

---

# 5. SUNDAY SUPER REWARD

## 5.1 Lifecycle ideale

- **Stati:** (1) **available** — utente ha diritto (es. ha completato la daily domenica o condizione prodotto); (2) **shown** — modale aperta, timer 60s avviato; (3) **expired** — 60s trascorsi o utente ha chiuso; (4) **consumed** — indizio “consumato” (opzionale, se l’indizio è un oggetto spendibile). Per “1 indizio gratuito” e “60s per leggerlo”, gli stati minimi sono: available → (on open) → shown → (60s or close) → expired. “Consumed” può coincidere con “expired” se l’indizio è solo visivo.
- **Trigger:** Dopo login, quando l’utente è su una route “home” o la prima route autenticata; **un solo** check per sessione (o per day_key): “oggi è domenica UTC? Sunday clue available per questo user?”. Se sì e stato server = available, mostrare modale full-screen; poi segnare su server “shown_at” (timestamp) così non si riapre.
- **Persistenza:** Server. Tabella o colonna tipo `user_sunday_clue` (user_id, day_key, status: available | shown, shown_at timestamptz). Oppure in `profiles` o in una tabella “daily_engine_state” con JSONB. La regola: “available” solo se (day_key is Sunday AND non c’è ancora shown_at per quel day_key). Dopo apertura modale, client chiama Edge “sunday_clue_shown” con day_key; Edge scrive shown_at e status; alle successive richieste “sunday_clue_status” l’Edge restituisce “already_shown” e il client non mostra nulla.

## 5.2 Rischi

- **Doppia apertura:** Se il client mostra la modale senza aver ancora ricevuto la risposta “sunday_clue_shown”, e l’utente chiude l’app o va in background, al ritorno potrebbe rifare il check e ricevere ancora “available” (race). **Mitigazione:** Client, prima di mostrare, chiama Edge “sunday_clue_mark_showing” (ottimistic lock) che imposta shown_at; poi mostra modale; se la modale si chiude (60s o tap), chiamata “sunday_clue_mark_shown” ridondante ok idempotente. Oppure: client mostra solo dopo aver ricevuto 200 da “mark_showing”, così il server è già aggiornato.
- **Kill app / logout-login:** Se non si è ancora chiamato “mark_shown”, al prossimo open il server ha ancora “available”. Soluzione: “mark_showing” (o “mark_shown”) viene chiamato **all’apertura della modale** (prima dei 60s), così anche in caso di kill non si riapre.
- **Timer 60s con app in background:** Il timer JS si ferma; al resume potrebbero essere passati >60s reali. Scelta: (1) Timer solo client: al resume, se “now - shown_at > 60” (con shown_at da server), chiudi e segna expired; (2) Timer server: il client invia “open_at” e il server risponde “you have until open_at+60”; il client chiude quando now > open_at+60. La (1) richiede che il client conosca shown_at (restituito da “mark_showing”); allora al resume si può controllare Date.now() vs shown_at + 60s e chiudere. **Raccomandazione:** Timer client con “shown_at” da server; al mount della modale si salva openAt = Date.now() (o server restituisce server_time); al resume si confronta con 60s e si chiude se scaduto.
- **Offline:** Se l’utente è offline non può ricevere “available” né chiamare “mark_shown”. Non mostrare la modale; mostrare quando torna online e il check viene rifatto (es. al focus).

## 5.3 Precondizioni

- Day_key server è domenica (getDayKeyUtc(), poi check giorno settimana 0 = Sunday in JS: getUTCDay() === 0).
- Condizione diritto: definita (es. “ha completato la daily di domenica” oppure “solo aver aperto l’app di domenica”). Se “solo aperto”, allora tutti gli utenti che aprono di domenica vedono il modale una volta.
- Schema server per “sunday_clue” (user_id, day_key, shown_at, opzionale payload indizio).
- Hook univoco: un solo punto in App (dopo auth) o nella route Home che (1) fa fetch “sunday_clue_status”, (2) se available e oggi è domenica, chiama “mark_showing”, (3) mostra modale; (4) onClose o onTimerEnd chiama “mark_shown” (idempotente).
- Modale: MapPillFlipOverlay o equivalente full-screen; contenuto = indizio + countdown 60s; chiusura a 0 o tap “Chiudi”.

## 5.4 Raccomandazione finale

- **Implementabile in modo sicuro:** Sì, con stato e transizioni su server e “mark_showing” all’apertura.
- **Architettura:** Edge “sunday_clue_status” (GET) e “sunday_clue_mark_showing” (POST, idempotente per user_id+day_key); tabella/riga per (user_id, day_key); timer 60s client con open_at; al resume controllo scadenza.
- **Edge case critici:** Race mark_showing (usare unique constraint su user_id+day_key e INSERT o UPDATE condizionale); doppia apertura (sempre chiamare mark_showing prima di mostrare); timer in background (chiudi al resume se now > open_at+60).
- **Precondizioni prima di implementare:** Definire condizione “diritto” (solo domenica + aperto app, oppure completato daily domenica); schema DB o estensione profilo; convenzione nome Edge e payload.

---

# 6. ANTI-CHEAT MINIMO

## 6.1 Threat model minimale

- **Doppio tap / retry:** L’utente invia due volte “complete” per la stessa missione/fase. **Mitigazione:** idempotency_key in daily_mission_claims; seconda richiesta restituisce 200 con stesso amount, nessun secondo accredito.
- **Multi-device:** Stesso user completa su due device lo stesso giorno. **Mitigazione:** Una run per (user_id, day_key, mission_id); un claim per (user_id, day_key, mission_id, phase). Il secondo device può “vedere” che è già completato ma non può claimare di nuovo.
- **Cambio ora telefono:** L’utente cambia data/ora per “avere un altro giorno”. **Mitigazione:** day_key **sempre** calcolato server-side in Edge; client non invia day_key per decisioni di claim; client può inviare client_day_hint per log ma Edge ignora per la logica.
- **Race condition:** Due richieste simultanee. **Mitigazione:** INSERT su daily_mission_claims con UNIQUE(idempotency_key); una delle due fallirà; l’altra restituirà success; non accreditare due volte.
- **Local cache stale:** Client crede “ho già completato” e non mostra più la missione, ma server non ha il claim. **Mitigazione:** UI deve riflettere sempre stato da server (refetch); non usare solo cache client per “completed”.
- **Duplicate Sunday reward / intel fragment / badge:** Ogni “unlock” deve avere un idempotency o unique (user_id, day_key, type). Sunday: (user_id, day_key); intel fragment: (user_id, fragment_id) o (user_id, day_key, fragment_index); badge: derivato da conteggio completamenti (read-only), non “claim” duplicabile.

## 6.2 Protezioni esistenti

- daily_mission_claims: idempotency_key UNIQUE; buildIdempotencyKey(userId, dayKey, missionId, phase).
- daily_mission_runs: UNIQUE(user_id, day_key, mission_id); insert/update solo da Edge (RLS).
- day_key in Edge: getDayKeyUtc(), nessun trust del client.
- PE: check_pe_daily_limit e record_pe_daily_action per limite 1/giorno per action type.

## 6.3 Protezioni mancanti

- **Max attempts per run:** Se la missione ha “3 tentativi”, l’Edge deve leggere attempts da run e rifiutare complete dopo il terzo. Oggi per Signal Pattern c’è “win/fail” ma non un “max_attempts” esplicito su run; da introdurre se il design lo prevede.
- **Validazione “run esiste e è in stato completabile”:** Già presente (run not found, phase già completed).
- **Rate limit per action:** Non c’è un rate limit “max N claim-daily-phase per user per minuto”. Opzionale per MVP; consigliato in fase successiva per limitare abusi.

## 6.4 Minimo obbligatorio MVP

- Idempotency_key su ogni claim reward (M1U e, se gestito lato server, PE).
- day_key sempre da server; nessun parametro client usato per “è oggi?”.
- Transizioni run (phase, status) solo da Edge; client non può forzare phase.
- Sunday: unique (user_id, day_key) per “shown”; un solo mark_showing/mark_shown per day.
- (Opzionale ma consigliato) max_attempts per run e rifiuto completo oltre il limite.

---

# 7. BADGE RING AVATAR

## 7.1 Componenti coinvolti

- **Home / Header:** `HomeHeader` → `ProfileDropdown` → `ProfileAvatar`. Nessun ring attorno all’avatar in Home; ProfileAvatar ha solo `border-2 border-[#00D1FF]/30`.
- **MainLayout (altre route):** Header con `DropdownMenu` → `DropdownMenuTrigger` con `<span className="profile-custom-ring">` che avvolge l’Avatar. La classe `profile-custom-ring` è un wrapper; non c’è uno stile “badge” missioni.
- **ProfileInfo (pagina profilo):** Ring subscription: `getSubscriptionRingColor(subscriptionPlan)`, `ring-2 ring-offset-2`, colore dinamico; Avatar con `border-2 border-cyan-500`. Qui il ring è “piano subscription”, non missioni.
- **ProfilePage:** Avatar con `ring-2 ring-[#00D1FF]`; nessun badge missioni.
- **ProfileAvatar:** Componente “puro”: solo Avatar + border; nessuna logica ring subscription o badge.

## 7.2 Rischi UI

- **Sovrapposizione ring:** Se in Home si aggiunge un ring “badge” e in futuro lo stesso ProfileAvatar viene usato con ring subscription, servono due layer (subscription + badge) o priorità. In Home oggi **non** c’è subscription ring; il ring subscription è solo in ProfileInfo. Quindi in Home si può aggiungere **solo** il ring badge senza conflitto. In ProfileInfo si potrebbe in futuro mostrare “subscription ring + badge ring” (doppio anello o anello esterno badge); da progettare allora.
- **Safe area / click target:** Il ring non deve ridurre l’area cliccabile dell’avatar (44pt iOS). Meglio un ring “esterno” (ring-offset) o un wrapper che non restringa il touch target.
- **Performance:** Un solo componente BadgeRing che legge livello da props o da hook (profiles o API) non impatta; evitare refetch continui.

## 7.3 Approccio consigliato

- **Componente riutilizzabile `BadgeRing`:** Riceve `level: 'none' | 'bronze' | 'silver' | 'gold' | 'elite'` e (opzionale) `className`. Renderizza un `div` assoluto con `inset-0 rounded-full` e stile (bordo/ombra) in base a level; `pointer-events-none` per non bloccare tap. Wrapper: `<div className="relative"><BadgeRing level={...} /><Avatar ... /></div>`.
- **Dove usarlo:** In **Home** dentro ProfileDropdown: avvolgere ProfileAvatar con un wrapper che include BadgeRing. Il livello badge viene da hook/API (conteggio completamenti daily → 10/30/60/100 → bronze/silver/gold/elite). MainLayout e ProfileInfo **non** modificati in MVP; eventuale “badge anche in profilo” in fase successiva con stesso BadgeRing.
- **Priorità con ring subscription:** In Home non c’è subscription ring; nessun conflitto. Se in futuro si aggiunge badge anche in ProfileInfo, si può rendere BadgeRing “esterno” (ring-offset maggiore) rispetto al ring subscription così sono due anelli distinti.
- **Implementazione senza sporcare:** BadgeRing in `src/components/gamification/BadgeRing.tsx` (o `src/components/profile/BadgeRing.tsx`); ProfileDropdown (o HomeHeader) passa `badgeLevel` a un wrapper che usa BadgeRing + ProfileAvatar. ProfileAvatar resta invariato; nessun cambio a MainLayout o ProfileInfo per MVP.

---

# 8. i18n ARCHITECTURE

## 8.1 Stato attuale

- **Struttura:** Un solo file per lingua: `src/locales/{it,en,fr}/common.json`. Tutte le chiavi in un unico JSON piatto (o annidato con oggetti, es. welcome_bonus.*). Namespace unico “common” (o default).
- **Chiavi daily/streak esistenti:** `home_daily_new_mission`, `home_daily_phase1_in_progress`, `home_daily_phase2_tomorrow`, `home_daily_phase2_ready`, `home_daily_mission_active`, `home_daily_title`; `streak_title`, `streak_subtitle`, …; `daily_mission.badge_new`, `daily_mission.phase_1`, `daily_mission.title`, ecc. Pattern: prefisso tematico (`home_daily_`, `streak_`, `daily_mission.*`).
- **Uso:** `useTranslation()` → `t('key')`; interpolazione con `{{var}}` (es. `leaderboard_streak_days`: "{{count}}d streak").

## 8.2 Problemi

- **Flat molto grande:** common.json ha centinaia di chiavi; aggiungere decine di chiavi “daily engine” in flat aumenta il rumore. Meglio raggruppare sotto un prefisso univoco.
- **Rischio chiavi duplicate:** Se si usano nomi generici (es. `timer`, `expired`) senza prefisso, si può sovrascrivere o confondere con altri contesti.
- **Lunghezze IT/EN/FR:** Copy di lunghezza molto diversa possono rompere layout (bottoni, modali). Prevedere testing su tutte e tre le lingue.
- **Fallback:** Verificare che i18n sia configurato con fallback (es. en se manca it) per non mostrare key raw.

## 8.3 Struttura consigliata per il nuovo engine

- **Prefisso/namespace:** `daily_engine.*` (o `daily_mission_v2.*`) per tutte le stringhe del nuovo sistema. Es.: `daily_engine.timer_expires`, `daily_engine.states.completed`, `daily_engine.near_miss`, `daily_engine.sunday.title`, `daily_engine.sunday.cta_close`, `daily_engine.intel.fragment_collected`, `daily_engine.badges.bronze`, `daily_engine.agent_status.active`, `daily_engine.weekly.mon`, ….
- **Gruppi:**  
  - **timer / countdown:** `daily_engine.timer_expires_utc`, `daily_engine.next_mission_in`.  
  - **states:** `daily_engine.state.not_started`, `daily_engine.state.in_progress`, `daily_engine.state.completed`, `daily_engine.state.failed`, `daily_engine.state.near_miss`.  
  - **near_miss:** `daily_engine.near_miss.message`, `daily_engine.near_miss.cta`.  
  - **sunday:** `daily_engine.sunday.title`, `daily_engine.sunday.body`, `daily_engine.sunday.cta_close`, `daily_engine.sunday.countdown`.  
  - **intel:** `daily_engine.intel.fragments_collected`, `daily_engine.intel.file_unlocked`.  
  - **badges:** `daily_engine.badge.bronze`, `daily_engine.badge.silver`, `daily_engine.badge.gold`, `daily_engine.badge.elite`.  
  - **agent_status:** `daily_engine.agent_status.active`, `daily_engine.agent_status.inactive`.  
  - **weekly:** `daily_engine.weekly.mon` … `sun` (o abbreviazioni).  
  - **errors / retry:** `daily_engine.error.claim_failed`, `daily_engine.error.retry`.
- **Convenzioni:** (1) chiavi in snake_case o camelCase coerente; (2) variabili in doppia graffa `{{var}}`; (3) nessuna stringa hardcoded in componenti daily engine; (4) ownership: tutte le nuove stringhe daily engine in un blocco commentato “DAILY ENGINE v2” in common.json o in un file dedicato `dailyEngine.json` e namespace `dailyEngine` se il progetto supporta più file.

## 8.4 Raccomandazione finale

- **Stato attuale:** Un namespace, chiavi piatte con prefissi; pattern `daily_mission.*` e `streak_*` già usati; interpolazione `{{var}}` funziona.
- **Problemi:** Flat grande; rischio duplicati; lunghezze diverse tra lingue.
- **Struttura consigliata:** Prefisso `daily_engine.*` (o file `dailyEngine.json` con namespace); gruppi timer, states, near_miss, sunday, intel, badges, agent_status, weekly, errors; convenzione naming e blocco commentato per ownership.

---

# 9. ALTRE VERIFICHE NECESSARIE

1. **Delete account e CASCADE su daily_mission_*:** Già verificato: daily_mission_runs e daily_mission_claims hanno FK auth.users ON DELETE CASCADE. La procedura delete-account non deve essere modificata; le righe scompaiono con l’utente. **Criticità:** Alta per compliance. **Blocca implementazione:** No; già ok.
2. **RPC check_pe_daily_limit e record_pe_daily_action:** Esistono e sono usati da useAwardPE. Se il nuovo engine accredita PE da Edge, verificare che l’Edge possa chiamare le stesse RPC (o equivalente service_role) per DAILY_MISSION e che il limite 1/giorno sia rispettato. **Criticità:** Alta. **Blocca:** Sì, se l’Edge non può registrare PE daily; va chiarito prima.
3. **Punto di mount univoco per “primo screen” post-login:** Per Sunday e per “refetch daily status al focus”, serve un punto unico (es. App dopo auth, o prima route “home”). Verificare che non ci siano più “home” (es. CommandCenterHome vs AppHome) che montano in ordine diverso e generino doppio check. **Criticità:** Media. **Blocca:** No; si può definire in implementazione.
4. **Ordine di show modali (Sunday vs RewardZone vs Norah vs altro):** Esistono RewardZonePopup, NorahProactiveManager, micro-missions, StreakModal, ecc. Definire priorità: es. Sunday clue prima di RewardZone, o dopo. Evitare due full-screen insieme. **Criticità:** Media. **Blocca:** No; si risolve con entityOverlayStore o ordine di mount.
5. **Test su dispositivo iOS reale (Capacitor):** Timer 60s, modali full-screen, safe area, keyboard. **Criticità:** Alta per UX. **Blocca:** No per iniziare; sì per release.
6. **Convenzione “client_day_hint” in claim-daily-phase:** Oggi il body può avere `client_day_hint`; l’Edge non lo usa per la logica. Mantenere: solo per log/audit; mai per decisioni. **Criticità:** Bassa. **Blocca:** No.

---

# 10. VERDETTO FINALE

## READY WITH CONDITIONS

**Motivazione:**

- **Cosa è pronto:** Timezone/day_key sono già UTC ovunque (client e server); idempotenza claim è solida; schema runs/claims e RLS sono adatti; pattern modali full-screen (MapPillFlipOverlay) e i18n IT/EN/FR con prefissi esistono; avatar in Home è identificato e integrabile con un BadgeRing senza toccare ProfileInfo/MainLayout.
- **Condizioni obbligatorie prima di scrivere codice:**  
  1. **Documento decisione timezone:** Formalizzare “UTC unica source of truth” e copy/countdown (mezzanotte UTC).  
  2. **Contratto Edge reward:** Definire che una sola Edge (claim-daily o estesa) accredita M1U + PE (DAILY_MISSION) in modo idempotente; verificare che l’Edge possa chiamare award_pulse_energy (o RPC equivalente) con limite 1/giorno.  
  3. **Schema e flusso Sunday:** Tabella o riga (user_id, day_key, shown_at); Edge “sunday_clue_status” e “sunday_clue_mark_showing”; regola “mark_showing prima di mostrare modale”.  
  4. **Feature flag e lista componenti da nascondere:** Elenco preciso di componenti/hook da disabilitare quando daily_engine_v2 è attivo (DailyMissionsController, MissionPill, DailyMissionCard, NextAction daily, getMissionState/creditM1USafe in quel flusso).  
  5. **Convenzione i18n:** Prefisso `daily_engine.*` e gruppi chiavi; nessuna stringa hardcoded nel nuovo codice.

- **Non si può considerare “READY FOR IMPLEMENTATION” senza riserve** perché: (A) l’integrazione PE da Edge (award_pulse_energy da service_role) va confermata; (B) lo schema Sunday e il flusso “mark_showing” devono essere scritti nero su bianco; (C) il feature flag e i punti di disaccoppiamento dal vecchio sistema devono essere identificati per nome file/componente.

- **Non è “NOT READY”** perché: le fondamenta (UTC, idempotenza, DB, RLS, CASCADE, pattern UI e i18n) ci sono; le condizioni sopra sono chiare e risolvibili in pochi giorni di design/documentazione prima di iniziare l’implementazione.

**Raccomandazione operativa:**  
Completare le 5 condizioni sopra (documento timezone, contratto Edge M1U+PE, schema/flusso Sunday, lista componenti + feature flag, convenzione i18n); poi avviare Fase 0 (hide UI) e subito dopo sviluppo del nuovo engine con source of truth server, reward solo da Edge, e UI che non tocca missionState/creditM1USafe.

---

*Report read-only; nessuna modifica applicata a codice, DB, Edge, i18n o UI.*
