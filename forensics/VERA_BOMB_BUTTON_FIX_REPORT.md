# VERA BOMB BUTTON — Fix Report

## Rollback

```bash
git checkout SNAPSHOT_PRE_FIX_VERA_BOMB_BUTTON_20260215-081151
```

---

## Root Cause

**Cause #1 (probabile): z-index**
- Il pulsante aveva `zIndex: 65`, la bottom navigation ha `z-index: 100` (index.css).
- Il pulsante veniva renderizzato ma restava sotto la bottom nav.

**Cause #2 (possibile): flag letto al load**
- `VERA_MISSION_BOMB_ENABLED` era una costante valutata al primo caricamento del modulo.
- Su iOS WKWebView, se il modulo viene importato prima che localStorage sia pronto, il valore poteva essere sbagliato.

**Cause #3 (esclusa): CommandCenterHome non usato**
- CommandCenterHome è effettivamente montato in AppHome (route Home post-login).

---

## Fix applicato

### 1) featureFlags.ts
- Sostituita la costante con la funzione `isVeraBombEnabled()` che legge env + localStorage a ogni chiamata.
- Priorità: env build-time → localStorage runtime.
- Chiave localStorage: `m1_vera_mission_bomb_enabled`.
- Env var: `VITE_VERA_MISSION_BOMB_ENABLED`.

### 2) CommandCenterHome.tsx
- Usa `isVeraBombEnabled()` al render invece della costante.
- Pulsante: `zIndex: 101` (sopra bottom nav, 100).
- `bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px))`.
- `left: max(1rem, env(safe-area-inset-left, 1rem))`.

---

## Come attivare il flag su iOS

**Opzione 1 — localStorage (consigliata)**
1. iPhone connesso al Mac.
2. Safari (Mac) → Sviluppo → [iPhone] → WebView M1SSION.
3. In Console:
   ```javascript
   localStorage.setItem('m1_vera_mission_bomb_enabled', 'true');
   location.reload();
   ```
4. L’app si ricarica e il pulsante “VERA BOMB” compare in basso a sinistra su Home.

**Opzione 2 — env (build time)**
```bash
VITE_VERA_MISSION_BOMB_ENABLED=true pnpm run build
npx cap sync ios
```

---

## File modificati

- `src/config/featureFlags.ts` — funzione `isVeraBombEnabled()` al posto della costante.
- `src/components/command-center/CommandCenterHome.tsx` — uso di `isVeraBombEnabled()`, z-index 101, safe-area per il pulsante.

---

## Checklist test

- [ ] Flag OFF → nessun pulsante
- [ ] Flag ON (localStorage + reload) → pulsante visibile sopra la bottom nav
- [ ] Flag ON (env build) → pulsante visibile
- [ ] Home, Map, Buzz, Streak, Commit invariati
- [ ] Tap sul pulsante apre la modal Bomba
