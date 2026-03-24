# PE MODAL HARDENING — QUEUE + DEDUPE INTELLIGENTE — REPORT FINALE

**Data:** 2026-03-09  
**Repo:** /Users/josephmule/lux-hunt-treasure  
**Piattaforma:** App nativa wrappata iOS (Capacitor WKWebView)

---

## 1. Branch iniziale e HEAD iniziale

- **Branch:** `feat/pe-global-fullscreen-reward`
- **HEAD iniziale:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 2. Tag / branch di safety creati

- **Branch:** `safety/fix-pe-modal-queue-pre`
- **Tag:** `safety/pe-modal-queue-pre`

Creati prima di qualsiasi modifica. Rollback disponibile in qualsiasi momento.

---

## 3. File effettivamente modificati

| File | Modifiche |
|------|-----------|
| **`src/features/pulse/components/GlobalPERewardOverlay.tsx`** | Coda eventi, dedupe per id + finestra 300 ms, rimosso DEDUPE_MS 2500 |

**Nessun altro file toccato.**  
Non modificati: `peCreditEvent.ts`, `useAwardPE.ts`, BUZZ, Buzz Map, auth, IAP, push, routing, Supabase, Fortune Wheel, Daily Mission.

---

## 4. Motivo preciso di ogni modifica

- **Queue:** Gli eventi `pe-credit-event` che arrivano mentre il modale è già aperto non vengono più scartati. Vengono accodati in `queueRef` e mostrati uno dopo l’altro alla chiusura del modale corrente (stesso `close()` che gestisce auto-close e tap “Continua”).
- **Dedupe intelligente:** Eliminata la regola “scarta qualsiasi evento entro 2500 ms dall’ultimo”. Restano: (1) scarto se `detail.amount <= 0`; (2) scarto solo se stesso `detail.id` e entro **300 ms** (anti-rimbalzo per doppio dispatch dello stesso evento). Due crediti PE diversi e ravvicinati nel tempo vengono entrambi mostrati (il secondo in coda se il primo è ancora aperto).
- **Riferimenti:** `animatingRef` sostituito con `showingRef`; aggiunti `queueRef` e `lastIdTimeRef`. `lastTimeRef` e costante `DEDUPE_MS` rimossi.

---

## 5. Come funziona ora la queue

1. Arrivo di un evento valido (`amount > 0`): se **nessun modale è aperto** (`!showingRef.current`), si mostra subito e si avvia il timer di auto-close (3500 ms).
2. Se **un modale è già aperto** (`showingRef.current`), l’evento viene pushato in `queueRef.current` e non si fa nulla in più.
3. Alla chiusura (tap “Continua” o timeout): si fa `setPayload(null)`, si cancella il timer, si fa `next = queueRef.current.shift()`. Se c’è un `next`, si mostra con `setPayload(next)` e si riavvia il timer di auto-close; altrimenti si imposta `showingRef.current = false`.
4. Ordine di arrivo preservato (FIFO). Una sola istanza di modale alla volta; nessun memory leak (la coda è un array in ref, svuotata con `shift`).

---

## 6. Come funziona ora il dedupe intelligente

- **Stesso evento (stesso `id`) entro 300 ms:** ignorato (anti-rimbalzo per doppio fire).
- **Eventi con `id` diversi:** non si scartano per motivo temporale; si mostrano subito o in coda.
- **`amount <= 0`:** continuano a essere ignorati (sia in `emitPECreditEvent` che nel listener).

Nessuna finestra fissa di 2500 ms che scarta eventi legittimi.

---

## 7. Quali sorgenti PE ora garantiscono il modale

Invariato rispetto a prima: tutte le sorgenti che chiamano `emitPECreditEvent(amount, ...)` con `amount > 0` possono far apparire il modale. La differenza è che:

- **useAwardPE** (BUZZ, BUZZ MAP, Streak, Battle, Map time, Pulse Breaker, AION, Forum, ecc.): già emette se `delta > 0`; nessun cambio.
- **BattleDefenseModal, PracticeMode, useClueMilestones, OnboardingOverlay, useBombMissionRun:** già emettono; nessun cambio.

Con la coda, se più eventi arrivano in sequenza rapida (es. BUZZ + altro), tutti vengono mostrati in ordine invece che perdere il secondo.

---

## 8. Quali sorgenti restano fuori scope e perché

- **Daily Mission:** accredito solo M1U lato client; nessun PE → nessun emit e nessun modale PE. Fuori scope.
- **Fortune Wheel (segmenti PE):** il client oggi non chiama `emitPECreditEvent` per i PE; eventuale allineamento richiederebbe modifica al flusso risultato ruota. Non toccato per minimizzare blast radius.
- **Auth, Home, IAP, BUZZ/Buzz Map (logica), push, routing:** non coinvolti dalla patch.

---

## 9. Esito build

```bash
npm run build
```

**Risultato:** ✅ Exit code 0. Build completata in ~1m 31s. Bundle generato in `dist/`. Nessun errore; warning solo preesistenti (dynamic/static import).

---

## 10. Esito `npx cap sync ios`

```bash
npx cap sync ios
```

**Risultato:** ✅ Exit code 0.  
- Copying web assets: ✔  
- Updating iOS plugins: ✔  
- Sync finished in ~67s  

---

## 11. Commit finale

**Nessun commit eseguito automaticamente.** Se approvi le modifiche, puoi eseguire:

```bash
git add src/features/pulse/components/GlobalPERewardOverlay.tsx
git commit -m "fix(pe): queue PE reward modal + intelligent dedupe (id+300ms)

- Queue: events while modal open are enqueued and shown one after another
- Dedupe: remove 2500ms window; only ignore same event id within 300ms
- Prevents dropping legitimate PE credits (e.g. BUZZ + streak close in time)"
```

---

## 12. Comandi rollback esatti

Per annullare tutto e tornare allo stato pre-patch:

```bash
git reset --hard safety/pe-modal-queue-pre
```

Oppure, per spostarsi sul branch di safety senza cambiare i file correnti:

```bash
git checkout safety/fix-pe-modal-queue-pre
```

---

## Verifica statica post-patch

| Punto | emitPECreditEvent | Modificato in questa patch? |
|-------|--------------------|-----------------------------|
| useAwardPE.ts | Sì (delta > 0) | No |
| OnboardingOverlay.tsx | Sì | No |
| BattleDefenseModal.tsx | Sì (defender win) | No |
| useClueMilestones.ts | Sì | No |
| PracticeMode.tsx | Sì | No |
| useBombMissionRun.ts | Sì | No |
| GlobalPERewardOverlay.tsx | Listener only | Sì (queue + dedupe) |

Nessun file sensibile (login, logout, IAP, BUZZ, auth, push, routing) è stato modificato.

---

*Patch chirurgica completata. Rollback pronto. Build e cap sync iOS OK.*
