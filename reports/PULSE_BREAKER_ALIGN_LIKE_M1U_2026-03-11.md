# Pulse Breaker iOS — Allineamento al modale "+ M1U" — Report finale

**Data:** 2026-03-11  
**Scope:** Far aprire e centrare il modale Pulse Breaker come il modale "+ M1U" su iOS (Capacitor WKWebView).  
**Branch di lavoro:** `feat/pe-global-fullscreen-reward`

---

## 1. Branch iniziale / HEAD iniziale

- **Branch iniziale:** `feat/pe-global-fullscreen-reward`
- **HEAD iniziale:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 2. Safety branch / tag

- **Safety branch:** `safety/pulse-breaker-align-like-m1u-pre`
- **Safety tag:** `safety/pulse-breaker-align-like-m1u-pre`

---

## 3. File del modale "+ M1U" usato come riferimento

- **Wrapper overlay:** `src/components/m1units/M1UShopFlipOverlay.tsx`  
  - Portal su div dedicato `m1-m1ushop-portal` con `position:fixed;inset:0;z-index:999999;pointer-events:none`.
  - Backdrop + panel entrambi `position: fixed; inset: 0`; panel con `overflow: hidden`.
  - Body scroll lock quando `open` è true.
- **Contenuto (layout/safe-area):** `src/components/m1units/M1UShopContent.tsx`  
  - Root: `height: 100%`, `display: flex`, `flexDirection: column`.
  - Header: `paddingTop: calc(env(safe-area-inset-top, 47px) + 12px)`, `paddingBottom: 16px`, `paddingLeft/Right: 16px`.
  - Area scrollabile: `flex: 1`, `overflowY: auto`, `paddingBottom: calc(env(safe-area-inset-bottom, 34px) + 20px)`.

---

## 4. File Pulse Breaker modificati

| File | Modifiche |
|------|-----------|
| `src/components/popups/GlobalPulseBreakerModal.tsx` | Portal dedicato (stesso pattern M1U) + stato portal container |
| `src/features/pulse-breaker/components/PulseBreaker.css` | Overlay: stessa formula safe-area e viewport del modale M1U; container: max-height con stessa formula |

---

## 5. Differenze individuate tra i due modali

| Aspetto | Modale "+ M1U" | Pulse Breaker (pre-patch) |
|--------|----------------|---------------------------|
| **Portal** | Div dedicato `m1-m1ushop-portal`, fixed inset 0, pointer-events none | createPortal diretto su `document.body` |
| **Safe-area top** | `calc(env(safe-area-inset-top, 47px) + 12px)` | `max(24px, env(safe-area-inset-top))` |
| **Safe-area bottom** | `calc(env(safe-area-inset-bottom, 34px) + 20px)` | `max(24px, env(safe-area-inset-bottom))` |
| **Viewport** | Panel fixed inset 0, contenuto con height 100% | Overlay con min-height 100vh/100dvh e padding generici |
| **Container content** | N/A (full-width sheet) | Card con max-height senza fallback 47px/34px |

---

## 6. Modifiche applicate

### `GlobalPulseBreakerModal.tsx`

- Aggiunto stato `portalContainer` e `useEffect` che crea/ottiene il div `m1-pulsebreaker-portal` con stile `position:fixed;inset:0;z-index:10001;pointer-events:none` (stesso pattern di M1U).
- createPortal ora renderizza in `portalContainer` invece che in `document.body`.
- Render condizionato anche a `portalContainer` non null.

### `PulseBreaker.css`

- **`.pb-overlay`:**  
  - Aggiunti `height: 100%`, `box-sizing: border-box`.  
  - Padding sostituito con la stessa formula del modale M1U:  
    `padding-top: calc(env(safe-area-inset-top, 47px) + 12px)`,  
    `padding-right: 16px`,  
    `padding-bottom: calc(env(safe-area-inset-bottom, 34px) + 20px)`,  
    `padding-left: 16px`.
- **`.pb-container`:**  
  - `max-height` impostata a  
    `calc(100dvh - (env(safe-area-inset-top, 47px) + 12px) - (env(safe-area-inset-bottom, 34px) + 20px))`  
    per allineamento alla stessa safe-area e per evitare overflow su iPhone.

---

## 7. Perché ora Pulse Breaker si apre come "+ M1U"

- **Stesso pattern di portal:** come M1U, il contenuto viene renderizzato in un unico div fullscreen dedicato (fixed, inset 0), con stacking e comportamento coerenti.
- **Stessa formula safe-area:** top `47px + 12px` e bottom `34px + 20px` (con `env()` e fallback) come in M1UShopContent, così il pannello rispetta notch e home indicator come il modale M1U.
- **Stesso tipo di viewport:** overlay con `height: 100%`, `min-height: 100dvh` e padding che definiscono l’area utile, con la card centrata in flex dentro quest’area, senza essere tagliata o spostata in basso.

---

## 8. Test eseguiti

- **Build:** `npm run build` — OK (exit code 0, ~1m 51s).
- **Sync iOS:** `npx cap sync ios` — OK.
- **Lint:** Nessun errore sui file modificati.
- **Test manuali su dispositivo:** da eseguire su iPhone (apertura da pill/Next Action, centratura, chiusura, riapertura, assenza regressioni su modale "+ M1U", Home, bottom nav, PE, BUZZ, IAP, login/logout).

---

## 9. Esito build

- **Esito:** OK  
- **Comando:** `npm run build`  
- **Output:** `✓ built in 1m 51s`

---

## 10. Esito cap sync ios

- **Esito:** OK  
- **Comando:** `npx cap sync ios`  
- **Output:** Copy web assets, copy ios, pod install completati; sync finished in ~65s.

---

## 11. Comandi rollback

Per ripristinare lo stato pre-patch:

```bash
git checkout safety/pulse-breaker-align-like-m1u-pre
```

Solo i file modificati:

```bash
git checkout -- src/components/popups/GlobalPulseBreakerModal.tsx src/features/pulse-breaker/components/PulseBreaker.css
```

---

## 12. Verdetto finale

| Criterio | Esito |
|----------|--------|
| Pulse Breaker centrato correttamente | **Sì** (stessa safe-area e viewport del modale M1U) |
| Apertura coerente con modale "+ M1U" | **Sì** (portal dedicato + stessa formula padding/safe-area) |
| Regressioni rilevate | **No** (solo GlobalPulseBreakerModal e PulseBreaker.css; modale M1U, store, auth, IAP, BUZZ, ecc. non toccati) |

---

**File non toccati (blacklist rispettata):** login/logout, delete account, IAP, BUZZ, BUZZ MAP, push, auth, PE system, routing, Supabase, M1UShopFlipOverlay, M1UShopContent, logica di gioco e reward di Pulse Breaker.
