# Fix pilota — Suono click + feedback aptico (Cashback / Streak / Shop)

**Project:** M1SSION™ — iOS wrapped app (Capacitor WKWebView)  
**Data:** 2026-03-14  
**Scope:** Solo pill cashback, streak giornaliero, shop. Nessun tocco a BUZZ, BUZZ MAP, login, IAP, push, DB.

---

## 1. EXECUTIVE SUMMARY

**Cosa è stato fatto:**  
È stato implementato un test pilota di **suono click + feedback aptico** alla pressione di tre soli target: **pill Cashback**, **pill Streak giornaliero**, **pill Shop** (Home). Suono: file da Desktop copiato come `public/assets/audio/ui-click.mp3` (nome safe `ui-click.mp3`). Aptico: `hapticLight()` tramite `@/utils/haptics`. Helper dedicato: `buttonClickFeedback()` in `src/utils/buttonClickFeedback.ts`, usato solo nei tre componenti.

**Test pilota:** Implementazione completata. Build avviata; validazione su device iOS va fatta localmente (Run da Xcode dopo `npm run cap:ios:incremental`).

**Stato finale:** Branch `fix/ios-button-sound-haptic-pilot`, tag `safety/ios-button-sound-haptic-pilot-before`. Nessuna modifica a business logic, BUZZ, BUZZ MAP, login, IAP, push, DB, routing, i18n. Rollback: revert dei file toccati o `git checkout safety/ios-button-sound-haptic-pilot-before`.

---

## 2. FILE TOCCATI

**File creati:**
- `public/assets/audio/ui-click.mp3` — copia del file da Desktop (UIClick-A_short,_crisp_digit-Elevenlabs.mp3), nome safe per path e build.
- `src/utils/buttonClickFeedback.ts` — helper che esegue hapticLight() + play del click sound (fire-and-forget, volume 0.35, pool di un solo `HTMLAudioElement`).

**File modificati:**
- `src/components/home/CashbackVaultPill.tsx` — import `buttonClickFeedback`; nell’`onClick` della pill principale: chiamata `buttonClickFeedback()` poi `if (accumulatedM1U > 0) setShowClaimModal(true)`.
- `src/components/gamification/StreakPill.tsx` — import `buttonClickFeedback`; nell’`onClick` della pill: `buttonClickFeedback()` poi `setShowModal(true)`.
- `src/components/shop/ShopPill.tsx` — import `buttonClickFeedback`; in `handleOpenShop`: `buttonClickFeedback()` in testa, poi logica esistente (setOriginRect, setShowShop(true)).

**File non toccati ma rilevanti:**
- `src/utils/haptics.ts` — già usato (hapticLight); nessuna modifica.
- `src/lib/audio/AudioManager.ts` — non usato per questo click (scelta minimale: un solo Audio per il click).
- BuzzActionButton, BuzzMapButtonSecure, BottomNavigation, ecc. — non toccati.

---

## 3. STRATEGIA IMPLEMENTATA

**Dove è stato messo il file audio:**  
In `public/assets/audio/ui-click.mp3`. Il file originale sul Desktop (`UIClick-A_short,_crisp_digit-Elevenlabs.mp3`) è stato copiato con nome senza virgole per evitare problemi di path e bundling. In runtime si referenzia come `/assets/audio/ui-click.mp3` (stesso pattern di altri asset in `public/assets/audio`).

**Riproduzione suono:**  
In `buttonClickFeedback.ts`: un singolo `HTMLAudioElement` in pool, `volume = 0.35`, `currentTime = 0` prima di ogni play, `play().catch(() => {})` per non bloccare né propagare errori. Nessun loop, nessun autoplay. Se il contesto audio non è sbloccato (policy browser), il play può fallire in silenzio; l’azione UI (apertura modal/navigazione) non viene mai bloccata.

**Aptico:**  
`hapticLight()` da `@/utils/haptics` (già rispetta `m1_haptics_enabled` e Capacitor). Chiamata sincrona fire-and-forget; in web non nativo è no-op senza crash.

**Perché questa soluzione è la più sicura:**  
- Un solo punto di integrazione (buttonClickFeedback) riusabile in futuro.  
- Modifiche minime: solo tre componenti e un nuovo modulo; nessun cambiamento a flussi critici.  
- Fallback: se il suono non parte o l’aptico non è disponibile, il click continua a funzionare.  
- Nessuna dipendenza aggiuntiva; uso del pattern già in uso (haptics + Audio).  
- Rollback immediato rimuovendo l’helper e le tre chiamate.

---

## 4. TARGET COPERTI

| Target              | Componente              | Punto di applicazione                    | Esito        |
|---------------------|--------------------------|------------------------------------------|--------------|
| Cashback            | CashbackVaultPill       | onClick della pill principale            | Implementato |
| Streak giornaliero  | StreakPill              | onClick della pill (apre StreakModal)    | Implementato |
| Shop                | ShopPill                 | handleOpenShop (bottone pill Shop)       | Implementato |

Comportamento originario invariato: dopo `buttonClickFeedback()` viene eseguita la stessa logica di prima (open modal / set state). Nessun doppio trigger: una sola chiamata a `buttonClickFeedback()` per evento click.

---

## 5. VALIDAZIONE

**Build:**  
`npm run build` è stato avviato in sessione (prebuild push-guard passato, vite build avviato). Per conferma completa eseguire in locale:

```bash
npm run build
```

**Sync iOS (comando obbligatorio):**

```bash
npm run cap:ios:incremental
```

Non usare `npx cap sync ios` né `npm run cap:sync:ios`.

**Warning:**  
Nessun warning introdotto da questa modifica. In StreakPill restano warning/errori TypeScript preesistenti (tipi Supabase) non legati a questo fix.

**Note runtime:**  
- Su iOS in Capacitor: haptic funziona se l’utente ha abilitato gli haptic nelle impostazioni; il suono funziona dopo un primo gesto utente (policy autoplay).  
- In browser: haptic è no-op; il click sound può essere bloccato fino al primo tap dell’utente.

---

## 6. RISCHIO RESIDUO

**Estensione del pattern:**  
Il pattern è sicuro per essere esteso ad altri pulsanti/pill: chiamare `buttonClickFeedback()` all’inizio dell’handler di click, senza sostituire la logica esistente. Attenzione a non chiamarlo due volte per lo stesso evento (es. bubble su wrapper e su bottone interno).

**Cosa monitorare:**  
- Su device iOS: eventuale ritardo percepito al primo tap (unlock audio).  
- Volume: 0.35 può essere ridotto o reso configurabile se risultasse invasivo.  
- Se in futuro si aggiungono molti suoni, valutare AudioManager per categoria `feedback` per evitare sovrapposizioni.

---

## 7. PIANO DI ESTENSIONE AGLI ALTRI TASTI/PILL DI M1SSION

**Analisi famiglie di controlli:**  
- **Pill informative (solo apertura modal):** come Streak/Shop/Cashback — candidati naturali per lo stesso feedback (es. altre pill in Home, header).  
- **CTA di navigazione:** BottomNavigation già ha suoni propri; UnifiedHeader ha hapticLight su alcuni link. Estensione: stesso click sound opzionale su CTA secondari (es. link “Scopri” nelle card).  
- **Pulsanti critici:** Conferma ordine, IAP, Delete account — **non** applicare lo stesso suono “giocoso” senza design esplicito; eventuale feedback diverso (es. suono “conferma” più neutro).  
- **Pulsanti economy/shop/reward:** Acquisti M1U, claim reward, gira ruota — candidati per click + haptic leggero, in fase successiva.  
- **BUZZ / BUZZ MAP:** **NON toccare** (paletto); hanno già suono/feedback dedicato.  
- **Pulsanti modali:** Chiudi, Annulla, OK — si può applicare lo stesso pattern con priorità bassa.  
- **Settings / Account:** Toggle, link — haptic già usato; si può aggiungere il click sound in una fase “Fase B”.

**Proposta rollout in fasi:**  
- **Fase A (fatto):** Cashback, Streak, Shop pill.  
- **Fase B:** Altre pill e CTA non critici in Home/Command Center (es. Mission card, Learn, Help). Stesso `buttonClickFeedback()`.  
- **Fase C:** Pulsanti reward/economy (claim, ruota, scratch) e pulsanti modali “neutri” (Chiudi, Annulla). Eventuale secondo suono “conferma” per azioni irreversibili (da definire in design).

**Motivazione:** Fase A valida il pattern senza impatto su flussi frozen. Fase B estende la sensazione di reattività. Fase C allinea reward e modali mantenendo i pulsanti critici (IAP, delete account) con trattamento separato.

---

## 8. GO / NO GO PER ESTENSIONE FUTURA

**GO.**  
Il pilota è limitato, reversibile e allineato ai paletti. Il pattern `buttonClickFeedback()` è riutilizzabile; l’estensione va fatta per fasi (prima pill/CTA non critici, poi reward/modali, evitando BUZZ/BUZZ MAP e pulsanti critici senza design esplicito).

---

## ROLLBACK

- **Branch:** `fix/ios-button-sound-haptic-pilot`  
- **Tag (prima dello switch):** `safety/ios-button-sound-haptic-pilot-before`

Per annullare le modifiche:

1. Rimuovere `src/utils/buttonClickFeedback.ts`.  
2. Rimuovere da CashbackVaultPill, StreakPill e ShopPill l’import e le chiamate a `buttonClickFeedback`.  
3. (Opzionale) Rimuovere `public/assets/audio/ui-click.mp3`.

Oppure:

```bash
git checkout safety/ios-button-sound-haptic-pilot-before -- src/utils/buttonClickFeedback.ts src/components/home/CashbackVaultPill.tsx src/components/gamification/StreakPill.tsx src/components/shop/ShopPill.tsx
# e rimuovere manualmente public/assets/audio/ui-click.mp3 se presente
```

---

**Fine report.**
