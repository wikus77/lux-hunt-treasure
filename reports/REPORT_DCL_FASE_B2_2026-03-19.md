# Report — M1SSION™ Daily Control Loop — Fase B2 Enterprise  
## Overlay celebrativo 3/3 + payoff forte

**Data:** 2026-03-19  
**Target:** App nativa wrappata iOS (Capacitor WKWebView)  
**Vincoli:** ULTRA SAFE, solo iOS wrapped, nessuna modifica a RPC/SQL/business logic.

---

## 1. FORENSICS SUMMARY

### Punto corretto dove è stato agganciato l’overlay

L’overlay è agganciato **subito dopo** che la RPC `claim_daily_control_loop_bonus` ritorna `result?.ok === true`:

- **Dove:** In `handleClaimBonus` in `DailyControlLoopCard.tsx`, nel ramo `if (result?.ok)`.
- **Sequenza:** Si imposta `celebrationAmount`, si chiama `markBonusClaimed()`, si imposta `setShowCelebrationOverlay(true)`, si chiama `refetch()`.
- **Perché è il punto più sicuro:** Mostrare l’overlay solo in risposta al **claim effettivo** evita:
  - doppie aperture (una sola show per claim),
  - apertura al remount (lo stato `showCelebrationOverlay` è inizializzato a `false`),
  - apertura quando l’utente è solo 3/3 con bonus “disponibile” ma non ha ancora premuto “Riscatta bonus”.

Non si è scelto di mostrare l’overlay al “diventare 3/3” (es. dopo completamento missione) per evitare show ogni volta che l’utente apre la Home con 3/3 già fatto.

### Pattern riusati

- **StreakModal (success overlay):** createPortal su `document.body`, fullscreen con `backdropFilter`, `motion.div` con scale spring, icona Check in cerchio con gradient, z-index 100000. Stesso schema adattato per DCL (palette cyan/verde, testi i18n).
- **Stile glass/dark/cyan:** Allineato alla card DCL e al design system (bordi cyan, blur, safe-area).
- **Haptic:** `hapticLight()` alla chiusura (come in StreakModal/OnboardingOverlay).
- **Nessun confetti/animazioni pesanti:** Solo entrance spring e chiusura su CTA, per performance e “no effetti troppo pesanti”.

### Rischi individuati e mitigazioni

| Rischio | Mitigazione |
|--------|--------------|
| Doppia apertura | Overlay mostrato solo nel path `result?.ok`; dopo refetch il bottone diventa “Bonus riscattato”, quindi non si può richiamare. |
| Race refetch/claim | `setShowCelebrationOverlay(true)` e `refetch()` sono nello stesso tick; l’overlay non dipende dai dati refetchati per la sua prima render. |
| Overlay al remount | Stato locale `showCelebrationOverlay` inizializzato a `false`; nessuna persistenza. |
| Realtime Fase A | Nessuna modifica a listener di eventi o a `refetch`; solo stato locale e portal. |
| i18n | Tutti i testi dell’overlay passano da chiavi it/en/fr. |

### Perché la scelta è safe e premium

- **Safe:** Un solo trigger (successo RPC claim), nessun tocco a RPC/SQL/Commit/Streak/Mission, nessun cambiamento a DclLauncherContext o SectionErrorBoundary.
- **Premium:** Overlay fullscreen glass, icona celebrativa, messaggi chiari (ciclo completato, M1U accreditate, risorse pronte, messaggio BUZZ/build), CTA “Chiudi” esplicita, coerente con StreakModal e con il tono M1SSION.

---

## 2. FIX REPORT

### File toccati

| File | Modifiche |
|------|-----------|
| `src/components/home/DailyControlLoopCard.tsx` | Import `createPortal`, `hapticLight`; stato `showCelebrationOverlay`, `celebrationAmount`; in `handleClaimBonus` (ramo `result?.ok`) impostazione amount, `setShowCelebrationOverlay(true)` e rimozione toast; `handleCloseCelebration`; portal overlay con createPortal su `document.body`; return wrappato in fragment `<>` e reso `{celebrationOverlay}`. |
| `src/locales/it/common.json` | Aggiunte chiavi `dcl_celebration_*` (title, m1u, resources, buzz_ready, build, close). |
| `src/locales/en/common.json` | Stesse chiavi in inglese. |
| `src/locales/fr/common.json` | Stesse chiavi in francese. |

### Logica di apertura overlay

- **Apertura:** Solo quando `handleClaimBonus` riceve `result?.ok` dalla RPC `claim_daily_control_loop_bonus`. Si setta `celebrationAmount` con `result?.amount ?? DAILY_BONUS_M1U_AMOUNT`, poi `setShowCelebrationOverlay(true)`.
- **Chiusura:** CTA “Chiudi” e tap sul backdrop chiamano `handleCloseCelebration` → `hapticLight()` + `setShowCelebrationOverlay(false)`.

### Evitare doppia apertura

- L’overlay è mostrato **solo** nel ramo successo del claim (una volta per sessione per utente che clicca “Riscatta bonus” con successo).
- Dopo `refetch()`, la card mostra “Bonus riscattato” e il bottone non è più visibile; non è possibile richiamare il claim.
- Nessun `useEffect` che imposti `showCelebrationOverlay` in base a `daily_bonus_claimed` o `daily_completion_count`, quindi niente show al remount o al ritorno in Home.

### Testi i18n aggiunti

- `dcl_celebration_title` — “Hai completato il tuo ciclo operativo.” (IT) / “You've completed your operational cycle.” (EN) / “Vous avez terminé votre cycle opérationnel.” (FR)
- `dcl_celebration_m1u` — “+{{amount}} M1U accreditate.” (IT) / “+{{amount}} M1U credited.” (EN) / “+{{amount}} M1U créditées.” (FR)
- `dcl_celebration_resources` — “Le tue risorse operative sono pronte.” (IT) / “Your operational resources are ready.” (EN) / “Vos ressources opérationnelles sont prêtes.” (FR)
- `dcl_celebration_buzz_ready` — “Ora hai abbastanza per un nuovo BUZZ.” (IT) / “You now have enough for a new BUZZ.” (EN) / “Vous avez assez pour un nouveau BUZZ.” (FR)
- `dcl_celebration_build` — “Continua a costruire le tue risorse.” (IT) / “Keep building your resources.” (EN) / “Continuez à construire vos ressources.” (FR)
- `dcl_celebration_close` — “Chiudi” / “Close” / “Fermer”

---

## 3. UX REPORT

### Cosa vede l’utente

Dopo aver premuto “Riscatta bonus” e aver ricevuto con successo il bonus 3/3:

1. **Overlay fullscreen** con sfondo scuro e blur (glass).
2. **Icona Check** in un cerchio con gradient cyan/verde e leggero glow.
3. **Titolo:** “Hai completato il tuo ciclo operativo.”
4. **Importo:** “+10 M1U accreditate.” (o l’amount restituito dalla RPC).
5. **Sottotitolo:** “Le tue risorse operative sono pronte.”
6. **Messaggio contestuale:** Se il saldo (post-claim) è sufficiente per un BUZZ: “Ora hai abbastanza per un nuovo BUZZ.” Altrimenti: “Continua a costruire le tue risorse.”
7. **Bottone “Chiudi”** per chiudere l’overlay (e tap sul backdrop).

### Quando appare l’overlay

Solo **dopo** che l’utente ha premuto “Riscatta bonus” e la RPC ha restituito successo. Non quando diventa 3/3, non quando torna in Home con bonus già riscattato.

### Cosa comunica

- Chiusura chiara del ciclo operativo giornaliero.
- Ricompensa esplicita (+X M1U).
- Legame con le “risorse operative” e con il passo successivo (BUZZ o continuare a costruire).

### Perché il risultato è più premium

- Niente toast generico: un overlay dedicato con gerarchia visiva e messaggi curati.
- Coerenza con StreakModal (stesso tipo di success overlay) e con la palette DCL (cyan, dark, glass).
- Messaggio BUZZ/build contestuale aumenta la percezione di progressione e di utilità delle M1U.

---

## 4. RISK REPORT

### Rischi residui

- **Basso:** L’overlay non ha auto-close; l’utente deve premere “Chiudi” o il backdrop. Comportamento voluto per dare controllo e leggibilità.
- **Basso:** Su dispositivi molto lenti, `refetch()` dopo il claim potrebbe aggiornare la card mentre l’overlay è ancora aperto; la logica non ne dipende.

### Limitazioni note

- Nessuna animazione di uscita (exit) dell’overlay: alla chiusura scompare. Accettabile per scope “ultra safe” e “niente effetti troppo pesanti”.
- Il toast di successo “+X M1U” è stato rimosso nel path di successo del claim per evitare duplicazione con l’overlay; il payoff è tutto nell’overlay.

### Perché non ci sono regressioni sui sistemi protetti

- **Login/logout, IAP, BUZZ, notifiche push, UnifiedHeader, BottomNavigation, routing:** Nessun file toccato.
- **Commit / Streak / Mission (business logic):** Nessuna modifica; solo la card DCL e i locale.
- **RPC / SQL Fase 3–8:** Nessuna modifica.
- **DclLauncherContext, SectionErrorBoundary, realtime Fase A, CTA, reminder, weekly, messaggio M1U/BUZZ in card:** Invariati; l’overlay è stato aggiunto in parallelo (stato locale + portal).

---

## 5. GO / NO GO

**GO.** La Fase B2 è implementata in modo mirato, con overlay celebrativo agganciato al solo successo del claim, massimo riuso (createPortal, stile StreakModal, haptic), i18n completo e nessun tocco alla business logic. Si può passare alla fase successiva dopo aver verificato su dispositivo reale (build + cap:ios:incremental).

---

## 6. COMANDI FINALI

Eseguire in sequenza:

```bash
npm run build
npm run cap:ios:incremental
```

Poi aprire il progetto in Xcode e testare su dispositivo/simulatore: completare le 3 azioni, premere “Riscatta bonus” e verificare che l’overlay celebrativo appaia con i testi corretti e che “Chiudi” (e tap su sfondo) lo chiuda correttamente.
