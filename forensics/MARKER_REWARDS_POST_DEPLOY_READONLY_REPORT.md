# 🔍 MARKER REWARDS POST-DEPLOY FORENSIC REPORT (READ-ONLY)

**Data**: 2026-02-12  
**Modalità**: READ-ONLY (zero modifiche)  
**Ambiente**: iOS wrapped (WKWebView)  
**Build**: SUCCEEDED  

---

## 📊 EXECUTIVE SUMMARY

| Problema | Root Cause Identificata | Severità | Evidenza |
|----------|------------------------|----------|----------|
| Marker invisibili | **MapTiler3D.tsx usa `\|\| 17` invece di `?? 14`** | 🔴 CRITICA | Codice linea 269 |
| Claim fallisce | **Type mismatch UUID/TEXT in marker_rewards** | 🔴 CRITICA | Da verificare via SQL |
| Rewards non caricati | Query `.eq('marker_id', markerId)` su colonna errata | 🟡 PROBABILE | Da verificare via SQL |

---

## 🚨 ROOT CAUSE PRINCIPALE: MISMATCH DEFAULT ZOOM

### Evidenza nel codice:

**File `src/pages/sandbox/MapTiler3D.tsx` - Linea 269:**
```typescript
min_zoom: minZoomMap.get(m.id) || 17 // Zoom minimo per visibilità (default 17)
```

**File `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx` - Linea 31:**
```typescript
const DEFAULT_MIN_ZOOM = 14; // ← QUESTO È STATO FIXATO
```

### 🔴 PROBLEMA:

Il fix applicato a `RewardsLayer3D.tsx` (DEFAULT_MIN_ZOOM = 14) è **INUTILE** perché:

1. `MapTiler3D.tsx` carica i marker e assegna `min_zoom: 17` come fallback (linea 269)
2. I marker arrivano a `RewardsLayer3D` **già con min_zoom = 17**
3. Il DEFAULT_MIN_ZOOM = 14 non viene MAI usato perché `rewardMarker.min_zoom` è sempre 17

### 📈 Conseguenza:

I marker sono visibili **SOLO a zoom >= 17** (circa 500 metri di vista), rendendo impossibile vederli a zoom normali (14-16).

---

## 🔍 SEZIONE A: QUERY SQL DA ESEGUIRE (SOLO SELECT)

Esegui queste query in **Supabase SQL Editor** e incolla i risultati:

### A1 — Schema reale colonne

```sql
SELECT table_name, column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('markers','marker_rewards','marker_claims')
  AND column_name IN ('id','marker_id','user_id');
```

**OUTPUT ATTESO:**
| table_name | column_name | data_type | udt_name |
|------------|-------------|-----------|----------|
| markers | id | uuid | uuid |
| marker_rewards | id | uuid | uuid |
| marker_rewards | marker_id | ??? | ??? |
| marker_claims | id | uuid | uuid |
| marker_claims | marker_id | uuid | uuid |
| marker_claims | user_id | uuid | uuid |

⚠️ **CHIAVE**: Se `marker_rewards.marker_id` è `text` invece di `uuid`, questo è il problema!

---

### A2 — Esistenza dati

```sql
-- Markers
SELECT COUNT(*) AS markers_total,
       COUNT(*) FILTER (WHERE active=true) AS markers_active
FROM public.markers;

-- Rewards
SELECT COUNT(*) AS rewards_total
FROM public.marker_rewards;

-- Claims
SELECT COUNT(*) AS claims_total
FROM public.marker_claims;
```

---

### A3 — Marker visibili adesso

```sql
SELECT COUNT(*) AS visible_now
FROM public.markers
WHERE active=true
  AND (visible_from IS NULL OR visible_from <= now())
  AND (visible_to IS NULL OR visible_to >= now());
```

---

### A4 — min_zoom nei payload dei rewards

```sql
SELECT 
  COUNT(*) AS total_rewards,
  COUNT(*) FILTER (WHERE payload->>'min_zoom' IS NOT NULL) AS has_min_zoom,
  COUNT(*) FILTER (WHERE payload->>'min_zoom' IS NULL) AS no_min_zoom
FROM public.marker_rewards;
```

---

### A5 — Verifica tipo marker_id (con cast corretto)

```sql
SELECT 
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE (marker_id::text) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') AS uuid_like,
  COUNT(*) FILTER (WHERE NOT ((marker_id::text) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')) AS bad
FROM public.marker_rewards;
```

---

### A6 — Spot check dati reali

```sql
-- Ultimi 10 markers
SELECT id, lat, lng, title, active, visible_from, visible_to
FROM public.markers
ORDER BY created_at DESC NULLS LAST
LIMIT 10;

-- Ultimi 10 rewards
SELECT id, marker_id, reward_type, payload->>'min_zoom' as min_zoom, created_at
FROM public.marker_rewards
ORDER BY created_at DESC
LIMIT 10;

-- Ultimi 10 claims
SELECT id, marker_id, user_id, claimed_at
FROM public.marker_claims
ORDER BY claimed_at DESC
LIMIT 10;
```

---

### A7 — Rewards orfani (marker_id che non esiste in markers)

```sql
SELECT COUNT(*) AS orphan_rewards
FROM public.marker_rewards mr
WHERE NOT EXISTS (
  SELECT 1 FROM public.markers m 
  WHERE m.id::text = mr.marker_id::text
);
```

---

## 🔍 SEZIONE B: VERIFICA EDGE FUNCTION LOGS

### Dove guardare:
1. Supabase Dashboard → Functions → `claim-marker-reward` → Logs
2. Filtra: ultimi 15 minuti

### Errori da cercare:
- `invalid input syntax for type uuid`
- `column "marker_id" is of type uuid but expression is of type text`
- `NO_REWARD`
- `INVALID_MARKER_ID`
- `CLAIM_INSERT_FAILED`

### Log attesi dal nuovo codice:
```
M1QR-TRACE: claim-marker-reward start - user:...XXXXXXXX marker:XXXXXXXX
M1QR-TRACE: [STEP 1/5] Checking existing claims...
M1QR-TRACE: [STEP 2/5] Fetching rewards for marker...
M1QR-TRACE: RAW REWARDS from DB: [...]
```

Se vedi `RAW REWARDS from DB: []` → **NO_REWARD** = i rewards non sono trovati = mismatch tipo o marker_id errato.

---

## 🔍 SEZIONE C: VERIFICA CLIENT iOS

### Safari Web Inspector:

1. **Network Tab** - Cerca:
   - `POST /functions/v1/claim-marker-reward`
   - Response body (anche se errore)

2. **Console Tab** - Cerca:
   ```
   M1QR-TRACE
   🎁 [useMarkerRewards]
   [Map3D] markers load
   ```

### Cosa verificare:

| Check | Dove | Cosa cercare |
|-------|------|--------------|
| markerId inviato | Network → Request Body | `{"markerId": "uuid-qui"}` |
| Response | Network → Response | `{"ok": false, "code": "NO_REWARD"}` o simile |
| Rewards caricati | Console | `🎁 [useMarkerRewards] Rewards fetched: X` |
| Markers caricati | Console | `[Map3D] markers load` |

---

## 🔍 SEZIONE D: ANALISI RENDERING UI

### Problema identificato nel codice:

**`useMarkerRewards.ts` - Linea 33:**
```typescript
.eq('marker_id', markerId)
```

Il `markerId` viene passato dal click sul marker. Se:
- `markers.id` è UUID
- `marker_rewards.marker_id` è TEXT

La query fallisce silenziosamente o non trova risultati.

### Flusso dati:

```
1. MapTiler3D carica markers da DB
   ↓
2. Click su marker → markerId (UUID da markers.id)
   ↓
3. useMarkerRewards query marker_rewards con eq('marker_id', markerId)
   ↓
4. Se marker_rewards.marker_id è TEXT → MISMATCH → rewards = []
   ↓
5. Modal mostra "Caricamento premi in corso..." (nessun reward)
   ↓
6. Claim fallisce con "Errore nel riscatto del premio"
```

---

## 📋 ROOT CAUSE RANKING

| # | Causa | Probabilità | Impatto | Fix |
|---|-------|-------------|---------|-----|
| 1 | **MapTiler3D usa `\|\| 17` per min_zoom** | 100% | 🔴 Marker invisibili | Cambiare a `?? 14` |
| 2 | **marker_rewards.marker_id è TEXT non UUID** | 90% | 🔴 Query falliscono | ALTER COLUMN o fix query |
| 3 | **Rewards non trovati = NO_REWARD** | 85% | 🔴 Claim fallisce | Conseguenza di #2 |
| 4 | **Edge Function non ancora deployata** | 20% | 🟡 | Verificare deploy status |

---

## 🔧 FIX MINIMI CONSIGLIATI (NON APPLICATI)

### FIX 1 — MapTiler3D.tsx linea 269

**Da:**
```typescript
min_zoom: minZoomMap.get(m.id) || 17
```

**A:**
```typescript
min_zoom: minZoomMap.get(m.id) ?? 14
```

### FIX 2 — Verificare tipo marker_id

Se A1 conferma che `marker_rewards.marker_id` è TEXT:

**Opzione A** (se tutti i valori sono UUID validi):
```sql
ALTER TABLE public.marker_rewards
ALTER COLUMN marker_id TYPE UUID USING marker_id::uuid;
```

**Opzione B** (se ci sono valori non-UUID):
Modificare le query per usare cast: `.eq('marker_id', markerId.toString())`

---

## ✅ CHECKLIST VERIFICA

- [ ] Eseguire query A1-A7 e incollare risultati
- [ ] Controllare Edge Function logs in Supabase
- [ ] Verificare Network in Safari Web Inspector
- [ ] Confermare tipo `marker_rewards.marker_id` (UUID o TEXT?)
- [ ] Confermare se rewards esistono per i marker attivi

---

## 🔁 NOTA ROLLBACK

Non sono state applicate modifiche. Il codice è identico a prima dell'analisi.

Tag rollback disponibile: `ROLLBACK_MARKER_SYSTEM_PRE_FIX`

---

## ⏳ AZIONI RICHIESTE

1. **URGENTE**: Eseguire le query SQL della Sezione A
2. **URGENTE**: Controllare Edge Function logs
3. **DOPO VERIFICA**: Decidere se applicare FIX 1 (zoom) e FIX 2 (tipo)

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
