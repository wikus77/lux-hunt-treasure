# INCIDENT REPORT — M1SSION™ /map (Agents, 3D Terrain, Center)

Data: 2025-10-21
Owner: AG-X0197
Ambiente: Lovable Preview, Supabase Realtime, MapLibre/Leaflet

## Sintomi iniziali
- Agents Online: nessun marker rosso visibile; console: `Channel error: TIMED_OUT`.
- 3D Terrain: toggle attiva ma nessun rilievo/hillshade visibile.
- Center: comportamento intermittente, a volte senza effetto.
- Console: warning contrasto, CORS/auth-bridge, token lovable fetch error (rumore), chiavi Stripe non live (rumore).

## Cause radice
1) Realtime Presence
   - Timeout durante subscribe → probabile Allowed Origins/WS non configurate per il dominio di preview e/o blocchi di rete WS.
   - Anche con `SUBSCRIBED`, gli agenti senza coords non vengono disegnati (by design); se geoloc. negata non appare il marker.

2) 3D Terrain
   - `VITE_TERRAIN_URL` non impostata o non valida (TileJSON DEM mancante), quindi nessun source `raster-dem` montato.
   - Toggle mostrava toast ma il layer DEM non partiva (nessuna richiesta a `tiles.json`).

3) Center Button
   - Race non deterministica tra GPS e IP, assenza di debounce e gestione `NO_COORDS` non sempre esplicita.

## Patch applicate (frontend, 100% custom, nessuna logica Buzz/Push/Stripe toccata)
- Presence (src/features/agents/agentsPresence.ts):
  - Subscribe con retry/backoff (1s,2s,4s), ricreazione canale, heartbeat 30s sempre (anche senza coords), debug `__M1_DEBUG.presence` e `lastAgentsPresence` filtrata <90s.
- Agents Layer (src/lib/layers/AgentsLayer.ts + src/styles/agents.css):
  - Marker rosso pulsante; più grande per "You"; tooltip con solo referral ("You — AG-XXXX" o "AG-XXXX").
  - Toggle layer "AGENTS" rispettato via pane dedicato.
- 3D Terrain (src/map/terrain/enableTerrain.ts + MapContainer):
  - Fail-safe se DEM assente con toast; `__M1_DEBUG.env.TERRAIN` e `terrain3D{available,active,terrainUrl}` aggiornati.
  - Quando ON: opacità tile 0.35 e tilt prospettico lieve; OFF: ripristino.
- Center robusto (src/pages/map/components/MapContainer.tsx):
  - Debounce, race GPS(1s) vs IP, messaggi chiari su `NO_COORDS`, telemetria `__M1_DEBUG.center`.

## Cosa resta da configurare (Supabase/ENV)
- Realtime WS Allowed Origins: aggiungere il dominio di preview e produzione; verificare handshake su `wss://vkjrqirvdvjbemsfzxof.supabase.co/realtime/v1` (anon) e assenza di `TIMED_OUT`.
- Quote/limiti Realtime: controllare throttling.
- DEM: impostare `VITE_TERRAIN_URL` a un TileJSON raster-dem valido (es. MapTiler `terrain-rgb-v2`).

## Comandi di debug rapidi
```js
window.__M1_DEBUG.presence
window.__M1_DEBUG.lastAgentsPresence
window.__M1_DEBUG.env
window.__M1_DEBUG.terrain3D
window.__M1_DEBUG.center
```

## Acceptance Check (atteso)
- Presence: `__M1_DEBUG.presence.status` → `SYNC(n≥1)`; marker "You — AG-X0197" visibile se coords presenti.
- 3D: `__M1_DEBUG.env.TERRAIN === true`, `terrain3D.active === true`, richieste a `tiles.json` riuscite; rilievi visibili.
- Center: 10 click → 10 flyTo; `__M1_DEBUG.center.source` `gps|ip|cached`.

## Note su sicurezza & Safety Clause
- Nessuna modifica a Buzz/Buzz Map, geolocalizzazione core, push, Norah AI 2.0/Panel, Stripe.
- Nessuna dipendenza Lovable introdotta. Solo file interni aggiornati/creati.

## File toccati
- src/map/terrain/enableTerrain.ts (diagnostica env)
- src/pages/map/components/MapContainer.tsx (diagnostica env/center)
- src/features/agents/agentsPresence.ts (già robusto, confermato)
- src/lib/layers/AgentsLayer.ts, src/styles/agents.css (stile marker rosso)

## Prossimi passi (TO_SUPABASE)
- Confermare SUBSCRIBED stabile del canale `m1_agents_presence_v1` con log; aggiungere origins; fornire tracce handshake.

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™