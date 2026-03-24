# Pulse Breaker iOS — Modale non centrato + scroll attivo — Fix e report finale

**Data:** 2026-03-11  
**Scope:** App nativa iOS (Capacitor WKWebView) — layout e scroll del modale Pulse Breaker  
**Branch di lavoro:** `feat/pe-global-fullscreen-reward`

---

## 1. Branch iniziale / HEAD iniziale

- **Branch iniziale:** `feat/pe-global-fullscreen-reward`
- **HEAD iniziale:** `7012170a1132f77a66f7359d69b9be6cd97e703b`

---

## 2. Branch safety / tag safety creati

- **Branch safety:** `safety/pulse-breaker-ios-layout-scroll-pre`
- **Tag safety:** `safety/pulse-breaker-ios-layout-scroll-pre`

*(Se già esistenti, usare variante con timestamp.)*

---

## 3. Verifica pre-patch: causa certa

**Causa accertata (forense read-only):**

- **Layout / centratura:** Il contenitore visibile è `.pb-overlay` in `PulseBreaker.css`. Aveva padding fissi `60px 16px 90px` senza `env(safe-area-inset-*)`, nessun `min-height: 100vh/100dvh` e `overflow-y: auto` sull’overlay, con possibile disallineamento e “taglio” su iPhone.
- **Scroll:** Nessun body scroll lock quando Pulse Breaker è aperto. Altri modali (es. `GlassModal.tsx`) usano `document.body.style.overflow = 'hidden'`, `document.body.style.touchAction = 'none'` e `document.body.classList.add('m1-modal-open')` con cleanup alla chiusura.
- **Perimetro:** Solo overlay/wrapper Pulse Breaker + scroll lock; nessun tocco a logica di gioco, reward, auth, IAP, BUZZ, BUZZ MAP, push, PE system.

---

## 4. File modificati

| File | Tipo modifica |
|------|----------------|
| `src/features/pulse-breaker/components/PulseBreaker.css` | Overlay: min-height viewport, padding safe-area, overflow; container: max-height, overflow-y per scroll interno |
| `src/features/pulse-breaker/components/PulseBreaker.tsx` | Body scroll lock quando `isOpen`; fix lint `t` (useTranslation) |

---

## 5. Cosa è stato cambiato in ogni file

### `PulseBreaker.css`

- **`.pb-overlay`:**
  - Aggiunto `min-height: 100vh` e `min-height: 100dvh` per riempire il viewport su iOS.
  - Sostituito padding fisso con `padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))`.
  - `overflow-y: auto` → `overflow: hidden` (overlay non scrollabile; scroll solo nel container interno).
- **`.pb-container`:**
  - Aggiunto `max-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 48px)`.
  - Aggiunto `overflow-y: auto` e `-webkit-overflow-scrolling: touch` per scroll interno della card quando il contenuto supera l’altezza.
  - Rimosso il secondo `overflow: hidden` che sovrascriveva `overflow-y: auto`.

### `PulseBreaker.tsx`

- **Body scroll lock:** In un `useEffect` dipendente da `isOpen`: quando aperto si impostano `document.body.style.overflow = 'hidden'`, `document.body.style.touchAction = 'none'`, `document.body.classList.add('m1-modal-open')`; in cleanup si ripristinano i valori precedenti e si rimuove la classe. Stesso pattern di `GlassModal.tsx`.
- **Lint:** Aggiunto `const { t } = useTranslation();` per l’uso di `t('pulseBreaker.disclaimerPeOnly')` (fix in-scope, nessun cambio di logica).

---

## 6. Come è stato centrato Pulse Breaker

- Overlay a **full viewport** con `position: fixed; inset: 0` e **min-height: 100vh / 100dvh**.
- **Padding con safe area** (`env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`) per non tagliare notch/home indicator e mantenere il pannello centrato nello spazio visibile.
- **Centratura** invariata: `display: flex; align-items: center; justify-content: center` sull’overlay.
- **Container** con `max-height` legata a viewport e safe area così la card resta interamente nello schermo e, se necessario, scrolla solo internamente.

---

## 7. Come è stato bloccato lo scroll

- **Body:** Quando `isOpen` è true, su `document.body` vengono impostati `overflow: hidden`, `touchAction: none` e classe `m1-modal-open`; in cleanup (chiusura modale) tutto viene ripristinato.
- **Overlay:** `overflow: hidden` su `.pb-overlay` così non c’è scroll a livello overlay.
- **Scroll consentito solo dentro la card:** `.pb-container` ha `overflow-y: auto` e `max-height` così, su viewport piccoli, scrolla solo il contenuto della card, non la pagina sotto.

---

## 8. File NON toccati

- `GlobalPulseBreakerModal.tsx` (portal su body)
- Store, routing, auth, IAP, BUZZ, BUZZ MAP, push
- PE system, M1U, reward economy
- Qualsiasi altro modale/overlay (es. PE modal)
- Supabase, migrations, RLS

---

## 9. Esito test di non regressione

- **Pulse Breaker:** Apertura/chiusura, centratura e scroll lock sono gestiti in codice; test manuali su dispositivo richiesti per conferma visiva (pannello centrato, nessuno scroll della pagina sotto, scroll solo interno alla card se necessario).
- **Sistemi intoccabili:** Nessuna modifica a login/logout, delete account, IAP, BUZZ, BUZZ MAP, push, PE modal, auth; nessun cambiamento atteso.

---

## 10. Esito build

- **Build:** OK  
- **Comando:** `npm run build`  
- **Esito:** `✓ built in 2m 11s` (exit code 0)

---

## 11. Esito cap sync ios

- **Comando:** `npx cap sync ios`
- **Esito:** OK  
- **Output:** Copy web assets, copy ios, pod install completati; sync finished in ~72s.

---

## 12. Comandi rollback esatti

Per tornare allo stato pre-fix:

```bash
git checkout safety/pulse-breaker-ios-layout-scroll-pre
```

Oppure solo i due file modificati:

```bash
git checkout -- src/features/pulse-breaker/components/PulseBreaker.css src/features/pulse-breaker/components/PulseBreaker.tsx
```

---

## 13. Verdetto finale

| Criterio | Esito |
|----------|--------|
| Layout corretto | **Sì** (overlay viewport + safe area + centering invariato) |
| Pannello centrato | **Sì** (flex center + padding safe-area) |
| Scroll bloccato | **Sì** (body lock + overflow overlay hidden; scroll solo interno al container) |
| Regressioni rilevate | **No** (perimetro limitato a Pulse Breaker overlay/container e scroll lock; fix lint `t` in-scope) |

---

**Nota:** La verifica definitiva su dispositivo iPhone (pannello centrato, nessuno scroll della pagina sotto, eventuale scroll solo interno alla card) va eseguita manualmente dopo il deploy su dispositivo.
