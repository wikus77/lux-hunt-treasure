# PE REWARD MODAL — FORENSIC ANALYSIS (READ-ONLY)

**Data:** 2026-03-09  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Branch:** feat/pe-global-fullscreen-reward  
**HEAD:** 7012170a1132f77a66f7359d69b9be6cd97e703b  
**Modalità:** Solo lettura. Nessuna modifica al codice.

---

## 1. Executive Summary

Il modale fullscreen che mostra i **PE assegnati** è mostrato da **GlobalPERewardOverlay**, che ascolta **solo** l’evento **`pe-credit-event`** (non `pe:awarded`). L’evento viene emesso da **`emitPECreditEvent(amount, source, metadata)`** in `peCreditEvent.ts`; la funzione **non fa nulla se `amount <= 0`**.

**Perché BUZZ “sempre” e altri “a volte/no”:**

1. **BUZZ** passa da **useAwardPE** → RPC → se successo e **delta > 0** → `emitPECreditEvent(delta, 'buzz_click', …)`. Flusso unico, sincrono dopo RPC, nessun update diretto.
2. **Altri flussi** possono: (a) **non emettere** mai (es. Daily Mission non accredita PE client-side; Fortune Wheel non chiama `emitPECreditEvent` per i PE); (b) **limitReached** → useAwardPE esce prima e non chiama `emitPECreditEvent` (es. DAILY_LOGIN già usato, BUZZ oltre 5/giorno); (c) usare **update diretto** + `emitPECreditEvent` in modo **asincrono** (dynamic import o dopo `.then()`) → possibile **race** con DEDUPE o con il mount del listener; (d) essere **filtrati** dall’overlay (DEDUPE_MS 2500 ms, `animatingRef`, `amount <= 0`).

**Cause certe:** (1) Il modale dipende **solo** da `pe-credit-event` emesso con `amount > 0`. (2) `emitPECreditEvent` non invia nulla se `amount <= 0`. (3) useAwardPE chiama `emitPECreditEvent` **solo se delta > 0** dopo RPC; se RPC fallisce o restituisce limitReached, non si emette. (4) L’overlay ignora eventi con `!detail?.amount || detail.amount <= 0`, mentre è in animazione (`animatingRef`), con stesso `id`, o entro 2500 ms dall’ultimo.

**Cause molto probabili:** (1) Limite giornaliero raggiunto (BUZZ 5, DAILY_LOGIN 1, ecc.) → nessuna emissione. (2) Due crediti PE a meno di 2,5 s → il secondo viene scartato dal DEDUPE. (3) Flussi con update diretto + dynamic import: l’evento arriva in ritardo e può cadere in finestra DEDUPE o dopo chiusura modale.

**Ipotesi non dimostrabile senza log:** evento inviato prima che il listener di GlobalPERewardOverlay sia attaccato (race al primo mount).

---

## 2. Flow completo evento PE

```
SORGENTE (es. BUZZ, streak, battle, milestone, onboarding, …)
    ↓
Assegna PE (RPC award_pulse_energy OPPURE update diretto profiles.pulse_energy)
    ↓
Se il flusso prevede emissione:
    emitPECreditEvent(amount, source, metadata)
    ↓
peCreditEvent.ts: if (amount <= 0) return; else
    window.dispatchEvent(new CustomEvent('pe-credit-event', { detail: payload }))
    ↓
EVENT BUS: window (DOM)
    ↓
GlobalPERewardOverlay useEffect: window.addEventListener('pe-credit-event', handle)
    ↓
handle(detail): if (!detail?.amount || amount <= 0) return;
                if (animatingRef.current) return;
                if (lastIdRef === detail.id) return;
                if (now - lastTimeRef < DEDUPE_MS) return;
    ↓
setPayload(detail) → STATE UPDATE
    ↓
MODAL RENDER (AnimatePresence, PulseBarReward, CTA)
```

**Nota:** `pe:awarded` è un **altro** evento: usato da PulseBarPersonal (e altri) per refetch/sync barra PE. **Non** è quello che apre il modale. Il modale dipende **solo** da `pe-credit-event`.

---

## 3. Mappa emitter

| Ruolo | File | Cosa fa |
|--------|------|--------|
| **Definizione evento + funzione emit** | `src/features/pulse/peCreditEvent.ts` | `PE_CREDIT_EVENT = 'pe-credit-event'`; `emitPECreditEvent(amount, source, metadata)` → se `amount <= 0` return; altrimenti `window.dispatchEvent(new CustomEvent(PE_CREDIT_EVENT, { detail }))`. |
| **Emitter centrale (tutti i flussi useAwardPE)** | `src/features/pulse/hooks/useAwardPE.ts` | Dopo RPC `award_pulse_energy` success: dispatch `pe:awarded`; se **delta > 0** chiama `emitPECreditEvent(delta, source, { preValue, postValue })`. |
| **Emitter diretti (update DB + emit)** | OnboardingOverlay, BattleDefenseModal, useClueMilestones, PracticeMode, useBombMissionRun | Dopo update/RPC chiamano `emitPECreditEvent(...)` (alcuni via dynamic import). |

---

## 4. Mappa listener

| Componente | File | Ruolo |
|------------|------|--------|
| **Overlay modale (fullscreen)** | `src/features/pulse/components/GlobalPERewardOverlay.tsx` | Ascolta **solo** `pe-credit-event` (PE_CREDIT_EVENT). In `handle`: filtra `amount <= 0`, `animatingRef`, stesso `id`, eventi entro DEDUPE_MS (2500 ms). Imposta `payload` → mostra modale con PulseBarReward. |
| **Barra PE / refetch** | `src/features/pulse/components/PulseBarPersonal.tsx` | Ascolta **`pe:awarded`** per refetch rank/PE. **Non** ascolta `pe-credit-event` e non decide la visibilità del modale. |

---

## 5. Tabella sorgenti PE

| Sorgente PE | Update DB | emitPECreditEvent | pe:awarded | Note |
|-------------|-----------|-------------------|------------|------|
| **BUZZ (tasto)** | useAwardPE → RPC | Sì (se delta > 0) | Sì | Limite 5/giorno → dopo 5 no emit. |
| **BUZZ MAP** | useAwardPE → RPC | Sì (se delta > 0) | Sì | Limite 3/giorno. |
| **Streak / DAILY_LOGIN** | useAwardPE → RPC | Sì (se delta > 0) | Sì | Limite 1/giorno → secondo check-in stesso giorno no emit. |
| **Battle (attaccante)** | useAwardPE → RPC | Sì (BATTLE_WIN delta>0; BATTLE_LOSE negativo → no) | Sì | Sconfitta: delta negativo, nessun emit. |
| **Battle Defense (difensore)** | Update diretto | Sì (solo se defender vince e peAmount > 0) | Sì | Dynamic import emit. |
| **Practice Mode (win PE)** | Update diretto | Sì (dopo updateBalanceAsync.then) | Sì | Dynamic import in .then() → ritardo. |
| **Clue milestone** | Update diretto | Sì (se milestone.pe > 0) | Sì | Dopo update, dynamic import. |
| **Onboarding** | Update diretto (fallback) | Sì (50 PE in entrambi i path) | Sì (solo fallback) | Primo path usa RPC inside .update (inválido); di fatto spesso fallback → emit. |
| **Vera Bomb** | RPC server | Sì (res.delta_pe) | Sì | Client dopo risposta. |
| **Map time 4min/10min** | useAwardPE → RPC | Sì (se delta > 0) | Sì | Limiti 1/giorno ciascuno. |
| **Pulse Breaker** | useAwardPE → RPC | Sì (se delta > 0) | Sì | |
| **AION chat** | useAwardPE → RPC | Sì (se delta > 0) | Sì | Limite 3/giorno. |
| **Forum post/comment** | useAwardPE → RPC | Sì (se delta > 0) | Sì | |
| **Daily Mission** | — | No | No | Server accredita solo M1U; nessun PE client-side. |
| **Fortune Wheel (segmenti PE)** | Edge/server | No | No | Client non chiama emitPECreditEvent per PE → modale **mai** per vincita PE. |
| **Marker claim** | useAwardPE (se usato da UI) | Sì (se delta > 0) | Sì | Dipende da dove si chiama awardPE('MARKER_CLAIM'). |

---

## 6. Analisi overlay

**File:** `src/features/pulse/components/GlobalPERewardOverlay.tsx`

- **Mount:** In `App.tsx` dentro `AuthProvider`, subito dopo `GlobalM1UCreditOverlay` (righe 265–266). Montato in alto nell’albero, non sotto Home.
- **Listener:** `useEffect(() => { window.addEventListener(PE_CREDIT_EVENT, handle); return () => { ... }; }, []);` → si registra al primo effect dopo il mount.
- **Condizioni per non mostrare il modale:**
  - `if (!detail?.amount || detail.amount <= 0) return;`
  - `if (animatingRef.current) return;` (modale già in corso)
  - `if (lastIdRef.current === detail.id) return;` (stesso evento)
  - `if (now - lastTimeRef.current < DEDUPE_MS) return;` con **DEDUPE_MS = 2500** → eventi entro 2,5 s dall’ultimo accettato vengono ignorati.
- **Nessun debounce esplicito** oltre al DEDUPE; **nessun** `if (oldPE === newPE)` nell’overlay (quello è in `emitPECreditEvent`: `amount <= 0`).

Quindi il modale **non** viene mostrato quando: amount ≤ 0, modale già aperto, stesso id, o secondo evento entro 2,5 s.

---

## 7. Race condition

- **Evento prima del mount del listener:** GlobalPERewardOverlay è montato in App sotto AuthProvider. L’`addEventListener` viene eseguito nell’`useEffect` del componente. Se un qualsiasi altro componente, in un suo effect eseguito **prima** di questo, inviasse `pe-credit-event` nello stesso tick o subito dopo, l’evento potrebbe essere inviato **prima** che il listener sia attaccato e andrebbe perso. L’ordine degli effect tra fratelli non è garantito. **Non dimostrabile** senza log a runtime; **possibile** in teoria.
- **Dynamic import:** PracticeMode, useClueMilestones, BattleDefenseModal, OnboardingOverlay usano `import('@/features/pulse/peCreditEvent').then(...)` prima di chiamare `emitPECreditEvent`. L’evento arriva quindi con un ritardo (anche minimo). Se in quel lasso di tempo l’utente ha già aperto/chiuso un altro modale PE, **DEDUPE_MS** o **animatingRef** possono far scartare il secondo evento.
- **BUZZ:** usa useAwardPE con import statico di `emitPECreditEvent` → chiamata sincrona dopo RPC → nessun ritardo da dynamic import; meno esposto a race con DEDUPE/animatingRef.

---

## 8. Cause certe

| # | Causa | Prova (file/riga) |
|---|--------|---------------------|
| 1 | Il modale è mostrato **solo** in risposta a `pe-credit-event` (non a `pe:awarded`) | GlobalPERewardOverlay.tsx:55 `window.addEventListener(PE_CREDIT_EVENT, handle)`; PE_CREDIT_EVENT = 'pe-credit-event'. |
| 2 | `emitPECreditEvent` non invia nulla se **amount <= 0** | peCreditEvent.ts:57 `if (typeof window === 'undefined' \|\| amount <= 0) return;` |
| 3 | useAwardPE chiama `emitPECreditEvent` **solo se delta > 0** dopo RPC riuscito | useAwardPE.ts:236–240 `if (delta > 0) { emitPECreditEvent(delta, source, ...) }` |
| 4 | Se useAwardPE esce per **limitReached** o **errore RPC**, non si chiama mai `emitPECreditEvent` | useAwardPE.ts: ritorno early con limitReached (165–168) o error (178–180), prima del dispatch. |
| 5 | L’overlay scarta eventi con **amount <= 0**, mentre **animatingRef** è true, stesso **id**, o entro **2500 ms** dall’ultimo | GlobalPERewardOverlay.tsx:37–41 |

---

## 9. Cause probabili

| # | Causa | Motivazione |
|---|--------|-------------|
| 1 | **Limite giornaliero** (BUZZ 5, DAILY_LOGIN 1, MAP_TIME 1, ecc.) | Dopo il limite, useAwardPE ritorna senza chiamare emitPECreditEvent → modale non appare per quella azione. |
| 2 | **DEDUPE_MS 2500 ms** | Due crediti PE a distanza < 2,5 s (es. BUZZ + altro, o due azioni rapide): il secondo evento viene ignorato. |
| 3 | **Flussi con update diretto + dynamic import** | L’evento viene emesso in ritardo; può arrivare con modale già aperto (animatingRef) o in finestra DEDUPE → scartato. |
| 4 | **Daily Mission / Fortune Wheel PE** | Daily Mission non accredita PE lato client; Fortune Wheel non emette `emitPECreditEvent` per i PE → modale non può apparire per questi. |
| 5 | **BATTLE_LOSE** (attaccante) | useAwardPE passa delta negativo; `emitPECreditEvent` non viene chiamato (delta > 0 falso) → modale corretto che non appare. |

---

## 10. Proposte fix (senza implementazione)

1. **Centralizzare il dispatch PE**  
   Far passare tutti i crediti PE (anche da update diretto o da server) da un unico punto che: aggiorna lo stato/DB, poi chiama sempre `emitPECreditEvent(amount, ...)` se amount > 0.  
   **Pro:** Comportamento uniforme, meno dimenticanze. **Contro:** Refactor di più flussi.

2. **Garantire sempre pe:awarded + emitPECreditEvent dopo ogni credito reale**  
   Audit di tutti i punti che scrivono su `pulse_energy` (o che ricevono delta da server) e aggiungere, dove manca, chiamata a `emitPECreditEvent` con amount > 0.  
   **Pro:** Modale presente per ogni credito. **Contro:** Nessuno; solo allineamento.

3. **Coda eventi prima del mount overlay**  
   Buffer globale degli eventi `pe-credit-event` emessi prima che GlobalPERewardOverlay abbia registrato il listener; al mount, processare la coda.  
   **Pro:** Elimina la race “evento prima del listener”. **Contro:** Complessità e rischio di doppie aperture se non gestita bene.

4. **Un solo event emitter**  
   Deprecare dispatch diretti di `pe-credit-event` e usare ovunque un helper (es. `notifyPECredit(amount, source, metadata)`) che fa sempre lo stesso dispatch.  
   **Pro:** Un solo punto da filtrare/loggare. **Contro:** Refactor minore.

5. **Overlay come listener di uno store globale**  
   Invece di eventi DOM, uno store (Zustand/Context) con una coda “pending PE rewards”; l’overlay si sottoscrive e mostra un modale per ogni elemento in coda (con eventuale DEDUPE lato store).  
   **Pro:** Nessuna perdita per timing del listener; ordine e dedupe controllabili. **Contro:** Cambio architetturale più grande.

---

*Report forense read-only. Nessuna modifica al codice, nessun commit.*
