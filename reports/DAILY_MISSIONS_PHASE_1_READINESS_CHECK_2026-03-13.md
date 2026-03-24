# FASE 1 — READINESS CHECK CHIRURGICO — NEW DAILY MISSION ENGINE MVP

**Data:** 2026-03-13  
**Tipo:** Audit read-only, test coverage logica, GO/NO GO reale  
**Scope:** M1SSION™ iOS wrapped app only — verifica pre-Fase 2  
**Riferimento:** Architecture Lock Fase -1, Fase 1 Core Engine MVP Report

---

# 1. EXECUTIVE SUMMARY

## Giudizio reale sulla Fase 1

La Fase 1 consegna un **core engine server-driven funzionante** (day_key, mission_id, run, claim, M1U+PE idempotenti, UI v2, refetch, countdown) e rispetta in gran parte l’Architecture Lock. Restano **gap concreti** su: (1) convivenza con il legacy nei modali condivisi (missionState/localStorage), (2) disallineamento tra ciclo server (18 mission_id) e UI (3 supportate), (3) ciclo attuale non allineato al target prodotto 7 missioni settimanali Lun–Dom, (4) refetch non agganciato al resume nativo iOS.

## Cosa è buono

- **Server-first per decisioni critiche:** missione del giorno e day_key da daily-mission-today; run creata/letta da server; reward (M1U + PE) solo da Edge; idempotenza claim verificata in codice.
- **Separazione UI:** MISSIONS_ENABLED = false; card v2 attiva solo con DAILY_ENGINE_V2_ENABLED; nessuna doppia UI legacy+v2 sullo stesso schermo.
- **UTC e countdown:** day_key server in UTC; countdown client solo informativo (getNextUtcMidnight); nessuna decisione “oggi” presa dal client.
- **Flusso utente utilizzabile:** quando mission_id è uno dei 3 supportati, card → modale → run → reward è coerente; stati (non iniziata / phase 1 / phase 2 / completata) e CTA allineati allo stato run da server.
- **Base estensibile:** il flusso fetch today → read run → open modal → claim è generico; in Fase 2 si può cambiare la logica di selezione (weekday → 7 template) e aggiungere mission_id/template_id senza rifare il pipeline.

## Cosa è dubbio

- **Modali condivisi scrivono ancora in missionState (localStorage):** CipherDrillModal, WordDuelMemoryModal, SignalPatternNumbersModal chiamano startMission(), completePhase1(), completePhase2(), markPhase1Credited(), markPhase2Credited(). L’Architecture Lock richiede “zero convivenza” (nessun uso di getMissionState/startMission/completePhase/creditM1USafe sul percorso v2). Il reward non passa da localStorage (OK), ma lo stato locale sì: **violazione parziale** della regola 6.
- **~83% dei giorni la card mostra “Missione non disponibile in-app”:** il ciclo server ha **18** mission_id (commento nel codice dice “15” ma l’array ha 18 elementi); solo 3 sono supportati da claim-daily-phase e dalla card. L’utente vede spesso una daily non giocabile. Accettabile per MVP tecnico, **fragile** per percezione prodotto.
- **Refetch solo su focus/visibilitychange:** nessun listener Capacitor App (es. `App.addListener('appStateChange')`) per resume da background su iOS. Su WKWebView, visibilitychange può non essere affidabile quando l’app torna da background. **Copertura parziale** del requisito “refetch al focus/resume”.
- **Ciclo attuale ≠ target prodotto:** il target è 7 missioni a rotazione settimanale (Lun→Dom). Oggi la selezione è `epochDay % 18`, non weekday. Fase 2 dovrà sostituire la logica in daily-mission-today; il contratto (day_key, mission_id, run, claim) resta valido.

## GO / NO GO reale

**GO WITH CONDITIONS.** La base è solida per costruire il Mission Template System a 7 missioni (day_key, run, claim, idempotenza, UI v2 sono pronti). Le condizioni da accettare o correggere prima di considerare la Fase 2 “senza debito” sono: (1) allineare ciclo server alla visione 7 giorni o documentare esplicitamente il cambio in Fase 2; (2) decidere se eliminare l’uso di missionState nei modali quando aperti da v2 (o accettare la convivenza come rischio controllato); (3) valutare refetch su app resume nativo iOS.

---

# 2. ARCHITECTURE COMPLIANCE

## Server-first reale

| Aspetto | Stato | Note |
|--------|--------|------|
| Missione del giorno dal server | Sì | daily-mission-today fornisce day_key e mission_id; client non calcola “oggi” per decisioni. |
| Run/stato dal server | Sì | Run creata/aggiornata da claim-daily-phase; stato letto da daily_mission_runs (RLS). |
| Decisioni critiche sul client | Parziale | Il client non decide reward né day_key. I modali v2 chiamano ancora startMission/completePhase1/2 (missionState) per flusso interno: non per reward, ma per stato locale. |
| localStorage per stato/reward daily v2 | No reward, sì stato locale | Nessun creditM1USafe; reward solo da Edge. missionState (localStorage) è ancora scritto dai tre modali quando usati da v2. |

**Valutazione:** Quasi pulito; rischio: convivenza con missionState sul percorso v2.

## day_key / UTC

| Aspetto | Stato | Note |
|--------|--------|------|
| UTC come source of truth | Sì | day_key calcolato server-side (getDayKeyUtc); client non invia day_key per decisioni. |
| Countdown e refetch coerenti | Sì (con limite) | Countdown da getNextUtcMidnight (UTC); refetch su focus/visibilitychange; nessuna decisione basata sul countdown. |
| Punti di divergenza client/server | No | Il client non stabilisce “oggi” o “scaduto”; legge day_key e mission_id dalla risposta. |

**Valutazione:** Pulito.

## Reward contract

| Aspetto | Stato | Note |
|--------|--------|------|
| M1U e PE coerenti e idempotenti | Sì | claim-daily-phase: SELECT existingClaim prima di INSERT; se già claimato restituisce amount esistente; PE chiamato solo nel branch !existingClaim. |
| Flusso reward unico | Sì | Un’unica Edge (claim-daily-phase) per validazione, claim, admin_credit_m1u, award_pulse_energy. |
| Payload al client | Sì | Risposta con ok, reward_awarded, amount, amount_pe; modali emettono pe:awarded e emitPECreditEvent quando amount_pe > 0. |
| Retry / doppia azione / race | Gestiti | Idempotency_key su daily_mission_claims; doppio tap o retry restituiscono 200 con stesso amount, senza secondo accredito. |

**Valutazione:** Pulito.

## Legacy separation

| Aspetto | Stato | Note |
|--------|--------|------|
| MISSIONS_ENABLED | false | Confermato in missionsRegistry.ts. |
| Entrypoint legacy nel percorso v2 | No UI legacy | DailyMissionsController, MissionPill, card daily legacy non montati (MISSIONS_ENABLED false). |
| Dipendenze nascoste v2 → legacy | Sì, parziale | I tre modali usati dalla v2 importano e usano missionState (startMission, completePhase1/2, mark*Credited). Non usano creditM1USafe. |

**Valutazione:** Quasi pulito; convivenza limitata allo stato locale nei modali condivisi.

---

# 3. COMPATIBILITY WITH PHASE 2 (7 ROTATING MISSIONS)

## Quanto la Fase 1 è compatibile con i 7 template

- **Pipeline:** Il flusso “today → run → modal → claim” è indipendente dalla logica di scelta della missione. Sostituire in daily-mission-today `epochDay % 18` con “weekday → template_id / mission_id” mantiene invariati day_key, run, claim e UI card. **Compatibile.**
- **Contratto mission_id / template_id:** Oggi non esiste un’astrazione template_id; c’è solo mission_id (stringa) restituita dal server e mappata a 3 modali. Per 7 missioni si dovrà: (a) estendere daily-mission-today (es. weekday → mission_id o template_id), (b) estendere claim-daily-phase per accettare i nuovi mission_id, (c) aggiungere 4 (o 7) modali o una mappa template_id → componente. La Fase 1 non prevede template_id; è **hardcoded sui 3 mission_id** in Edge e in SUPPORTED_MISSION_IDS nella card. Estensione naturale: aggiungere ID e rami, non rifare il core.

## Rischi

- **Ciclo attuale fuori target:** 18 mission_id (commento “15” errato), 3 supportati. Per il prodotto “7 missioni Lun–Dom” il ciclo va rifatto in Fase 2; il rischio è solo di confusione se si assume che il ciclo attuale sia già “quasi” quello finale.
- **Modali condivisi:** Se in Fase 2 si aggiungono nuovi modali “puliti” (senza missionState) e si lasciano i tre attuali solo per i 3 mission_id esistenti, la convivenza resta confinata. Se si riusano gli stessi modali per altri template, l’uso di missionState andrebbe rimosso o isolato.

## Limiti

- **Mapping mission_id → UI:** Esplicito e chiuso (array SUPPORTED_MISSION_IDS + tre if per i modali). Per 7 template servirà una mappa o un registry, ma si tratta di estensione, non di cambio architettura.
- **Nessun template_id in API:** Le API attuali non espongono template_id o weekday; la Fase 2 dovrà introdurli dove serve (es. daily-mission-today che restituisce anche weekday o template_id per i 7 casi).

## Giudizio chiaro

La Fase 1 **è una base davvero utilizzabile** per il sistema a 7 missioni: day_key, run, claim, idempotenza e UI v2 sono pronti. Non è “solo una demo tecnica”: il core è solido. È però **ancora accoppiata ai 3 modali e al ciclo a 18**; Fase 2 richiederà sostituzione della logica di selezione e estensione della mappa mission_id → UI, senza stravolgere il pipeline.

---

# 4. USER FLOW READINESS

| Punto | Stato | Note |
|-------|--------|------|
| Card daily v2 nel posto giusto | Sì | In Next Action, sezione “Optional”, sopra/sotto VERA BOMB; visibile solo se DAILY_ENGINE_V2_ENABLED. |
| Card visibile solo quando serve | Sì | Montata solo con flag v2; per utente non autenticato l’hook non popola day_key/mission_id (loading poi unavailable). |
| CTA coerente con stato reale | Sì | Start / Continue / Complete Phase 2 / Completed derivano da run (phase, status) da server. |
| Modale corretto per mission_id | Sì | Apertura condizionata a missionId === MISSION_ID_*; i tre modali corrispondono ai 3 ID supportati. |
| mission_id non supportato | Gestito | Card mostra “Today's mission not available in-app” + “Resets at 00:00 UTC”; nessun tap che apre modale. Comportamento chiaro, non ingannevole. |
| Transizioni stato (non iniziata → P1 → P2 → completata) | Sì | statusLabel e CTA aggiornati in base a run.phase e run.status. |
| Reward in UI | Sì | M1U già gestiti dai modali (emitM1UCreditEvent); PE con amount_pe e emitPECreditEvent. |
| PE overlay | Sì | pe:awarded e emitPECreditEvent chiamati quando amount_pe presente; allineato al resto dell’app. |
| Refetch al focus/resume | Parziale | focus + visibilitychange presenti; nessun listener nativo Capacitor per app resume; su iOS potrebbe mancare un refetch al ritorno da background. |
| Countdown | Sì | “Resets at 00:00 UTC” e “Next in Xh Ym”; calcolo da getNextUtcMidnight; credibile e chiaro. |

**Giudizio flusso utente:** Accettabile/buono quando mission_id è supportato; fragile solo per la quota alta di giorni “non disponibile in-app” e per il refetch non garantito su app resume nativo.

---

# 5. TEST COVERAGE READINESS

(Solo copertura logica degli scenari; nessun test implementato.)

| Area | Copertura | Note |
|------|-----------|------|
| **Daily del giorno supportata** (mission_id supportato, card, modale, run, phase, reward) | Buona | Flusso implementato end-to-end; run e reward server-side; idempotenza claim. |
| **Daily del giorno non supportata** | Buona | Card mostra messaggio esplicito; nessun tap attivo; UX non ingannevole. Non bloccante per Fase 2. |
| **Retry / duplicate action** | Buona | Edge idempotente; client può ritentare; stesso 200 e stesso amount. |
| **Multi-device** | Buona | day_key e run su server; un claim per (user, day_key, mission_id, phase); secondo device riceve 200 con amount già dato. |
| **Cambio giorno / refetch** | Parziale | Refetch su focus/visibilitychange; a cavallo di mezzanotte UTC il refetch aggiorna day_key e mission_id se l’utente riporta il focus. Su iOS, app in background oltre mezzanotte: refetch potrebbe non scattare fino al successivo focus/visibility. |
| **Offline / rete lenta** | Debole | fetchDailyMissionToday e lettura run falliscono; card mostra “unavailable”. Nessun messaggio “Connettiti per vedere la missione” dedicato; comportamento comunque non ingannevole. |
| **Unsupported mission_id** | Buona | Mapping 18 → 3 esplicito; per i 15 non supportati la card mostra “unavailable_mission”; nessuna chiamata a claim-daily-phase con ID non valido. |

Riepilogo: **cosa è coperto** (flusso supportato, unsupported, retry, multi-device, idempotenza); **cosa è debole** (refetch da app resume iOS, copy offline); **cosa manca** (test automatici, verifica su dispositivo reale a cavallo di mezzanotte UTC).

---

# 6. RISK REVIEW

| Rischio | Livello | Motivo |
|---------|---------|--------|
| Costruire i 7 template sopra una base legata ai 3 modali | **Medio** | La base (API, run, claim) è generica; l’accoppiamento è nella mappa mission_id → modale. Aggiungere 4 (o 7) template richiede nuovi modali o refactor della mappa, non rifacimento del core. |
| Incoerenza mission_id / template_id in Fase 2 | **Medio** | Oggi non c’è template_id; Fase 2 dovrà definire se mission_id resta stringa “template” o si introduce un campo separato. Rischio di confusione in design, non di incompatibilità tecnica. |
| Rischio UX (molti giorni “non disponibile”) | **Medio** | ~83% dei giorni la card è non giocabile. Per MVP tecnico è accettabile; per rollout largo può essere percepito come “la daily non funziona”. |
| Debito tecnico (missionState nei modali v2) | **Medio** | Violazione parziale della regola “zero convivenza”. Se si riattiva il legacy (MISSIONS_ENABLED = true) in futuro, lo stato in localStorage scritto da v2 può creare confusione. Mitigazione: non riattivare il legacy senza pulire o separare i percorsi. |
| Refetch insufficiente su iOS | **Medio-basso** | visibilitychange può non essere affidabile quando l’app torna da background. Rischio: card non aggiornata fino al prossimo focus esplicito. |
| Regressioni FROZEN se Fase 2 parte da base non consolidata | **Basso** | La Fase 1 non tocca login, IAP, BUZZ, BUZZ MAP, push. Fase 2 che estende solo daily-mission-today e modali daily non intacca direttamente i flussi frozen. |

**Classificazione complessiva rischio passaggio a Fase 2:** **Medio.** La base è solida; i rischi sono estensibilità della mappa mission_id → UI, allineamento al modello 7 giorni, e (opzionale) pulizia convivenza missionState e refetch nativo.

---

# 7. WHAT MUST BE FIXED OR VERIFIED BEFORE PHASE 2

Solo i punti davvero necessari:

1. **Allineare ciclo server al target 7 missioni (o documentare)**  
   - **Perché:** Il prodotto vuole 7 missioni a rotazione Lun–Dom; oggi il ciclo è epochDay % 18 con 3 ID giocabili.  
   - **Blocca Fase 2?** No; Fase 2 può introdurre la logica weekday → template.  
   - **Mini-fase 1.5?** No; può essere fatto in Fase 2. Consigliato: documentare in Fase 2 che daily-mission-today passerà da “epoch % 18” a “weekday → 7 template”.

2. **Convivenza missionState nei modali v2**  
   - **Perché:** Architecture Lock richiede zero uso di getMissionState/startMission/completePhase sul percorso v2.  
   - **Blocca Fase 2?** No; il reward è server-only; il rischio è stato locale e possibile confusione se si riattiva il legacy.  
   - **Mini-fase 1.5?** Opzionale. Si può: (a) accettare la convivenza e andare in Fase 2, (b) in Fase 2 introdurre modali “puliti” per i nuovi template e lasciare i 3 attuali come sono, (c) rimuovere le chiamate a missionState quando il modale è invocato da v2 (richiede parametro “source” o contesto).

3. **Refetch su app resume (iOS)**  
   - **Perché:** Requisito “refetch al focus/resume”; su WKWebView il resume da background potrebbe non generare focus/visibilitychange.  
   - **Blocca Fase 2?** No.  
   - **Mini-fase 1.5?** No. Verifica su dispositivo reale; se necessario, aggiungere listener Capacitor App (es. appStateChange) in Fase 2 o in un fix mirato.

4. **Commento errato “15 mission IDs” in daily-mission-today**  
   - **Perché:** L’array ha 18 elementi; il commento è fuorviante per manutenzione.  
   - **Blocca Fase 2?** No.  
   - **Azione:** Correzione documentale (o di commento) in Fase 2 quando si tocca il ciclo.

Nessuno di questi punti è bloccante per avviare la Fase 2; sono correzioni o verifiche che riducono rischio e debito.

---

# 8. VERIFICATION BUILD / SYNC (READ-ONLY)

- Il report Fase 1 indica build **SUCCESS** (exit 0, ~4m 28s) e cap sync ios **eseguito** su dist/ valido. Coerente con l’assenza di modifiche strutturali fuori scope.
- La readiness **funzionale** non è garantita solo dal build: dipende da flusso server (daily-mission-today, claim-daily-phase), RLS su daily_mission_runs, e comportamento su dispositivo reale (refetch, mezzanotte UTC). Il report Fase 1 non sostituisce un test manuale su dispositivo iOS a cavallo di mezzanotte e dopo resume da background.
- **Conclusione:** Build/sync sono coerenti con il report; la readiness funzionale resta “verificata in codice” e andrebbe confermata con un check manuale mirato prima di considerare la Fase 2 completamente a rischio zero.

---

# 9. FINAL VERDICT

## GO WITH CONDITIONS

**Motivazione:**

- La Fase 1 **è una base solida e davvero utilizzabile** per il Mission Template System a 7 missioni: pipeline server-first (day_key, mission_id, run, claim), idempotenza, reward M1U+PE, UI v2 e separazione dal legacy sono in posto. Non è una demo tecnica fine a sé stessa.
- Si può **procedere con la Fase 2** senza correzioni obbligatorie, a patto di **accettare condizioni**:
  1. In Fase 2 sostituire esplicitamente la logica di selezione missione (da epoch % 18 a weekday → 7 template) e allineare daily-mission-today al target prodotto.
  2. Decidere come gestire l’uso di missionState nei tre modali (accettare convivenza, isolare i nuovi template, o rimuovere le scritture quando invocati da v2).
  3. Valutare su dispositivo iOS il refetch a cavallo di mezzanotte UTC e dopo resume da background; aggiungere se necessario un listener nativo per app resume.

**NO GO** sarebbe stato giustificato solo se il core non fosse estensibile o se ci fossero errori critici su reward o idempotenza. Non è il caso.

**GO FOR PHASE 2** senza condizioni sarebbe stato giustificato solo con ciclo già allineato ai 7 giorni, zero uso di missionState sul percorso v2, e refetch garantito su resume. Non ancora raggiunto.

Quindi: **GO WITH CONDITIONS** — procedere con Fase 2 è tecnicamente e architetturalmente sensato; le condizioni sopra riducono rischio e debito e vanno affrontate in Fase 2 (o in un piccolo intervento mirato se si vuole massima pulizia prima di estendere).

---

*Report Readiness Check Fase 1 — Audit read-only, nessuna modifica al codice. M1SSION™ iOS only.*
