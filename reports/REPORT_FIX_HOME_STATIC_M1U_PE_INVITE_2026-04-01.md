# REPORT FIX — HOME STATICA + M1U VISIBILE + HIDE PE + FIX INVITA UN AMICO

**Target:** Capacitor iOS WKWebView (stesso bundle tocca anche Android nativo per scroll lock) · **Data:** 2026-04-01  

---

## 1. FORENSICS SUMMARY

### Scroll Home — root cause

- Il **vero** scroll verticale avviene su **`<main class="m1-single-scroll-root">`** in `GlobalLayout.tsx`: `overflowY: 'auto'`, `minHeight: var(--app-height)`, `overscrollBehavior: 'auto'`, `WebkitOverflowScrolling: 'touch'` → contenuto più alto del viewport + rubber-band iOS.
- `MissionSync` avvolge il contenuto ma non è il root di scroll; legge `main.scrollTop` per il pull gesture.
- **Punto minimo sicuro per bloccare lo scroll:** lo stesso `<main>` quando route = Home **e** ambiente nativo Capacitor (`detectPWAEnvironment()`), senza toccare header/nav.

### Pill M1U

- Render in `AppHome.tsx`: `#m1u-pill-home-slot` **fixed** `left-4`, `z-[1001]`.
- Visibilità legata a `walletPillVisible` da **IntersectionObserver** sul sentinel in cima al flusso → su scroll nativo il pill **scompariva**.
- Fix: su **Capacitor** non si registra l’observer → `walletPillVisible` resta **true** (stato iniziale).

### Badge verde PE / lampo

- **AgentEnergyPill** (`features/pulse/components/AgentEnergyPill.tsx`): chip `bg-emerald` + `<Zap />` in overlay gain.
- **PulseBarPersonal**: chip analogo con testo `⚡ +N PE`.
- Solo **UI** condizionale; `useEffect` PE / stato **invariati**.

### Invita un amico + “triangolo”

- **InviteFloatingButton**: `pe-pill-orb` **fixed** `bottom-40 right-4`.
- **AgentEnergyPill**: wrapper **fixed** `bottom-24 right-4`.
- **Root cause overlap / asse:** due `fixed` indipendenti con offset diversi sulla **stessa fascia** basso-destra → collisione e sensazione “storto”.
- Il “triangolo” percepito: **Play** è sulla CTA GIOCA (centro); vicino al cluster destro si confondono anelli SVG / icone dei pill.

### Fix layout

- Un **unico** contenitore `fixed` `flex-col` `items-end` `gap-3`, `bottom: calc(88px + safe + 10px)` (sopra BottomNav), `InviteFloatingButton` in `layout="stacked"` (`relative`), **sotto** il rank pill — ordine verticale chiaro.

---

## 2. FILE ANALIZZATI

| File | Ruolo |
|------|--------|
| `GlobalLayout.tsx` | Scroll root `main` |
| `AppHome.tsx` | M1U slot, sentinel, `CommandCenterHome` |
| `MissionSync.tsx` | PTR / pull (non root scroll) |
| `CommandCenterHome.tsx` | Pulse bar, Invite, AgentEnergy |
| `InviteFloatingButton.tsx` | Pill invito |
| `AgentEnergyPill.tsx` | Rank + PE gain chip |
| `PulseBarPersonal.tsx` | Barra PE + gain chip |
| `appHomeUiHide.ts` | Flag rollback |

---

## 3. FILE TOCCATI

| File | Modifica | Rischio |
|------|-----------|---------|
| `GlobalLayout.tsx` | `lockAppHomeScroll`: `overflow` hidden, altezza viewport, `overscroll-behavior-y` | Contenuto oltre viewport **clippato** su Home nativa — coerente con richiesta “no scroll” |
| `AppHome.tsx` | Observer M1U disabilitato se Capacitor; prop `hidePeGainBadgeUi` | Basso |
| `appHomeUiHide.ts` | `APP_HOME_HIDE_PE_GAIN_BADGE_UI` | Basso |
| `CommandCenterHome.tsx` | Stack Invite+Rank; prop `hidePeGainBadgeUi` | Basso — anche route `/Home` eredita stack (allineamento migliore) |
| `InviteFloatingButton.tsx` | `layout` fixed \| stacked | Basso |
| `AgentEnergyPill.tsx` | `hidePeGainBadge` | Basso |
| `PulseBarPersonal.tsx` | `hidePeGainBadge` | Basso |

---

## 4. FIX APPLICATI

- **Home statica (nativa, path `/` o `/home`):** `main` con altezza `var(--app-height)`, `overflow` nascosto, niente scroll verticale sul root.
- **M1U sempre visibile:** niente IntersectionObserver su Capacitor.
- **PE gain nascosto:** flag + prop; logica PE invariata.
- **Invite + rank:** colonna fissa sopra tab bar, gap costante, Invite sopra al rank pill.

**Rollback:** `APP_HOME_HIDE_PE_GAIN_BADGE_UI = false`; in `GlobalLayout` rimuovere `lockAppHomeScroll`; ripristinare observer rimuovendo `if (isCapacitor) return`; ripristinare Invite/Agent come due `fixed` separati se necessario.

---

## 5. TEST ESEGUITI

- `npm run build` — OK  
- Test device: no scroll, M1U, GIOCA vs stack destro, safe area.

---

## 6. RISCHI RESIDUI

- Home nativa con contenuto più alto dello schermo: **parte bassa non raggiungibile** senza scroll (accettato dalla richiesta).
- Rubber-band **body** su alcuni iOS: mitigato su `main`; verifica reale su WKWebView.

---

## 7. GO / NO GO

- **GO** lato implementazione; **GO prodotto** dopo smoke iPhone su scroll, M1U, overlap GIOCA/stack destro.

---

## 8. COMANDI FINALI

```bash
npm run build
npm run cap:ios:incremental
```
