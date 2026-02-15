# DAILY MISSIONS — PROPOSTA STRATEGICA DI REDESIGN

**Data:** 2025-02-14  
**Prodotto:** M1SSION (iOS wrapped, Capacitor/WKWebView)  
**Tipo:** Proposta strategica — READ-ONLY, no patch

---

## 1️⃣ ANALISI

### Perché le daily mission attuali non creano retention

- **Loop debole:** Una sola missione al giorno, phase 2 solo “ritorna domani”. Pochi touch point, nessun motivo per tornare più volte.
- **Missioni poco coinvolgenti:** Input/confirm banali, poca deduzione, zero esplorazione. L’utente non sente il prodotto “vivo”.
- **Scollegate dal prodotto:** Buzz, mappa, AION, Commit, streak esistono ma non vengono usati dalle missioni. L’utente impara a giocare altrove, non nella caccia al tesoro.
- **Visibilità scarsa:** MissionPill nascosta, nessun reminder. La missione non entra nella routine.
- **Nessuna progressione percepita:** Rotazione fissa ogni 30 giorni, stessa difficoltà. Zero senso di avanzamento.

### Meccaniche M1SSION oggi sottoutilizzate

| Meccanica | Utilizzo attuale | Sottoutilizzo |
|-----------|------------------|---------------|
| **Buzz** | Core dell’indagine | Nessuna daily che lo richiede esplicitamente |
| **Commit rituale** | Quotidiano, emotivamente forte | Non collegato alle missioni |
| **AION** | Intel AI | Nessuna missione che incentiva l’uso |
| **Mappa / marker** | Esplorazione, claim reward | Missioni solo input/confirm, nessuna esplorazione guidata |
| **Streak / check-in** | Motivatore giornaliero | Separato dalle daily, nessun bonus combo |
| **Leaderboard** | Competizione | Nessuna missione social/ranking |
| **Pulse Breaker** | Minigame skill | Solo 1–2 missioni counter nel catalogo |
| **Notifiche** | Engagement esterno | Nessuna missione che le promuove |

---

## 2️⃣ PROPOSTA — NUOVE DAILY MISSIONS

### Missione 1 — Buzz della verità

| Campo | Valore |
|-------|--------|
| **Nome** | Buzz della verità |
| **Descrizione** | Usa Buzz almeno una volta oggi e riscatta un indizio scoperto |
| **Meccanica** | Buzz + mappa + marker claim |
| **Trigger** | Buzz usato + 1 marker reward riscattato |
| **Progressione** | Multi-step (2 step: buzz → claim) |
| **Reward** | 20 M1U |
| **Retention** | Lega daily al core loop (Buzz → scoperta → reward) |
| **Frequenza** | Ogni giorno |

---

### Missione 2 — Commit quotidiano

| Campo | Valore |
|-------|--------|
| **Nome** | Commit quotidiano |
| **Descrizione** | Completa il rituale Commit oggi |
| **Meccanica** | Commit rituale |
| **Trigger** | CommitRitual onComplete |
| **Progressione** | 1 step |
| **Reward** | 20 M1U |
| **Retention** | Usa un rituale emotivo già quotidiano |
| **Frequenza** | Ogni giorno |

---

### Missione 3 — Domanda ad AION

| Campo | Valore |
|-------|--------|
| **Nome** | Domanda ad AION |
| **Descrizione** | Fai almeno una domanda ad AION oggi |
| **Meccanica** | AION / Intel chat |
| **Trigger** | Invio di 1 query a IntelChatPanel |
| **Progressione** | 1 step |
| **Reward** | 10 M1U |
| **Retention** | Porta l’utente nel flusso intelligenza/indagine |
| **Frequenza** | Ogni giorno |

---

### Missione 4 — Combo Streak + Missione

| Campo | Valore |
|-------|--------|
| **Nome** | Combo Streak |
| **Descrizione** | Fai il check-in streak e completa una daily mission oggi |
| **Meccanica** | Streak + una qualunque daily mission |
| **Trigger** | Check-in effettuato + almeno 1 missione completata |
| **Progressione** | Combo (2 condizioni) |
| **Reward** | 25 M1U (bonus) |
| **Retention** | Collega streak e daily, incentiva sia check-in sia missione |
| **Frequenza** | Ogni giorno (sbloccabile solo se entrambe completate) |

---

### Missione 5 — Indizio vicino

| Campo | Valore |
|-------|--------|
| **Nome** | Indizio vicino |
| **Descrizione** | Riscatta un marker reward sulla mappa oggi |
| **Meccanica** | Mappa + marker claim |
| **Trigger** | Inserimento in marker_claims |
| **Progressione** | 1 step |
| **Reward** | 15 M1U |
| **Retention** | Incentiva esplorazione e riscossione reward |
| **Frequenza** | Ogni giorno |

---

### Missione 6 — Pulse Breaker daily

| Campo | Valore |
|-------|--------|
| **Nome** | Pulse Breaker daily |
| **Descrizione** | Ottieni 3 vittorie in Pulse Breaker oggi |
| **Meccanica** | Pulse Breaker minigame |
| **Trigger** | 3 vittorie registrate |
| **Progressione** | Counter (0 → 3) |
| **Reward** | 15 M1U |
| **Retention** | Usa minigame skill, varietà giornaliera |
| **Frequenza** | Ogni giorno |

---

### Missione 7 — Esploratore del giorno

| Campo | Valore |
|-------|--------|
| **Nome** | Esploratore del giorno |
| **Descrizione** | Esplora 3 aree diverse sulla mappa (pan/zoom in zone distinte) |
| **Meccanica** | Mappa, bounds, navigazione |
| **Trigger** | Visita 3 celle/zone distinte (grid virtuale) |
| **Progressione** | Counter (0 → 3) |
| **Reward** | 15 M1U + 5 PE |
| **Retention** | Incentiva esplorazione attiva della mappa |
| **Frequenza** | Ogni giorno (o a rotazione) |

---

### Missione 8 — Resta informato

| Campo | Valore |
|-------|--------|
| **Nome** | Resta informato |
| **Descrizione** | Attiva le notifiche push oggi |
| **Meccanica** | Notifiche native |
| **Trigger** | Permission granted |
| **Progressione** | 1 step |
| **Reward** | 10 M1U |
| **Retention** | Aumenta probabilità di ritorno via push |
| **Frequenza** | Una tantum (non ripetibile) o condizionata (se non ancora attivata) |

---

## 3️⃣ VALUTAZIONE TECNICA (per missione)

| Missione | Diff. impl. (1–5) | Rischio tecnico | Rischio exploit | Dipendenze |
|----------|-------------------|-----------------|-----------------|------------|
| Buzz della verità | 2 | Basso | Medio (serve RPC) | useBuzzApi, marker_claims |
| Commit quotidiano | 2 | Basso | Basso | CommitRitual, RPC |
| Domanda ad AION | 2 | Basso | Basso | IntelChatPanel, tabella usage |
| Combo Streak + Missione | 3 | Medio | Medio | StreakModal, missionState, RPC |
| Indizio vicino | 2 | Basso | Basso | marker_claims, RPC |
| Pulse Breaker daily | 2 | Basso | Basso | Pulse Breaker, progressData |
| Esploratore del giorno | 4 | Medio | Medio | Map bounds/cell (da aggiungere) |
| Resta informato | 3 | Medio | Basso | useNativePush, consent flow |

---

## 4️⃣ STRUTTURA DEL DAILY LOOP

### Quante missioni al giorno

- **3 missioni attive in parallelo** ogni giorno:
  1. **Principale:** Buzz della verità / Commit quotidiano / Indizio vicino (a rotazione)
  2. **Secondaria:** Domanda ad AION / Pulse Breaker daily (a rotazione)
  3. **Combo:** Combo Streak + Missione (sempre attiva se streak + almeno 1 missione completabile)

### Modello: parallele + combo

- Le 2 missioni base sono **parallele** (l’utente può fare l’una o l’altra per prima).
- La **Combo Streak** è **condizionata**: si completa solo se streak + almeno 1 missione base completata lo stesso giorno.
- Nessuna missione **sequenziale obbligata**: l’ordine è libero.

### Collegamento con streak e check-in

- **Check-in** resta separato ma diventa condizione per la Combo.
- **Combo Streak:** reward bonus se utente fa check-in + almeno 1 missione base → incentiva entrambi.
- **Streak** può dare **bonus M1U** su missioni completate (es. +5 M1U se streak ≥ 3 giorni) — opzionale, da bilanciare.

---

## 5️⃣ RACCOMANDAZIONE FINALE

### Top 3 — Da implementare per prime

1. **Commit quotidiano** — Lega subito daily al rituale emotivo esistente, basso rischio, alta coerenza.
2. **Buzz della verità** — Usa il core loop (Buzz + claim), definisce l’identità della caccia al tesoro.
3. **Indizio vicino** — Semplice, incentiva mappa e claim, ottimo complemento.

### Non implementare subito

- **Esploratore del giorno** — Richiede logica bounds/cell sulla mappa non presente; rimandare a dopo Fase 2.
- **Resta informato** — Una tantum, priorità bassa; utile solo se si vuole spingere le push.
- **Scala la classifica** (eventuale) — Dipende da storage rank storico; complessità alta, valore incerto.

### Anti-pattern da evitare

- **Missioni banali:** “Apri l’app”, “Fai login”, “Visita la Home”.
- **Troppe missioni al giorno:** oltre 3–4 si diluisce l’attenzione.
- **Missioni sequenziali obbligate:** l’utente deve poter scegliere l’ordine.
- **Reward non bilanciati:** evitare M1U eccessivi; rispettare REWARD_BOUNDS.
- **Solo client/localStorage per claim:** i reward vanno validati lato server (RPC).
- **Combo troppo complesse:** max 2 condizioni (es. streak + 1 missione).
- **Missioni che richiedono dati non esistenti:** no dipendenze da feature future senza piano chiaro.
