# Streak Daily Check-in / PE Reward Flow — Forensics (Hard Read-Only)

**Data:** 2026-03-07  
**Tipo:** Verifica reale, nessuna modifica al codice, nessun commit/push/build/cap sync  
**Scope:** iOS Capacitor WKWebView. Flusso daily check-in streak e modale fullscreen PE.  
**Output:** Solo questo report `.md`.

---

## 1. Executive Summary

- **Fatto osservato:** Apertura modale “STREAK SYSTEM” → primo daily check-in del giorno → streak days aggiornato (es. 5 → 6), badge/bonus aggiornati, ma **il modale fullscreen PE non compare**.
- **Causa tecnica accertata:** La modale STREAK SYSTEM è **StreakModal** (aperta da **StreakPill** su Home). In **StreakModal** il `handleCheckIn` **non chiama mai** `awardPE('DAILY_LOGIN')` e **non accredita PE** tramite RPC `award_pulse_energy`. Accredita solo XP (`award_xp`) e M1U (`awardM1U`). Quindi **nessun** `pe:awarded` e **nessun** `emitPECreditEvent` → il fullscreen PE **non può** aprirsi.
- **Dove i PE sarebbero accreditati (ma non in questo flusso):** Solo **StreakWidget** chiama `awardPE('DAILY_LOGIN', ...)`. StreakWidget **non è montato** in AppHome: in Home è presente solo **StreakPill**, che apre **StreakModal**. L’utente che fa check-in dalla “modale STREAK SYSTEM” usa quindi un flusso che **non prevede** accredito PE.
- **“PE Bonus” in UI:** Nello StreakWidget e nello StreakModal i valori “PE Bonus +25% / +30%” sono **solo descrittivi**: derivano da `xp_multiplier` / `peMultiplier` (stato streak). **Non** determinano un accredito PE immediato e **non** entrano in `awardPE`. In StreakModal il “PE” usato è solo nella chiamata `award_xp(p_xp_amount: peAwarded)` (XP, non `pulse_energy`).
- **Verdetto:** Il daily check-in **dalla modale STREAK SYSTEM (StreakModal) non accredita PE reali** e **non emette** l’evento globale. Il fullscreen PE non si apre perché il flusso usato dall’utente non arriva mai a `emitPECreditEvent`. Il problema è **nel flusso streak (StreakModal non integrato con PE)**, non nell’overlay globale.

---

## 2. Inventario file / funzioni coinvolti

Verifica effettuata con grep su: `DAILY_LOGIN`, `StreakWidget`, `StreakModal`, `handleCheckIn`, `awardPE`, `PE Bonus`, `pe:awarded`, `emitPECreditEvent`, `check_pe_daily_limit`, `award_pulse_energy`, `pulse_energy`, `streak`, `last_check_in_date`.

| File | Funzione / ruolo | UI o logica | Accredita PE reali? | Emette eventi globali PE? | Note |
|------|------------------|-------------|----------------------|----------------------------|------|
| **StreakWidget.tsx** | handleCheckIn | Logica + UI | **Sì** (tramite awardPE) | Sì (se useAwardPE arriva a success) | Chiama `awardPE('DAILY_LOGIN', undefined, { streakDays, streakBroken })`. **Non montato in AppHome.** |
| **StreakModal.tsx** | handleCheckIn | Logica + UI | **No** | **No** | Aggiorna profile (current_streak_days, last_check_in_date), chiama `award_xp(peAwarded)` (XP), `awardM1U`. **Nessuna** chiamata a useAwardPE / awardPE. **È la modale “STREAK SYSTEM” aperta da StreakPill.** |
| **StreakPill.tsx** | — | UI | No | No | Apre StreakModal al tap. Montato in AppHome. |
| **useAwardPE.ts** | awardPE | Logica | Sì (RPC award_pulse_energy) | Sì (pe:awarded + emitPECreditEvent se delta > 0) | DAILY_LOGIN: PE_VALUES = 5, PE_DAILY_LIMITS = 1. |
| **peCreditEvent.ts** | emitPECreditEvent | Logica | — | Emette pe-credit-event | Chiamato solo da useAwardPE (e altri flussi integrati). |
| **GlobalPERewardOverlay.tsx** | handle (listener) | Logica | — | Ascolta pe-credit-event | Apre modale se amount > 0 e supera guard/dedupe. |

**Montaggio reale su Home (AppHome.tsx):**  
- `StreakPill` (riga ~338) è montato.  
- **StreakWidget non è importato né montato** in AppHome.  
Quindi l’unico check-in disponibile dalla Home è tramite **StreakPill → StreakModal**, che non accredita PE.

---

## 3. Call graph reale daily check-in

**Flusso A — Check-in dalla modale STREAK SYSTEM (StreakModal) — quello usato dall’utente**

1. Utente tocca pill streak (StreakPill) → si apre **StreakModal**.
2. Utente tocca bottone check-in nel modale → **StreakModal.handleCheckIn**.
3. Guard: `if (!user \|\| !canCheckIn \|\| checkingIn) return`.
4. Aggiornamento DB: `supabase.from('profiles').update({ current_streak_days, longest_streak_days, last_check_in_date })`.
5. Chiamata **award_xp**: `supabase.rpc('award_xp', { p_user_id, p_xp_amount: peAwarded, p_source: 'daily_checkin' })` — accredita **XP**, non `pulse_energy`.
6. Chiamata **awardM1U**: M1U giornalieri + eventuale milestone.
7. **Nessuna** chiamata a `awardPE`.
8. **Nessuna** chiamata a `check_pe_daily_limit`.
9. **Nessuna** chiamata a `award_pulse_energy`.
10. **Nessun** dispatch `pe:awarded`.
11. **Nessun** dispatch `emitPECreditEvent`.
12. Fullscreen PE **non** si apre (nessun evento).
13. Home / PulseBar / AgentEnergyPill non ricevono evento PE; eventuale aggiornamento solo se Realtime invia update su `profiles` (es. da award_xp se quel RPC toccasse `pulse_energy` — da codice no: è award_xp).

**Dove si interrompe il flusso PE:** Al punto 7. Il flusso **non prevede** accredito PE; non è una interruzione per errore ma **assenza di integrazione** di StreakModal con useAwardPE.

---

**Flusso B — Check-in da StreakWidget (non usato su Home)**

1. Utente tocca bottone check-in in **StreakWidget** (componente non montato in AppHome).
2. **StreakWidget.handleCheckIn**.
3. Update profile (current_streak_days, last_check_in_date).
4. award_xp.
5. **awardPE('DAILY_LOGIN', undefined, { streakDays, streakBroken })**.
6. useAwardPE: guard user, peAmount = 5, check_pe_daily_limit (limite 1).
7. Se can_award: RPC award_pulse_energy(5, 'DAILY_LOGIN').
8. Se success: pe:awarded + emitPECreditEvent(5, 'daily_login', …).
9. GlobalPERewardOverlay riceve evento → modale fullscreen può aprirsi.

Flusso B è l’unico che accredita PE e può far aprire il fullscreen; non è il flusso della “modale STREAK SYSTEM”.

---

## 4. Distinzione tra bonus UI e accredito reale

**Dove compaiono “PE Bonus” e “M1U Bonus”**

- **StreakWidget** (righe 358–368):  
  - “PE Bonus”: `+{Math.round((streakInfo?.xp_multiplier || 1) * 100 - 100)}%` (es. 1.25 → +25%).  
  - “M1U Bonus”: `+{streakInfo?.m1u_bonus_percent || 0}%`.  
  Valori da `xp_multiplier` e `m1u_bonus_percent` (stato caricato da get_user_streak_info o da profile). Solo **descrittivi**; non usati come parametro in `awardPE`. L’accredito PE in StreakWidget è **sempre** 5 (da PE_VALUES['DAILY_LOGIN']).

- **StreakModal** (righe 334–350):  
  - “PE Bonus”: `peMultiplier = Math.min(1 + streak * 0.05, 1.5)` → `+{Math.round((peMultiplier - 1) * 100)}%`.  
  - “M1U Bonus”: `m1uBonus = Math.min(streak * 2, 30)`.  
  Solo UI. In handleCheckIn, `peAwarded = Math.round(basePE * multiplier)` viene passato a **award_xp** come `p_xp_amount` (XP), **non** a `award_pulse_energy`. Quindi nessun accredito su `profiles.pulse_energy` da StreakModal.

**Risposta secca**

- **Il daily streak accredita PE reali al click (nella modale STREAK SYSTEM)?** **NO.** Nella modale STREAK SYSTEM (StreakModal) non c’è alcun accredito PE.  
- **Il PE Bonus mostrato nella UI è operativo (accredito PE immediato)?** **NO.** È solo descrittivo (moltiplicatore/percentuale di stato). In StreakModal lo stesso moltiplicatore entra solo nel calcolo XP (`award_xp`), non in `pulse_energy`.

---

## 5. Analisi hard di guard / limiti / return anticipati

**useAwardPE e action DAILY_LOGIN**

1. **DAILY_LOGIN in PE_VALUES?** Sì. `PE_VALUES['DAILY_LOGIN'] = 5`.
2. **Valore numerico:** 5.
3. **DAILY_LOGIN in PE_DAILY_LIMITS?** Sì. `PE_DAILY_LIMITS['DAILY_LOGIN'] = 1`.
4. **Limite:** 1 volta al giorno.
5. **handleCheckIn chiama awardPE('DAILY_LOGIN', ...)?** **Solo in StreakWidget:** sì (riga 197). **In StreakModal:** no; non c’è import di useAwardPE né chiamata ad awardPE.
6. **Ramo:** In StreakWidget la chiamata è nel try dopo update profile e award_xp, con `.catch(err => console.warn(...))`.
7. **Condizioni che possono saltare la chiamata:** In StreakModal la chiamata **non esiste**. In StreakWidget nessuna condizione la salta (è sempre eseguita dopo update e award_xp).
8. **check_pe_daily_limit può bloccare anche al primo check-in?** Solo se l’RPC `check_pe_daily_limit` per DAILY_LOGIN restituisce già `can_award: false` (es. logica lato DB che conta un’altra azione come “daily login”). Al primo check-in del giorno, in assenza di altri consumi, normalmente can_award sarebbe true. Non modificabile dal solo codice client.
9. **Se check-in eseguito con successo, award_pulse_energy viene sempre chiamata?** Solo nel flusso **StreakWidget** e solo se useAwardPE non è uscito prima (user presente, limit check can_award, nessun errore). In **StreakModal** award_pulse_energy **non** viene mai chiamata.
10. **Se award_pulse_energy risponde success, viene sempre fatto pe:awarded?** Sì (useAwardPE righe 231–234).
11. **Se delta > 0 viene sempre chiamato emitPECreditEvent?** Sì (useAwardPE righe 236–242).
12. **Catch silenzioso che nasconde errori?** In StreakWidget: `awardPE(...).catch(err => console.warn(...))` — l’errore non blocca il flusso UI (check-in appare riuscito) ma l’accredito/emit potrebbero non esserci se awardPE fallisce.

Tabella sintetica guard/effetti (per il flusso che **chiama** awardPE, cioè StreakWidget):

| Condizione | Effetto | Impedisce accredito? | Impedisce emit? | Impedisce fullscreen? |
|------------|--------|----------------------|------------------|------------------------|
| !user?.id | return useAwardPE | Sì | Sì | Sì |
| limitCheck && !limitCheck.can_award | return useAwardPE | Sì | Sì | Sì |
| Errore RPC award_pulse_energy | return useAwardPE | Sì | Sì | Sì |
| !result?.success | return useAwardPE | Sì | Sì | Sì |
| delta ≤ 0 | — | N/A | Sì (no emit) | Sì |
| **StreakModal: nessuna chiamata awardPE** | **Flusso senza PE** | **Sì** | **Sì** | **Sì** |

---

## 6. Verdetto UI vs logica

**Caso che si applica al scenario descritto (modale STREAK SYSTEM):**

- **B) Il check-in (nella modale) non accredita PE, quindi il modale fullscreen PE giustamente non si apre.**  
  StreakModal non chiama awardPE e non accredita `pulse_energy`. L’overlay fullscreen PE si apre solo su `emitPECreditEvent`, che non viene mai chiamato da questo flusso.

- **C) La UI fa credere che ci sia un reward PE (bonus percentuali), ma in questo flusso non c’è accredito PE immediato.**  
  Le label “PE Bonus +25% / +30%” sono solo stato/moltiplicatore; in StreakModal non sono collegate ad alcun accredito su `pulse_energy`.

**Altro caso possibile (se l’utente usasse StreakWidget):**

- **A) Il check-in accredita PE e emette evento:** in quel caso il fullscreen potrebbe aprirsi, salvo limit/guard (es. limite 1/giorno già consumato) o errore RPC.

Conclusione: **il problema è nel flusso streak (StreakModal non integrato con il sistema PE)**, non nell’overlay globale. L’overlay è innocente: non riceve evento perché StreakModal non ne emette.

---

## 7. Analisi eventi globali PE

- **Il daily check-in (dalla modale STREAK SYSTEM) arriva fino a emitPECreditEvent?** **No.** In StreakModal non viene mai chiamato awardPE, quindi nessun emit.
- **Dove si ferma?** Alla fine di StreakModal.handleCheckIn (update profile, award_xp, awardM1U). Non c’è nessun passo successivo che emetta eventi PE.
- **Il modale fullscreen PE dipende solo da emitPECreditEvent?** Sì. GlobalPERewardOverlay ascolta solo `pe-credit-event`; l’unico emittente previsto per quel evento è `emitPECreditEvent` (e altri punti che lo chiamano esplicitamente).
- **Ci sono casi in cui il check-in accredita PE ma l’overlay scarta l’evento?** Per il **check-in dalla modale STREAK SYSTEM** no: non c’è accredito PE né evento. Per un ipotetico check-in da StreakWidget: se awardPE ha success e delta > 0, emitPECreditEvent viene chiamato; l’overlay potrebbe scartare l’evento solo per guard (amount ≤ 0, animatingRef, lastIdRef, DEDUPE_MS). Nessuna evidenza che il problema sia lato overlay nel caso “modale streak”.

**Conclusione:** Il sistema overlay è coerente; il problema è a monte: **StreakModal non è integrato con il sistema PE** (nessuna chiamata a awardPE / emitPECreditEvent).

---

## 8. Risposte operative secche

1. **Il daily check-in accredita PE reali oggi?**  
   **Dalla modale STREAK SYSTEM (StreakModal): NO.**  
   Da StreakWidget (se usato altrove): Sì (5 PE), ma StreakWidget non è montato su Home.

2. **Se sì, quanti PE accredita davvero?**  
   Solo nel flusso StreakWidget: **5 PE** (PE_VALUES['DAILY_LOGIN']).

3. **Se no, perché la UI mostra “PE Bonus +25% / +30%”?**  
   Sono **moltiplicatori/percentuali di stato** (xp_multiplier / peMultiplier) mostrati come bonus. In StreakModal lo stesso moltiplicatore è usato solo per **award_xp** (XP), non per `pulse_energy`. Nessun accredito PE è legato a quelle percentuali.

4. **Il bottone DAILY CHECK-IN chiama awardPE('DAILY_LOGIN')?**  
   **Nella modale STREAK SYSTEM: NO.** In StreakWidget: Sì.

5. **awardPE('DAILY_LOGIN') arriva davvero fino a award_pulse_energy?**  
   Solo quando è chiamato (StreakWidget). In StreakModal awardPE non è mai chiamato, quindi no.

6. **Dopo il successo, emette pe:awarded?**  
   Solo nel flusso che chiama awardPE (StreakWidget) e se RPC ha successo. Nella modale STREAK SYSTEM: no (nessun awardPE).

7. **Dopo il successo, emette emitPECreditEvent?**  
   Stesso punto: sì solo nel flusso useAwardPE con success e delta > 0. Nella modale STREAK SYSTEM: no.

8. **Il fullscreen PE dovrebbe aprirsi con il daily check-in, in base al codice attuale?**  
   **Solo** se il check-in passa da un flusso che chiama awardPE('DAILY_LOGIN') (es. StreakWidget) e useAwardPE ha success. **Con il flusso modale STREAK SYSTEM attuale: NO**, perché quel flusso non emette l’evento.

9. **Se non si apre, il problema è nello streak flow o nel global overlay?**  
   **Nello streak flow** (StreakModal non integrato: nessuna chiamata awardPE / emit).

10. **Il bonus PE nello streak è reale o solo cosmetico?**  
    **Solo cosmetico** (descrittivo). Non genera accredito su `pulse_energy` nel flusso StreakModal; in StreakWidget l’accredito è comunque il valore fisso 5 PE, non la percentuale.

11. **Quali file sono i 5 più importanti da toccare in un futuro fix?**  
    - `src/components/gamification/StreakModal.tsx` — Aggiungere chiamata a awardPE('DAILY_LOGIN', ...) dopo update profile / award_xp (stesso ordine e payload di StreakWidget), con gestione errore/limit.  
    - `src/features/pulse/hooks/useAwardPE.ts` — Solo se si vogliono modificare limiti o logica DAILY_LOGIN (opzionale).  
    - `src/components/gamification/StreakWidget.tsx` — Nessuna modifica obbligatoria; eventuale allineamento documentazione/commenti.  
    - `src/features/pulse/components/GlobalPERewardOverlay.tsx` — Non necessario per questo bug; solo se si vogliono modifiche dedupe/timeout.  
    - `src/features/pulse/peCreditEvent.ts` — Non necessario per questo bug.

12. **Cosa NON va toccato assolutamente?**  
    IAP, StoreKit, receipts, purchase flow, login/logout, delete-account, BUZZ/BUZZ MAP core, push native, subscriptions, M1U engine, altri flussi già funzionanti. Non modificare la logica di award_xp o di awardM1U nello streak oltre a **aggiungere** la chiamata PE dove manca.

---

## 9. Top 5 file da toccare in un eventuale fix

1. **`src/components/gamification/StreakModal.tsx`** — Integrare awardPE('DAILY_LOGIN', ...) in handleCheckIn (dopo update profile e award_xp), con stesso pattern di StreakWidget e .catch per non bloccare UI.
2. **`src/features/pulse/hooks/useAwardPE.ts`** — Solo se si cambiano limiti o comportamento per DAILY_LOGIN (opzionale).
3. **`src/components/gamification/StreakWidget.tsx`** — Solo per coerenza documentazione o commenti (opzionale).
4. **`src/features/pulse/components/GlobalPERewardOverlay.tsx`** — Solo per eventuali aggiustamenti dedupe/timeout (opzionale).
5. **`src/features/pulse/peCreditEvent.ts`** — Non richiesto per questo fix.

---

## 10. Blacklist file intoccabili

- IAP / StoreKit / receipts / purchase flow  
- Login / logout / delete-account  
- BUZZ / BUZZ MAP  
- Push native  
- Subscriptions  
- M1U global engine  
- Route / navigation  
- Tutto ciò che è fuori dall’ambito streak check-in e reward PE per questo flusso  

---

*Fine report. Nessuna modifica al codice; nessun commit; nessun push; nessun build; nessun cap sync. Solo lettura e documentazione.*
