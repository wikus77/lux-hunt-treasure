# MAP FIX — PROMPT 1 (Frontend)
**Data:** 2025-10-21  
**Obiettivo:** Marker rossi reali, Center affidabile, Toast dedup, 3D Terrain ENV

---

## 🎯 Modifiche applicate

### 1. Agents — Track immediato su coords pronte

**File:** `src/features/agents/agentsPresence.ts`
- ✅ Esportata funzione `trackNow(agentCode, coords)` che invia `channel.track()` solo se `SUBSCRIBED`
- ✅ Controlla stato interno del canale prima di inviare
- ✅ Aggiorna `__M1_DEBUG.presence.last` dopo track riuscito

**File:** `src/pages/map/components/MapContainer.tsx`
- ✅ Aggiunto `useEffect` che chiama `trackNow()` quando `geoPosition` o `ipGeo.coords` diventano disponibili
- ✅ Debounce di 3 secondi per evitare spam
- ✅ Non modifica rendering: `AgentsLayer` già gestisce dot rosso pulsante e tooltip "You — AG-XXXX"

**Acceptance:**
- `__M1_DEBUG.presence.status` → `SYNC(n≥1)` dopo inizializzazione
- Marker "You — AG-X0197" visibile vicino alle coordinate dell'utente
- Toggle "AGENTS" mostra/nasconde layer

---

### 2. Center affidabile — Handler robusto unificato

**File:** `src/pages/map/components/MapContainer.tsx`
- ✅ Tutti i pulsanti "Centra su posizione" usano lo stesso handler (`handleFocusLocation`)
- ✅ Race GPS vs IP con timeout 1800ms (individuale, non `Promise.all`)
- ✅ Fast-path per coords già in cache
- ✅ Aggiorna `__M1_DEBUG.center.source` con: `gps_cached`, `ip_cached`, `gps`, `ip`, `none`

**Acceptance:**
- 10 click consecutivi → 10 centrature
- `__M1_DEBUG.center.source` indica correttamente la fonte (GPS o IP)

---

### 3. Toast/Banner — Deduplicazione

**File nuovo:** `src/utils/toastDedup.ts`
- ✅ Funzione `shouldShowToast(key)` con finestra 2s
- ✅ Previene duplicati dello stesso toast entro 2 secondi
- ✅ Cleanup automatico di entry vecchie

**File modificati:**
- `src/pages/map/components/MapContainer.tsx`: applicato a toast "Centrato su posizione"
- `src/pages/map/MapStateProvider.tsx`: applicato a toast "Posizione GPS rilevata"

**Acceptance:**
- Nessun toast duplicato per geolocalizzazione entro 2s
- Un solo banner "Posizione GPS rilevata con precisione" al rilevamento

---

### 4. 3D Terrain — ENV fail-safe chiaro

**File:** `src/map/terrain/enableTerrain.ts`
- ✅ Toggle 3D attivo **solo se** `import.meta.env.VITE_TERRAIN_URL` è valorizzata
- ✅ Se mancante: toast "DEM mancante: configura VITE_TERRAIN_URL (TileJSON)"
- ✅ Aggiorna `__M1_DEBUG.terrain3D = { available, active, terrainUrl, error }`

**File:** `src/pages/map/components/MapContainer.tsx`
- ✅ Variabile `terrain3DAvailable` basata su presenza ENV
- ✅ Handler `enable3D()` / `disable3D()` rispettano fail-safe

**Acceptance:**
- Con ENV configurata: `__M1_DEBUG.env.TERRAIN === true` e toggle ON → `terrain3D.active === true`
- Senza ENV: toggle disabilitato, toast informativo

---

## 🔍 QA Rapido (Console)

```javascript
// Verifiche da console
window.__M1_DEBUG.presence.status        // → 'SYNC(n≥1)' se tutto ok
window.__M1_DEBUG.lastAgentsPresence     // → array con almeno 1 agent (te stesso)
window.__M1_DEBUG.env.TERRAIN            // → true se VITE_TERRAIN_URL configurata
window.__M1_DEBUG.terrain3D.active       // → true se toggle 3D è ON
window.__M1_DEBUG.center.source          // → 'gps', 'ip', 'cached', o 'none' dopo click
```

**Acceptance:**
1. **Agents:** 
   - Marker rosso "You — AG-X0197" visibile sulla mappa
   - `lastAgentsPresence.length ≥ 1`
   
2. **Center:**
   - 10 click → 10 centrature consecutive
   - Nessun toast duplicato
   
3. **3D Terrain:**
   - Con ENV: richiesta a `tiles.json` in Network, rilievi visibili
   - Senza ENV: toggle disabilitato, messaggio chiaro

---

## 🚫 Safety Clause (Rispettata)

- ❌ **NON modificato:** Buzz/Buzz Map, geolocalizzazione core, push, Norah 2.0/Panel, Stripe
- ❌ **NON modificato:** Markers esistenti e loro logica/cluster
- ✅ **Nessuna dipendenza Lovable introdotta**
- ✅ **Footer legale** presente in tutti i nuovi file

---

## 📋 Prossimi passi (PROMPT 2 e 3)

### PROMPT 2 — Supabase Dashboard
**Da eseguire manualmente:**
1. Dashboard Supabase → Settings → API → Realtime
2. Allowed Origins (WebSocket) → aggiungi:
   - `https://*.lovableproject.com`
   - `https://<dominio-produzione>` (se applicabile)
   - `http://localhost:5173`
3. Salva e verifica log Realtime per eventi `SUBSCRIBED` e `SYNC`

### PROMPT 3 — ENV 3D Terrain
**Da configurare in Lovable:**
1. Settings → Environment Variables
2. Aggiungi:
   ```
   VITE_TERRAIN_URL=https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=VRJaVKMtkFdyVzhXCjBF
   VITE_CONTOUR_URL=https://api.maptiler.com/tiles/contours/{z}/{x}/{y}.pbf?key=VRJaVKMtkFdyVzhXCjBF
   ```
3. Rebuild preview
4. Verifica richiesta a `tiles.json` in Network tab

---

## ✅ Checklist finale

- [x] `trackNow()` esportato e funzionante
- [x] useEffect immediate track su coords ready
- [x] Handler Center unificato con race GPS/IP
- [x] Toast dedup applicato a geolocalizzazione
- [x] 3D Terrain fail-safe con ENV check
- [x] `__M1_DEBUG` completo per diagnostica
- [x] Safety Clause rispettata al 100%
- [x] Footer legale su nuovi file

**Status:** ✅ **PROMPT 1 completato** — Pronto per PROMPT 2 (Supabase) e PROMPT 3 (ENV)

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
