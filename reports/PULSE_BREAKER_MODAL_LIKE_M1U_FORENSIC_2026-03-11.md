# Pulse Breaker modal — Replica comportamento fullscreen modale "+ M1U" — Verifica forense e fix

**Data:** 2026-03-11  
**Scope:** Far aprire/chiudere il modale Pulse Breaker con lo stesso identico pattern del modale "+ M1U" (M1 Units Shop) su iOS.  
**Branch:** `feat/pe-global-fullscreen-reward` | **HEAD iniziale:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 1. Branch iniziale / HEAD iniziale

- **Branch iniziale:** `feat/pe-global-fullscreen-reward`
- **HEAD iniziale:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 2. Safety branch / tag

- **Safety branch:** `safety/pulse-breaker-modal-like-m1u-pre`
- **Safety tag:** `safety/pulse-breaker-modal-like-m1u-pre`

---

## 3. Verifica forense modale "+ M1U"

### Entry point
- **File root:** `src/components/m1units/M1UnitsShopModal.tsx`  
  Composizione: `M1UShopFlipOverlay` + `M1UShopContent`.
- **Apertura:** Da `src/features/m1u/M1UPill.tsx`: stato `showShopModal`, `setShowShopModal(true)` in `handleOpenRecharge`; `shopOriginRect` da `getBoundingClientRect()` sul bottone "+".
- **Chiusura:** `onClose={() => setShowShopModal(false)}`; overlay chiama `handleClose` → `setIsClosing(true)` → dopo 280ms `onClose()`.

### Wrapper / shell / portal
- **File wrapper:** `src/components/m1units/M1UShopFlipOverlay.tsx`
- **Portal:** `createPortal(..., portalContainer)` con container creato/ottenuto da `getElementById('m1-m1ushop-portal')` (o creato con `position:fixed;inset:0;z-index:999999;pointer-events:none`).
- **Backdrop:** `motion.div` con `position: fixed`, `inset: 0`, `zIndex: 99998`, `onClick={handleClose}`, blur + sfondo scuro.
- **Panel:** `motion.div` con `position: fixed`, `inset: 0`, `zIndex: 99999`, `overflow: hidden`, `transformOrigin` da `originRect` (o fallback `50% 5%`), animazione scale 0.1→1 (spring), `onClick={(e) => e.stopPropagation()}`. I **children** sono il contenuto (es. `M1UShopContent`).

### Animazione
- **Framer Motion:** `AnimatePresence mode="wait"`, `open && (backdrop + panel)`.
- **Backdrop:** opacity 0→1, exit 0; transition duration 0.25 (0.2 se closing).
- **Panel:** scale 0.1 + opacity 0 → scale 1 + opacity 1; exit scale 0.1 + opacity 0; spring (stiffness 280, damping 24; closing 400/32).

### Scroll lock
- **File:** stesso `M1UShopFlipOverlay.tsx`, `useEffect` dipendente da `open`.
- **Comportamento:** se `open` → `document.body.style.overflow = 'hidden'` (salva `orig`), listener `keydown` per Escape; cleanup: ripristino `overflow`, rimozione listener.

### Positioning / layout
- **Portal container:** `position: fixed`, `inset: 0`, `z-index: 999999`, `pointer-events: none`.
- **Backdrop e panel:** entrambi `position: fixed`, `inset: 0` → fullscreen.
- **Contenuto (M1UShopContent):** root `height: 100%`, `display: flex`, `flexDirection: column`; header con `paddingTop: calc(env(safe-area-inset-top, 47px) + 12px)`; body scroll con `paddingBottom: calc(env(safe-area-inset-bottom, 34px) + 20px)`.

### Mini-mappa forense "+ M1U"
| Aspetto        | Dettaglio                                                                 |
|----------------|---------------------------------------------------------------------------|
| Entry point    | M1UPill → M1UnitsShopModal (isOpen, onClose, originRect)                  |
| Wrapper        | M1UShopFlipOverlay                                                        |
| Portal         | createPortal in div `m1-m1ushop-portal`, fixed inset 0, z 999999         |
| Animation      | AnimatePresence; backdrop opacity; panel scale spring + transformOrigin   |
| Close logic    | handleClose → isClosing → setTimeout 280ms → onClose()                    |
| Scroll lock    | body overflow hidden quando open; cleanup on close                       |
| Positioning    | Backdrop + panel fixed inset 0; overflow hidden sul panel                 |
| Layout shell   | Children = full-height flex column (M1UShopContent)                       |
| Contenuto      | M1UShopContent: header safe-area + body overflowY auto + safe-area bottom |

---

## 4. Verifica forense modale Pulse Breaker (pre-fix)

### Entry point
- **File root:** `src/components/popups/GlobalPulseBreakerModal.tsx`
- **Store:** `usePulseBreakerStore()` → `isOpen`, `closePulseBreaker`.
- **Apertura/chiusura:** controllate dallo store; nessun originRect.

### Wrapper / portal (pre-fix)
- **Portal:** createPortal su div dedicato `m1-pulsebreaker-portal` (stile fixed inset 0, z 10001).
- **Contenuto:** `<PulseBreaker isOpen onClose />` con **proprio** overlay (`.pb-overlay` in PulseBreaker.tsx): un solo `motion.div` che fa da overlay + contenitore, con flex center e card `.pb-container` dentro.

### Differenze tecniche (tabella)
| Aspetto           | Modale "+ M1U" (M1UShopFlipOverlay)     | Pulse Breaker (pre-fix)                    |
|-------------------|------------------------------------------|--------------------------------------------|
| Open flow         | M1UPill setState + originRect            | Store open + portal dedicato               |
| Close flow         | handleClose → 280ms → onClose            | onClose diretto (no delay animazione)      |
| Shell              | Backdrop + panel separati, fixed inset 0 | Un solo div overlay (pb-overlay)            |
| Fullscreen         | Panel fixed inset 0, children full height| Overlay con padding e flex center card     |
| Overlay            | Backdrop blur + panel (stesso overlay)   | Un solo layer (pb-overlay)                 |
| Scroll lock        | In overlay (body overflow hidden)       | In PulseBreaker (body overflow + touchAction) |
| Safe area          | In content (M1UShopContent padding)      | In .pb-overlay (padding CSS)               |
| Centering          | Content = full sheet (no center card)   | Flex center + card max-width 420px         |
| Position           | fixed inset 0 su backdrop e panel        | fixed inset 0 su pb-overlay               |
| Portal             | m1-m1ushop-portal                        | m1-pulsebreaker-portal                    |
| z-index            | 99998 backdrop, 99999 panel              | 10001 overlay                             |
| Padding            | Nel content (header/body)                | Sul overlay (padding-top/bottom)          |
| Motion             | AnimatePresence + scale spring + origin  | AnimatePresence + opacity overlay + scale card |

---

## 5. Cosa è stato riusato del "+ M1U"

- **M1UShopFlipOverlay** usato come **stesso** wrapper per Pulse Breaker: stesso portal pattern, stesso backdrop, stesso panel fixed inset 0, stessa animazione (scale + spring), stesso scroll lock (body overflow hidden), stessa close logic (handleClose con 280ms).
- Aggiunto **portalId** opzionale su `M1UShopFlipOverlay`: default `m1-m1ushop-portal` (M1U invariato), Pulse Breaker usa `portalId="m1-pulsebreaker-portal"` per non sovrascrivere il portal M1U.

---

## 6. Modifiche applicate

### `src/components/m1units/M1UShopFlipOverlay.tsx`
- Aggiunta prop opzionale **`portalId?: string`** (default `'m1-m1ushop-portal'`).
- Creazione/lettura portal con `getElementById(portalId)` e `container.id = portalId`.
- **M1U:** nessun cambio di comportamento (non passa `portalId`).

### `src/components/popups/GlobalPulseBreakerModal.tsx`
- **Prima:** createPortal su `m1-pulsebreaker-portal` con `<PulseBreaker isOpen onClose />`.
- **Dopo:** render di **M1UShopFlipOverlay** con `open={isOpen}`, `originRect={null}`, `onClose={closePulseBreaker}`, `portalId="m1-pulsebreaker-portal"` e children `<PulseBreaker isOpen onClose renderAsContentOnly />`.
- Rimosso stato portal e useEffect; niente createPortal in questo file.

### `src/features/pulse-breaker/components/PulseBreaker.tsx`
- Aggiunta prop **`renderAsContentOnly?: boolean`**.
- **Se `renderAsContentOnly`:** nessun body scroll lock (lo fa l’overlay); return con: effetti (crash flash, win celebration) + **shell uguale a M1UShopContent** (root `height: 100%`, flex column, overflow hidden; area flex:1 con alignItems/justifyContent center e padding safe-area `calc(env(safe-area-inset-top, 47px) + 12px)` / `calc(env(safe-area-inset-bottom, 34px) + 20px)`) + `motion.div.pb-container` con tutto il contenuto della card (close, header, game, controls, disclaimer) + modale disclaimer.
- **Se non `renderAsContentOnly`:** comportamento invariato (AnimatePresence + pb-overlay + scroll lock in PulseBreaker + stessa card).

---

## 7. Perché ora Pulse Breaker si apre/chiude come il "+ M1U"

- Usa **lo stesso componente** M1UShopFlipOverlay: stesso portal (con id diverso), stesso backdrop (blur, click to close), stesso panel (fixed inset 0, scale animation, overflow hidden), stessa logica di chiusura (280ms poi onClose), stesso **scroll lock** (body overflow hidden nell’overlay).
- Il contenuto Pulse Breaker è solo **children** dell’overlay, con shell layout (height 100%, flex, safe-area) allineata a M1UShopContent; la card resta centrata nell’area utile.

---

## 8. Come è bloccato lo scroll del fondo

- **Stesso pattern del modale "+ M1U":** in `M1UShopFlipOverlay`, quando `open` è true viene impostato `document.body.style.overflow = 'hidden'`; in cleanup (unmount/chiusura) viene ripristinato il valore precedente.
- Con `renderAsContentOnly`, Pulse Breaker **non** applica più il proprio body scroll lock (evita doppio intervento); l’unico lock è quello dell’overlay.

---

## 9. Test eseguiti

- **Build:** `npm run build` — OK (exit 0, ~1m 46s).
- **Sync iOS:** `npx cap sync ios` — OK.
- **Lint:** Nessun errore sui file modificati.
- **Test manuali richiesti su dispositivo:** apertura/chiusura Pulse Breaker (X e backdrop), apertura/chiusura modale "+ M1U", assenza scroll fondo con Pulse Breaker aperto, centratura e fullscreen, nessuna regressione su Home/BUZZ/BUZZ MAP/PE/IAP/login.

---

## 10. Esito build

- **Esito:** OK  
- **Comando:** `npm run build`  
- **Output:** `✓ built in 1m 46s`

---

## 11. Esito cap sync ios

- **Esito:** OK  
- **Comando:** `npx cap sync ios`  
- **Output:** Copy web assets, copy ios, pod install; sync finished in ~76s.

---

## 12. Comandi rollback

Per tornare allo stato pre-fix:

```bash
git checkout safety/pulse-breaker-modal-like-m1u-pre
```

Solo i file modificati:

```bash
git checkout -- src/components/m1units/M1UShopFlipOverlay.tsx src/components/popups/GlobalPulseBreakerModal.tsx src/features/pulse-breaker/components/PulseBreaker.tsx
```

---

## 13. Verdetto finale

| Criterio | Esito |
|----------|--------|
| Pulse Breaker usa davvero il pattern del "+ M1U" | **Sì** — stesso M1UShopFlipOverlay, stesso open/close/scroll lock/animazione |
| Fullscreen corretto | **Sì** — panel fixed inset 0, contenuto in shell full height + safe-area |
| Scroll fondo bloccato | **Sì** — body overflow hidden nell’overlay (stesso comportamento M1U) |
| Regressioni | **No** — M1U non passa portalId (default); Pulse Breaker usa portal id dedicato; logica gioco/reward/auth/IAP/BUZZ non toccata |

---

**File toccati:** `M1UShopFlipOverlay.tsx` (portalId opzionale), `GlobalPulseBreakerModal.tsx` (uso M1UShopFlipOverlay + PulseBreaker renderAsContentOnly), `PulseBreaker.tsx` (prop renderAsContentOnly e branch layout shell M1U).  
**File non toccati (blacklist):** login/logout, delete account, IAP, BUZZ, BUZZ MAP, push, auth, PE system, routing, Supabase, M1UShopContent, M1UnitsShopModal, logica reward/gioco Pulse Breaker.
