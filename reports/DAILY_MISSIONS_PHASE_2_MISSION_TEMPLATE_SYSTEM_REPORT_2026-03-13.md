# Phase 2 — Mission Template System — Report

**Project:** M1SSION™ — Daily Mission Engine Enterprise  
**Date:** 2026-03-13  
**Phase:** 2 — Mission Template System  
**Environment:** iOS wrapped app (Capacitor WKWebView) only  

---

## 1. EXECUTIVE SUMMARY

- **Implementato:** Sistema di template settimanale (weekday-based): il server restituisce `mission_id` (uno dei 3 supportati) e `template_key` (archetipo del giorno) in base al giorno della settimana UTC. La UI v2 mostra il nome del template (Intelligence, Skill, Field, ecc.) e continua ad aprire i tre modali esistenti in base a `mission_id`. Nessuna nuova missione giocabile aggiunta; le 7 “missioni” sono i 7 archetipi assegnati ai giorni, mappati su 3 giochi reali (sempre giocabili).
- **Scelta tecnica:** Weekday UTC → `template_key` + `mission_id`. Tre `mission_id` invariati (cipher_drill_anagram_v1, word_duel_memory_v1, signal_pattern_numbers_v1); `claim-daily-phase` non toccato. Estensione minima e rollbackabile.
- **Rischio:** Basso. Nessuna modifica a DB, login, IAP, BUZZ, push; solo Edge `daily-mission-today`, client types/hook/card e i18n.
- **Build:** OK (`npm run build` exit code 0, ~5m 11s).
- **Cap sync:** Eseguito in sessione; si raccomanda di lanciare `npx cap sync ios` in locale per conferma.
- **Verdetto:** **GO FOR PHASE 3** (con deploy Edge come da §9).

---

## 2. TECHNICAL DECISION

### Weekday-based template system

- **Fonte:** `day_key` UTC; weekday con `getUTCDay()` (0=Domenica, 1=Lunedì, …, 6=Sabato).
- **Mapping fisso:**  
  Lunedì → Intelligence → cipher_drill_anagram_v1  
  Martedì → Skill → word_duel_memory_v1  
  Mercoledì → Field → signal_pattern_numbers_v1  
  Giovedì → Orientation → cipher_drill_anagram_v1  
  Venerdì → Time → word_duel_memory_v1  
  Sabato → Strategic → signal_pattern_numbers_v1  
  Domenica → Special → cipher_drill_anagram_v1  
- **Motivazione:** Coerenza con la visione “7 archetipi a rotazione settimanale” mantenendo solo 3 implementazioni reali (modali + claim). Sempre giocabile, nessun “not available”, nessun cambiamento a run/claim/reward.

### Streak missioni

- **Decisione:** **NON inclusa** in Fase 2.
- **Motivo:** Richiederebbe schema (es. colonne o tabella per last_completed_day, streak_count), logica Edge su complete, e UI; amplia scope e rischio. Consigliato spostare a **Fase 2.5 o Fase 3** con design dedicato.

---

## 3. SERVER SIDE CHANGES

### Edge Function: `daily-mission-today`

- **File:** `supabase/functions/daily-mission-today/index.ts`
- **Modifiche:**
  - Sostituito ciclo `epochDay % 3` con mapping per weekday UTC.
  - Aggiunta `getWeekdayUtc(dayKey)` e `getTemplateForDay(dayKey)` che restituiscono `{ template_key, mission_id }`.
  - Risposta estesa con `template_key` (uno di: intelligence, skill, field, orientation, time, strategic, special).
  - `cycle_version` impostato a `"v2"`.
  - `index` nella risposta è il weekday (0–6) invece dell’indice nel vecchio ciclo.
- **DB / RPC:** Nessuna modifica. Nessuna migration.

### Edge Function: `claim-daily-phase`

- **Nessuna modifica.** Continua ad accettare solo i 3 `mission_id` già supportati; idempotenza e reward (M1U + PE) invariati.

### Contratti

- Il client si aspetta in risposta a `daily-mission-today`: `ok`, `day_key`, `mission_id`, `template_key` (opzionale), `cycle_version`, `index`.

---

## 4. CLIENT SIDE CHANGES

### Tipi e fetch

- **`src/missions/serverReal/dailyMissionToday.ts`**
  - Aggiunto tipo `DailyEngineTemplateKey` e campo opzionale `template_key` in `DailyMissionTodayResponse`.

### Hook

- **`src/missions/dailyEngineV2/useDailyEngineV2.ts`**
  - Aggiunto stato `templateKey`; valorizzato da `res.template_key`.
  - Restituito `templateKey` in `DailyEngineV2State`.

### UI

- **`src/missions/dailyEngineV2/DailyEngineV2Card.tsx`**
  - Usa `templateKey` da `useDailyEngineV2`.
  - Titolo card: se presente `templateKey`, mostra `"Missione del giorno — {template}"` (es. “Missione del giorno — Intelligence”) tramite i18n; altrimenti solo titolo generico.
  - Logica modali invariata: apertura sempre in base a `mission_id` (Cipher / Word Duel / Signal Pattern). Nessun “not available” perché il server invia solo uno dei 3 `mission_id`.

### Flussi frozen

- Nessun tocco a login/logout, delete account, IAP, BUZZ, BUZZ MAP, push, Home/Map/Next Action (eccetto la card daily v2 già esistente).

---

## 5. I18N

- **Prefisso:** `daily_engine.*`
- **Chiavi aggiunte (IT, EN, FR):**
  - `daily_engine.template_intelligence`
  - `daily_engine.template_skill`
  - `daily_engine.template_field`
  - `daily_engine.template_orientation`
  - `daily_engine.template_time`
  - `daily_engine.template_strategic`
  - `daily_engine.template_special`
- **Valori:** Intelligence, Skill, Field, Orientation, Time, Strategic, Special (EN); equivalenti IT/FR (Orientamento, Tempo, Strategico, Speciale; Compétence, Terrain, etc.).
- **Hardcoded:** Nessuna stringa di template in chiaro nel client; tutto tramite `t('daily_engine.template_' + templateKey)`.

---

## 6. IMPACT ANALYSIS

- **Flussi frozen:** Non modificati (login, logout, delete, IAP, BUZZ, BUZZ MAP, push).
- **Home / Map / Next Action:** Solo la card daily v2 mostra il nuovo titolo con template; nessun altro layout o flusso toccato.
- **Rischi residui:** (1) Deploy Edge `daily-mission-today` obbligatorio perché la logica weekday è lato server. (2) Client senza rebuild continuerà a funzionare ma non mostrerà il nome del template (fallback al solo titolo “Missione del giorno”).

---

## 7. BUILD VERIFICATION

- **Comando:** `npm run build`
- **Esito:** **OK** (exit code 0). Build completata in ~5m 11s.
- **Warning:** Nessuno rilevante per la Fase 2.

---

## 8. CAPACITOR SYNC IOS

- **Comando:** `npx cap sync ios`
- **Esito:** Eseguito in sessione; si raccomanda di eseguire in locale dopo il build per confermare che `ios/App/App/public` sia aggiornato.
- **Note:** Nessuna modifica a plugin o config Capacitor; solo aggiornamento contenuti da `dist/`.

---

## 9. DEPLOY NOTES FOR JOSEPH

### Cosa deployare

1. **Edge Function `daily-mission-today`**  
   - È l’unica modifica server-side. Senza deploy, il client continuerà a ricevere la vecchia risposta (senza `template_key`); la card mostrerà solo “Missione del giorno” senza nome template.
   - Comando tipico: dalla root del repo  
     `supabase functions deploy daily-mission-today`  
     (o il flusso che usi per il deploy delle Edge).

2. **Client (app wrappata)**  
   - Rebuild e sync: `npm run build` e `npx cap sync ios`. Poi rebuild dell’app in Xcode se necessario e installazione su dispositivo/simulatore.

### Cosa non deployare

- **DB:** Nessuna migration, nessun deploy DB.
- **Edge `claim-daily-phase`:** Non modificata; non serve ridistribuirla per la Fase 2 (solo se fai deploy di tutte le Edge per coerenza).

### Ordine consigliato

1. Deploy Edge `daily-mission-today`.
2. Build client: `npm run build`.
3. Sync iOS: `npx cap sync ios`.
4. Aprire il progetto iOS in Xcode, build e run su dispositivo/simulatore.

### Verifiche post-deploy (iPhone)

- Aprire l’app, andare alla Home.
- Controllare che la card “Missione del giorno” mostri il titolo con il template del giorno (es. “Missione del giorno — Intelligence” di lunedì).
- Avviare la missione, completare (o fare almeno un passo): verificare che si apra il modale corretto e che reward/claim funzionino come prima.

### Logout / login

- Non richiesti per il corretto funzionamento della Fase 2.

---

## 10. FINAL VERDICT

- **GO FOR PHASE 3**

La Fase 2 è stata implementata in modo minimale e sicuro: selezione weekday-based lato server, 7 template come archetipi di prodotto, 3 missioni reali sempre giocabili, UI e i18n allineati. Nessun impatto su flussi frozen, nessuna modifica a DB o a `claim-daily-phase`. La streak missioni è lasciata a una fase successiva (2.5 o 3). Per attivare tutto in produzione è sufficiente il deploy dell’Edge `daily-mission-today` e il rebuild/sync dell’app come da §9.
