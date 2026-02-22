# Phase 1 — Forensic: toast "Geolocalizzazione non disponibile"

**Date:** 2026-02-21

## A) Toast source

| Campo | Valore |
|-------|--------|
| **Toast source file:line** | `src/pages/sandbox/MapTiler3D.tsx:1269` |
| **Condizione che lo scatena** | `handleFindMyLocation()`: quando **non** c’è `position` **e** `geoStatus !== 'idle'` → ramo `else` → `toast.info('Geolocalizzazione non disponibile')`. |
| **i18n** | No; stringa hardcoded. |

Flusso: l’utente apre la mappa, concede il permesso; `useGeolocation()` va in `status = 'prompt'` e avvia `watchPositionSafe`. La prima position può arrivare dopo alcuni secondi (GPS). Se l’utente tocca “centra su di me” **prima** che arrivi la prima position: `position` è ancora `undefined` e `geoStatus` è `'prompt'` → si entra nell’`else` → toast “Geolocalizzazione non disponibile” (falso negativo).

## B) Stack usato su iOS

- **geolocationSafe.ts:** su iOS native (`isCapacitorNative() && isCapacitorIOS()`) si usa `@capacitor/geolocation` (getCurrentPosition / watchPosition).
- **useGeolocation:** usa `watchPositionSafe` / `clearWatchSafe`; su iOS native non usa Permissions API.
- **MapTiler3D** usa **useGeolocation()** (non useGeoWatcher). Un solo watcher da questo hook.

## C) Watcher

- **useGeolocation:** usato in MapTiler3D, SettingsPage, ChatView, GeoToggle.
- **useGeoWatcher:** usato in GeoDebugOverlay, M1ssionSystemReport (QRMapDisplay ha useGeoWatcher commentato).
- Sulla **mappa (MapTiler3D)** viene usato solo **useGeolocation** → un solo watcher per la mappa. Nessun doppio watcher sulla stessa pagina.

## D) Root cause

- Il toast non dipende da un errore reale del watcher.
- Dipende dalla **logica di handleFindMyLocation**: si considera “non disponibile” ogni caso in cui non c’è ancora `position` e lo status non è `'idle'`, **incluso** lo stato `'prompt'` (permesso concesso, in attesa della prima fix) e `'granted'` (prima position non ancora in state).
- Quindi: **permesso concesso** → status `'prompt'` → utente tocca “centra” → toast errato.

## Output atteso Phase 1 (tabella)

| Voce | Valore |
|------|--------|
| Toast source file:line | MapTiler3D.tsx:1269 |
| Stack usato iOS | Capacitor (geolocationSafe → @capacitor/geolocation) |
| Numero watcher avviati (mappa) | 1 (useGeolocation) |
| First error code/message | N/A (toast non da errore watcher) |
| First success coords | Arriva dopo qualche secondo; prima il toast può essere già mostrato |

## Conclusione

Fix da applicare: in **MapTiler3D** `handleFindMyLocation` mostrare “Geolocalizzazione non disponibile” **solo** quando `geoStatus` è `'blocked'` | `'denied'` | `'error'`. Per `'prompt'` o `'granted'` senza position (attesa prima fix) **non** mostrare quel toast.

---

## Phase 2 — Fix applicata

- **MapTiler3D.tsx** `handleFindMyLocation`: aggiunto ramo `else if (geoStatus === 'prompt' || geoStatus === 'granted')` → nessun toast (evita falso negativo subito dopo Allow).
- **geolocationSafe.ts**: log diagnostici `[GEO_SAFE]` (useCapacitorGeo, watchPositionSafe Capacitor success/error) per verifica su device.

## Phase 3 — Test manuale iOS

1. Reset location: Impostazioni → Privacy → Localizzazione → M1SSION → "Never"; apri app e concedi.
2. Apri MAPPA: nessun toast "Geolocalizzazione non disponibile" dopo Allow; location si aggancia entro pochi secondi.
3. Kill app + reopen: nessuna regressione.
4. Verificare che NON ricompaia prompt "localhost".
