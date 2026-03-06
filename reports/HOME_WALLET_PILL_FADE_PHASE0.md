# Home Wallet Pill — Fade on scroll — FASE 0 (Read-Only)

**Data:** 2026-03-03  
**Scope:** Individuazione Wallet Pill in Home, container di scroll, punto di aggancio sicuro per fade-on-scroll (solo UI).

---

## 1) Dove viene renderizzato il Wallet Pill in Home

| Cosa | File | Riga | Descrizione |
|------|------|------|-------------|
| **Wallet Pill (M1UPill)** | `src/pages/AppHome.tsx` | 463–475 | Container `div` con `id="m1u-pill-home-slot"`, `className="fixed left-4 z-[1001] ..."`, contenente `<M1UPill showLabel showPlusButton />`. |
| **Componente pill** | `src/features/m1u/M1UPill.tsx` | – | Il “+” e il valore M1U sono nello stesso componente; in Home viene usato con `showLabel` e `showPlusButton`. |

**Found in:** `src/pages/AppHome.tsx` linee 463–475. Un solo wrapper `div` (fixed) che include l’intero pill (“+” + M1U).

---

## 2) Container di scroll

| Cosa | File | Identificazione |
|------|------|-----------------|
| **Scroll reale** | `src/components/layout/GlobalLayout.tsx` | `<main>` con `overflowY: 'auto'`, `className="... m1-single-scroll-root m1-scroll-under-header"` (linee 134–154). I figli (incluso AppHome) scrollano dentro questo `<main>`. |
| **Home** | `src/pages/AppHome.tsx` | Root `div.sn-page`, poi `<main className="relative">` e `<div className="container mx-auto px-4">` senza overflow: il contenuto scrollabile è quello dentro il `<main>` di GlobalLayout. |

Quindi il **scroll container** è il `<main>` in **GlobalLayout** (overflow-y: auto), non la finestra. Su Home l’utente scrolla quel `<main>`.

---

## 3) Safe hook point (solo stato UI)

- **Non toccare:** GlobalLayout, M1UPill (logica wallet, fetch, realtime).
- **Punto sicuro:** In **AppHome**:
  - Aggiungere **stato UI** (es. `pillVisible` o `pillOpacity`) e un **ref** a un elemento “sentinella” in cima al contenuto (es. il `div.m1-first-content-offset-compact` già presente alle linee 245–247).
  - Usare **IntersectionObserver** con `root: null` (viewport) sull’elemento sentinella: quando esce dalla viewport (scroll giù) → nascondi pill; quando rientra (scroll su) → mostra pill.
  - Applicare **solo allo wrapper** del pill in Home (il `div#m1u-pill-home-slot`): `opacity`, `transform`, `transition`, `pointerEvents` in base allo stato. Nessuna modifica a query/realtime/store/crediti o a impaginazione/struttura della Home.

---

## 4) Rischi

- **Rischi:** Nessuno sui flussi FROZEN (login, delete-account, IAP, BUZZ, BUZZ MAP, push). Nessuna modifica a logica wallet o a layout/impaginazione della Home.
- **Confinamento:** Comportamento di fade solo per il wrapper del pill in AppHome; M1UPill resta invariato e le altre pagine che usano M1UPill non sono toccate.

---

## 5) Piano patch minimale

1. **Branch/tag:** `feat/home-wallet-pill-fade`, `safety/home-wallet-pill-fade-pre`.
2. **Solo in `src/pages/AppHome.tsx`:**
   - Ref su un elemento in cima al contenuto (es. `div.m1-first-content-offset-compact`).
   - `IntersectionObserver` (root: null, threshold 0, opzionale `rootMargin` ~80px top per soglia) che aggiorna uno stato booleano (pill visibile / nascosta).
   - Sullo **stesso** `div#m1u-pill-home-slot`: stili inline (o classe) per `opacity`, `transform translateY`, `transition`, `pointer-events` in base allo stato.
3. Nessun nuovo file; nessuna modifica a GlobalLayout o M1UPill. Impaginazione Home invariata.

**Esito FASE 0:** OK per procedere con FASE 1 (patch solo UI in AppHome).
