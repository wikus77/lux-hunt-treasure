# Audit read-only — Architettura retention, orchestrazione e coerenza sistemica M1SSION™

**Data:** 2026-03-16  
**Tipo:** Read-only, nessuna modifica al codice  
**Scope:** App nativa wrappata iOS (Capacitor WKWebView)  
**Obiettivo:** Verifica strategica e tecnica di retention, daily loop, reward, progressione e coerenza tra le feature.

---

## 1. Inventario sistemi esistenti

### 1.1 COMMIT

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Modale Commit | ✅ Presente | `CommitModal.tsx`, `CommitRitual.tsx`, `CommitFlipOverlay.tsx` |
| Reward Commit | ✅ Presente | +5 M1U su successo, `apply_commit_ritual` RPC, `m1u-balance-update` event |
| Rituale 7s | ✅ Presente | Hold 7s → implosion, flash, haptic, audio commit-boom (offset 10.25s) |
| Stato giornaliero | ✅ Presente | `check_commit_ritual_status` (already_done_today, insufficient_funds) |
| Legame con altre feature | ⚠️ Parziale | `mpe_record_daily_commit` (MPE/panel); **nessun legame esplicito con Streak o Daily Missions** |

**Conclusione:** Il Commit è un blocco solido e autonomo. Non è collegato a streak, daily mission o a un “daily checklist” unificato.

---

### 1.2 DAILY MISSIONS

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Sistema legacy | 🔴 Disabilitato | `MISSIONS_ENABLED = false` in `missionsRegistry.ts`. Controller, briefing, phase1/2, reward M1U esistono ma non sono mostrati. |
| Sistema nuovo (server-driven) | ✅ Attivo | `DAILY_ENGINE_V2_ENABLED = true`. Edge `daily-mission-today`, `useDailyEngineV2`, `DailyEngineV2Card` dentro Next Action. |
| Stato server-driven | ✅ Presente | `day_key`, `mission_id`, `run` (phase, status), `retention` (streak, weekly_completion, sunday_reward) |
| Reward | ✅ Presente | Fase completata → reward lato server; modali Cipher/WordDuel/SignalPattern; Sunday super reward. |
| Streak / retention | ✅ Presente | Oggetto `retention` con streak e weekly; **non condiviso con lo Streak “check-in” della Home**. |
| Centralità | ⚠️ Parziale | Daily Engine V2 è **dentro il modale “Prossima azione”**, non in evidenza come Commit o Streak. Non è il fulcro della Home. |

**Conclusione:** Due sistemi: legacy spento, V2 attivo ma “nascosto” nel Next Action. Le daily missions non sono il centro del daily loop percepito.

---

### 1.3 STREAK

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Streak giornaliero | ✅ Presente | `profiles.current_streak_days`, `last_check_in_date`. StreakPill, StreakModal, StreakWidget, DailyCheckInButton. |
| Dove vive | ✅ Chiaro | `src/components/gamification/`, hook `useStreakReminder`. |
| Conseguenze reali | ✅ Presente | PE (award_xp + awardPE DAILY_LOGIN, moltiplicatore per streak), M1U +2 giornalieri, milestone M1U (5–100 giorni). |
| Motivazione | ✅ Presente | Milestone visibili, reminder 20:00 “Non perdere la tua streak”, loss aversion da streak break. |

**Conclusione:** Lo streak è un sistema retention reale (PE + M1U + reminder). **Non** è unificato con Commit né con Daily Mission V2 (stessi dati profilo ma flussi separati).

---

### 1.4 M1U / ECONOMY

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Come si guadagna | ✅ Multi-sorgente | Commit +5, Streak +2 + milestone, Daily Mission (se attiva), cashback claim, shop, Battle/Pulse Breaker. |
| Come si spende | ✅ Multi-sorgente | BUZZ, BUZZ MAP, shop, lottery, stake Battle. |
| Connessione alle feature | ✅ Presente | M1UPill, `m1u-balance-update`, refetch dopo Commit/Buzz/claim. |
| Unificazione | ⚠️ Parziale | L’economia è **unificata a livello di saldo** (profiles.m1_units), ma **manca un “filo” unico** che leghi tutte le azioni (Commit, Streak, Mission, Buzz) in una progressione narrativa. |

**Conclusione:** M1U è la valuta condivisa; manca una “spine” che spieghi “fai X → guadagni M1U → usi per Y”.

---

### 1.5 PULSE / PE

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Dove si ottiene | ✅ Molte azioni | `useAwardPE`, PE_VALUES: BUZZ_CLICK, DAILY_LOGIN, BATTLE_WIN, DAILY_MISSION, MARKER_CLAIM, ecc. Limiti giornalieri per azione. |
| Dove si usa / si vede | ✅ Presente | PulseBarPersonal (CommandCenterHome), AgentEnergyPill (rank/PE), DB `award_pulse_energy`, rank-up. |
| Coerenza | ✅ Buona | PE è un motore di progressione e feedback; collegato a rank. |
| Ruolo nel loop | ⚠️ Parziale | Non è il “primo motivo” per aprire l’app; è conseguenza di azioni già fatte. |

**Conclusione:** PE è coerente e già motore di progressione; non è ancora il “cuore” del daily hook.

---

### 1.6 BUZZ / BUZZ MAP

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Centralità nel loop | ⚠️ Parziale | Buzz costa M1U, dà indizi; Next Best Action suggerisce “Apri BUZZ” per mantenere streak e per fase collecting. |
| Collegamento al ritorno quotidiano | ⚠️ Parziale | useDailyFreeBuzz, limite giornaliero; **nessun “daily reward” esplicito** tipo “entra e fai 1 Buzz”. |
| Ruolo | Chiaro | Progressione missione (indizi), consumo M1U; non strutturato come “ritorno giornaliero obbligato”. |

**Conclusione:** BUZZ è centrale per la missione principale (indizi), non per un daily loop unificato.

---

### 1.7 SHOP / CASHBACK / REWARDS

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Integrazione nel loop | ⚠️ Parziale | ShopPill e CashbackVaultPill sulla Home; cashback da buzz/buzz_map/aion; claim separato. |
| Isolamento | ⚠️ Parziale | Sono “pills” accanto a Streak/Commit; non c’è un flusso “daily → reward → shop”. |
| Ruolo retention | Limitato | Monetization e premio; non c’è “fai Commit oggi per sbloccare X in shop”. |

**Conclusione:** Presenti e usabili; non integrati in un daily loop narrativo.

---

### 1.8 RANK / PROFILE / STATUS

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Progressione percepibile | ✅ Parziale | AgentEnergyPill (rank/PE), award_xp, profilo. |
| Legame alle azioni quotidiane | ✅ Parziale | PE da DAILY_LOGIN, DAILY_MISSION, BUZZ, ecc.; rank sale con PE. |
| Chiarezza | ⚠️ Parziale | Non c’è un “livello” o “giorno X di Y” molto evidente sulla Home. |

**Conclusione:** Rank/PE esistono e sono collegati alle azioni; non sono il messaggio principale della Home.

---

### 1.9 NOTIFICHE

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Supporto al ritorno | ✅ Parziale | useStreakReminder: notifica locale 20:00 per streak. Push (FCM/VAPID/Native) presenti. |
| Trigger utili | Limitati | Streak reminder è l’unico trigger chiaramente “daily return”; non c’è “Commit non fatto oggi” o “Daily mission in scadenza”. |

**Conclusione:** Le notifiche supportano parzialmente il ritorno (streak); mancano trigger per Commit e Daily Mission.

---

### 1.10 HOME / COMMAND CENTER

| Aspetto | Stato | Dettaglio |
|--------|--------|-----------|
| Hub coerente | ⚠️ Parziale | AppHome: PrizeVision, StreakPill, ShopPill, CashbackVaultPill, CommitNodesContainer, NextActionContainer. Elementi presenti ma **senza ordine gerarchico chiaro** (“prima questo, poi questo”). |
| Collegamento elementi | ⚠️ Parziale | Commit, Streak, Shop, Cashback sono **affiancati**; non c’è un flusso guidato “Commit → Streak → Mission → Reward”. |

**Conclusione:** La Home espone i pezzi; non fa da “regista” di un unico daily loop.

---

## 2. Daily loop attuale reale

**Oggi il daily loop reale di M1SSION è questo:**

1. **Apertura app** → Home con PrizeVision, pills (Streak, Shop, Cashback), Commit (3→1), blocco “Prossima azione”.
2. **Azioni daily possibili (parallele, non ordinate):**
   - **Commit:** tap sul nodo Commit → modale → hold 7s → +5 M1U, mpe_record_daily_commit. Una volta al giorno.
   - **Streak:** tap StreakPill → check-in → PE + 2 M1U + eventuale milestone. Una volta al giorno.
   - **Daily Mission V2:** tap “Prossima azione” → apre modale → DailyEngineV2Card → missione del giorno (Cipher/WordDuel/SignalPattern) → reward. Una volta al giorno (con phase2 “torna domani”).
3. **Altri elementi:** BUZZ (indizi, costa M1U), Shop, Cashback, Battle, Pulse Breaker, ecc. Non sono presentati come “step” del daily.
4. **Ritorno domani:** motivato da streak (reminder 20:00), da phase2 daily mission (“torna domani”), e implicitamente da “puoi rifare Commit/Streak”. **Nessun unico “daily checklist”** che unifichi Commit + Streak + Mission.

**I buchi principali sono questi:**

- **Nessun “ordine” chiaro:** l’utente non riceve un messaggio unico tipo “Fai prima Commit, poi Streak, poi Mission”.
- **Commit e Streak sono duplicati concettuali:** due “azioni daily” separate (rituale vs check-in) con reward diversi; non sono presentati come un unico “daily commitment”.
- **Daily Mission V2 è nascosta** nel modale Prossima azione; non ha la stessa visibilità di Commit/Streak.
- **Mancanza di “daily completo”:** nessun badge “Hai completato 3/3: Commit, Streak, Mission” né reward extra per aver fatto tutto.
- **Return pressure frammentata:** streak reminder sì; nessun reminder per “Commit non fatto” o “Mission in scadenza”.

---

## 3. Elementi già forti

- **Commit:** rituale chiaro, reward immediato (+5 M1U), stato giornaliero, audio/haptic. Pronto a essere il “primo gesto” del giorno se messo in sequenza.
- **Streak:** conseguenze reali (PE, M1U, milestone), reminder, loss aversion. Già retention reale.
- **M1U:** valuta unica usata da Commit, Streak, Buzz, Shop, Battle. Base per un’economia unificata.
- **PE/Rank:** molte fonti di PE, limiti giornalieri, rank-up. Buona base per progressione.
- **Daily Engine V2:** server-driven, retention (streak/weekly/sunday), countdown UTC. Buona base per “missione del giorno” se resa più visibile.
- **Next Best Action / Norah:** contesto time e streak (mattina/sera, “mantieni streak”); può guidare “cosa fare ora”.
- **Home layout:** tutti i blocchi (Prize, pills, Commit, Next Action) sono presenti; manca solo regia e collegamento.

---

## 4. Elementi frammentati o scollegati

- **Commit ↔ Streak:** nessun legame in codice né in UX; due “daily” separati.
- **Commit ↔ Daily Mission:** nessun legame; Commit non “sblocca” o “conta” per la mission.
- **Streak (check-in) ↔ retention.streak (Daily V2):** due nozioni di “streak” (profilo vs oggetto retention server); non unificati.
- **Next Action modale:** contiene Daily V2 + (se attivo) legacy mission + Vera Bomb; non contiene Commit né Streak come step.
- **BUZZ / BUZZ MAP:** collegati a missione (indizi) e M1U; non inseriti in un “daily checklist”.
- **Shop / Cashback:** pills sulla Home; non parte di un flusso “daily → reward → spendi”.
- **Notifiche:** solo streak reminder; nessun trigger per Commit o Mission.

---

## 5. Gap vs retention top-tier (tipo Royal Match)

Confronto su assi retention (0–10, spiegazione breve, migliorabile senza rifare il gioco).

| Asse | Punteggio | Spiegazione | Migliorabile senza rifare |
|------|-----------|-------------|----------------------------|
| Hook iniziale | 5 | Home ricca ma nessun “primo tap” obbligato (es. “Fai Commit ora”). | Sì: ordinare e copy (“Inizia con il Commit”). |
| Daily return pressure | 6 | Streak reminder e phase2 “torna domani” ci sono; Commit e Mission non hanno pressure esplicita. | Sì: reminder Commit/Mission + “daily completo”. |
| Streak pressure | 7 | Streak reale con conseguenze e reminder; non unificato con Commit/Mission. | Sì: unificare in un solo “daily done” o mostrare 3/3. |
| Reward variability | 5 | Commit fisso +5; Streak 2 + milestone; Mission variabile. Nessuna sorpresa “daily” forte. | Sì: reward variabili, bonus “hai fatto tutto”. |
| Progression clarity | 5 | PE/rank e M1U ci sono; non c’è una barra “progresso giornata” o “livello agente”. | Sì: UI “Daily 3/3”, livello visibile. |
| Loss aversion | 6 | Streak break e “torna domani” phase2; Commit “già fatto oggi” non è messo in risalto come “perso”. | Sì: “Se non fai Commit perdi X”. |
| Near miss | 4 | Quasi assente (Pulse Breaker ha near miss; daily no). | Sì: “Quasi streak 7”, “Mission quasi completata”. |
| Daily objective clarity | 4 | Tre cose daily (Commit, Streak, Mission) ma non presentate come “i 3 obiettivi del giorno”. | Sì: checklist esplicita. |
| Event orchestration | 4 | Sunday reward e weekly in V2; nessun “evento limitato” forte né countdown globale. | Parziale: serve design eventi. |
| Economy unification | 7 | M1U unica; PE separato ma chiaro. Manca narrativa “guadagni qui, spendi lì”. | Sì: copy e flussi guidati. |
| Feature cohesion | 4 | Molte feature; poche connessioni esplicite (Commit↔Streak↔Mission↔Buzz). | Sì: collegamenti e sequenza. |

**Media indicativa:** ~5.3/10. **Migliorabile senza rifare:** quasi tutti gli assi, soprattutto hook, daily objective, cohesion, loss aversion.

---

## 6. Backbone ideale di M1SSION

**Flusso principale proposto (da verificare in fase di design, non da implementare in questa audit):**

```
OPEN APP → (hook: “Fai il Commit” / “3 cose da fare oggi”)
  → COMMIT (rituale 7s, +5 M1U) [primo gesto]
  → STREAK (check-in, PE + M1U + milestone) [secondo]
  → DAILY MISSION (V2: missione del giorno, reward) [terzo]
  → REWARD / FEEDBACK (PE, M1U, “Daily completo 3/3”)
  → POWER / PE / M1U (visibili: barra PE, pill M1U, rank)
  → BUZZ / BUZZ MAP (usare M1U per indizi, avanzare missione)
  → RETURN TOMORROW (reminder Commit + Streak + Mission, “non perdere 3/3”)
```

**Feature secondarie:** Shop, Cashback, Battle, Pulse Breaker, Panel/Command Center (per utenti avanzati).

**Feature da agganciare al backbone:** Commit e Streak come “i due/tre gesti daily”; Daily Mission V2 come “obiettivo del giorno”; M1U e PE come feedback unico.

**Feature da non mettere al centro (ma mantenere):** BUZZ come strumento (non come “daily”); Shop/Cashback come monetization e reward; notifiche come supporto, non come spine.

**Filo logico unico possibile:** “Ogni giorno fai Commit + Streak + (opzionale) Mission → guadagni M1U e PE → usi M1U per BUZZ e avanzare → torni domani per non perdere streak e daily.”

---

## 7. Cosa si può ricucire senza stravolgere

- **Collegare in UX (senza cambiare DB):** Presentare sulla Home una “Daily checklist” (Commit fatto sì/no, Streak fatto sì/no, Mission fatto sì/no) leggendo stati esistenti: `check_commit_ritual_status`, `last_check_in_date`, Daily Engine V2 `run.status`. Nessun nuovo backend; solo UI e copy.
- **Unificare il messaggio:** Un solo blocco “Le 3 azioni di oggi” con Commit, Streak, Mission e stato 0/3, 1/3, 2/3, 3/3. Reward bonus “3/3” opzionale (es. +M1U o +PE) con logica lato client o una RPC leggera.
- **Notifiche:** Aggiungere reminder per “Commit non fatto” e “Daily mission in scadenza” (stesso pattern di useStreakReminder), senza toccare logica Commit/Mission.
- **Next Action:** Includere nello stesso modale (o in evidenza sulla Home) “Commit” e “Streak” come prime due azioni, poi Daily Mission V2. Stessi componenti; ordine e gerarchia diversi.
- **Copy e onboarding:** Testi tipo “Inizia con il Commit”, “Poi fai check-in streak”, “Infine la missione del giorno”. Nessun refactor architetturale.

---

## 8. Cosa manca davvero

- **Un “daily state” unificato lato client o server:** Un solo oggetto “today_daily” che dica (commit_done, streak_done, mission_done) per checklist e reward “3/3”. Oggi i tre stati sono in posti diversi (RPC commit, profiles streak, daily_mission_runs).
- **Narrativa economica chiara:** “Fai Commit e Streak per avere M1U → usali per BUZZ” non è spiegata in app; va resa esplicita (copy, micro-onboarding).
- **Return pressure su Commit e Mission:** Reminder e/o loss aversion (“Se non fai il Commit perdi l’opportunità di oggi”).
- **Eventi limitati e countdown globali:** Solo Sunday reward e weekly in V2; niente “evento 48h” o “weekend special” strutturato.
- **Quasi-vittoria daily:** Nessun “quasi streak 7” o “missione 90%” messaggio; si può aggiungere con i dati già presenti.

---

## 9. Verdetto finale

- **M1SSION oggi è:** **parzialmente coerente** (elementi solidi ma frammentati; nessuna regia unica).
- **Daily loop attuale:** **medio** (Commit, Streak e Daily V2 esistono e funzionano; non sono ordinati né presentati come un unico “daily”).
- **Retention architecture:** **migliorabile** (streak e PE sono buoni; mancano collegamenti espliciti e daily checklist).
- **Possibilità di evolvere a livello Royal Match:** **media** (la base c’è; serve orchestrazione, copy e pochi moduli “colla”, non rifare l’app).
- **Strategia migliore:** **collegare + aggiungere pochi moduli** (checklist daily, reminder Commit/Mission, eventuale reward 3/3; non rifare da zero).
- **Fiducia architetturale complessiva:** **65%** (sistemi presenti e utilizzabili; coerenza e regia da costruire con collegamenti e UX).

---

*Audit read-only. Nessuna modifica al codice applicata. Solo analisi e raccomandazioni.*
