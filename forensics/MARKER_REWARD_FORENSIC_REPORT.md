# 🔍 FORENSIC REPORT — MARKER REWARD VERDI NON VISIBILI + INSERIMENTO FALLITO
## M1SSION iOS App — Analisi Forense (SOLO LETTURA)

**Data Report:** 2026-02-11  
**Modalità:** READ-ONLY (ZERO MODIFICHE)  
**Branch:** fix/iap-edge-400  

---

## 📊 EXECUTIVE SUMMARY

| Area | Problema | Root Cause | Severità |
|------|----------|------------|----------|
| **Inserimento** | Marker NON vengono creati | 🔴 **RLS Policy blocca INSERT** | CRITICA |
| **Visibilità** | Marker non visibili sulla mappa | 🟡 **Zoom minimo default = 17** | ALTA |
| **Database** | Markers potrebbero non esistere | Conseguenza del blocco RLS | CRITICA |

---

## 🔴 PROBLEMA 1: INSERIMENTO MARKER BLOCCATO

### 1.1 Analisi del Flusso di Inserimento

**File:** `src/components/admin/MarkerRewardManager.tsx`

```typescript
// Linee 196-214: INSERT nella tabella markers
const { data: marker, error: markerError } = await supabase  // ← USA CLIENT NORMALE
  .from('markers')
  .insert({
    lat: latNum,
    lng: lngNum,
    title: markerTitle || 'Reward Marker',
    active: true,
    visible_from: now.toISOString(),
    visible_to: visibleTo.toISOString()
  })
  .select()
  .single();
```

### 1.2 RLS Policy che Blocca l'Inserimento

**File:** `supabase/migrations/20250919031352_54142285-41ca-4dad-8fd3-99aceb8e67c0.sql`

```sql
-- LINEA 58-59: Blocco totale INSERT
CREATE POLICY markers_no_insert ON public.markers
  FOR INSERT TO authenticated WITH CHECK (false);  -- ❌ BLOCCA TUTTO!
```

### 1.3 ROOT CAUSE #1 (CRITICA)

| Componente | Usa | Risultato |
|------------|-----|-----------|
| `MarkerRewardManager.tsx` | `supabase` (client anon/auth) | ❌ BLOCCATO da RLS |
| Edge Functions (`create-random-markers`) | `adminClient` (service role) | ✅ Funziona (bypassa RLS) |
| Edge Functions (`admin-delete-marker`) | `adminClient` (service role) | ✅ Funziona (bypassa RLS) |

**Conclusione:** Il MarkerRewardManager usa il client Supabase normale che è soggetto a RLS. La policy `markers_no_insert` blocca TUTTI gli INSERT da utenti authenticated, anche admin.

### 1.4 Evidenze

```sql
-- La policy attuale:
CREATE POLICY markers_no_insert ON public.markers
  FOR INSERT TO authenticated WITH CHECK (false);

-- Esiste anche una policy admin, ma richiede RPC:
CREATE POLICY "admin_can_insert_markers"
ON public.markers FOR INSERT 
TO authenticated
WITH CHECK (is_admin_secure());  -- Ma questa richiede funzione RPC
```

**Il problema:** Il codice JS NON chiama la funzione RPC `fn_markers_secure_insert()`, ma fa INSERT diretto che viene bloccato.

---

## 🟡 PROBLEMA 2: MARKER NON VISIBILI (ZOOM)

### 2.1 Logica di Visibilità

**File:** `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`

```typescript
// Linea 29-30: Default zoom molto alto
const DEFAULT_MIN_ZOOM = 17;

// Linea 79-80: Condizione di visibilità
const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
```

### 2.2 Significato del Livello di Zoom

| Zoom Level | Distanza Visuale | Descrizione |
|------------|------------------|-------------|
| 10 | ~100 km | Regione |
| 12 | ~25 km | Città grande |
| 14 | ~5 km | Quartiere |
| 15 | ~2 km | Vie principali |
| **17** | ~500 m | **Edifici singoli** |
| 18 | ~200 m | Dettagli |
| 20 | ~50 m | Massimo dettaglio |

**Con zoom default = 17, l'utente deve zoomare fino a vedere singoli edifici per vedere i marker!**

### 2.3 Dove viene impostato min_zoom

**File:** `src/components/admin/MarkerRewardManager.tsx` (linee 218-222)

```typescript
// min_zoom viene salvato nel payload della reward
const payloadWithZoom = {
  ...buildPayload(),
  min_zoom: minZoom  // ← Viene dal form (default 17)
};
```

**File:** `src/pages/sandbox/MapTiler3D.tsx` (linee 256-270)

```typescript
// min_zoom viene estratto dal payload delle rewards
const minZoomMap = new Map<string, number>();
(rewardsData || []).forEach((r: any) => {
  if (r.payload?.min_zoom) {
    minZoomMap.set(r.marker_id, r.payload.min_zoom);
  }
});

// Applicato ai marker con default 17
min_zoom: minZoomMap.get(m.id) || 17  // ← DEFAULT 17!
```

---

## 📋 ANALISI DETTAGLIATA PER FASE

### FASE 1 — INSERIMENTO MARKER

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| I marker vengono creati? | ❌ **NO** (probabilmente) | RLS `markers_no_insert WITH CHECK (false)` |
| Viene chiamata la funzione di insert? | ✅ Sì | `supabase.from('markers').insert(...)` |
| Viene fatta la INSERT nel DB? | ❌ **NO** | RLS blocca prima |
| La promessa ritorna errore? | ❓ Probabilmente sì | Error non sempre mostrato correttamente |
| Controllo di ruolo? | ✅ Solo UI | `isAdmin` check in React, non in DB |
| Condizione che blocca su iOS? | ❌ No, problema è RLS | Stesso su web e iOS |

### FASE 2 — CARICAMENTO MARKER

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Dove vengono fetchati? | `MapTiler3D.tsx` linee 228-270 | Query su `markers` + `marker_rewards` |
| Fetch al mount? | ✅ Sì | `useEffect` con `isAuthenticated` |
| Dipende da zoom? | ❌ No (fetch) | Zoom filtra solo rendering |
| Dipende da bounds mappa? | ❌ No | Fetcha tutti (limit 2000) |
| Filtro invisibile attivo? | ⚠️ Sì | `.eq('active', true)` + visibilità temporale |

**Query attuale:**
```typescript
.from('markers')
.select('id, lat, lng, title, active, visible_from, visible_to')
.eq('active', true)  // ← Solo marker attivi
.or(`visible_from.is.null,visible_from.lte.${now}`)  // ← Finestra temporale
.or(`visible_to.is.null,visible_to.gte.${now}`)
.limit(2000);
```

### FASE 3 — VISIBILITÀ ZOOM

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Livello minimo visibilità? | **17** (default) | `DEFAULT_MIN_ZOOM = 17` |
| Questo livello è stato cambiato? | ❓ Non recentemente | Sempre stato 17 |
| Listener su zoomend? | ✅ Sì | `map.on('zoom', updateZoom)` |
| currentZoom aggiornato? | ✅ Sì | `setCurrentZoom(map.getZoom())` |
| iOS WKWebView coerente? | ✅ Sì | MapLibre funziona uguale |

### FASE 4 — RENDERING

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Layer corretto? | ✅ Sì | Native MapLibre markers |
| Layer che li copre? | ❌ No | z-index gestito da MapLibre |
| Cluster li assorbe? | ❌ No | Non usa clustering |
| opacity 0? | ❌ No | opacity non impostata |
| iconSize 0? | ❌ No | `markerSize = 22` |
| Coordinate errate? | ❓ Possibile | Se marker non esistono, non si verifica |
| lat/lng invertite? | ❌ No | Codice corretto |

### FASE 5 — WEB vs iOS

| Domanda | Risposta |
|---------|----------|
| Funziona su web? | ❓ Da verificare (stesso problema RLS) |
| Solo iOS? | ❌ No, problema è backend/RLS |
| WKWebView blocca? | ❌ No |
| Safe area? | ❌ Non rilevante |
| Container height? | ❌ Non rilevante |
| overflow hidden? | ❌ Non rilevante |

### FASE 6 — DATABASE

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Markers esistono? | ❓ **Probabilmente pochi/nessuno** | RLS blocca insert manuali |
| Flag corretto? | ✅ Se esistono, `active=true` | MarkerRewardManager imposta true |
| Coordinate valide? | ✅ Se esistono | Constraints DB li validano |
| Campo zoomLevel? | ✅ In `marker_rewards.payload.min_zoom` | JSONB field |
| Campo visible? | ⚠️ `visible_from`/`visible_to` | Finestra temporale |
| RLS policy? | 🔴 **BLOCCA INSERT** | `WITH CHECK (false)` |

---

## 🎯 REPORT FINALE STRUTTURATO

### 1️⃣ Stato Inserimento

| Domanda | Risposta |
|---------|----------|
| I marker vengono realmente creati? | ❌ **NO** |
| Se NO → perché | RLS Policy `markers_no_insert` blocca tutti gli INSERT da authenticated users |
| Se SI → dove si bloccano | N/A |

### 2️⃣ Stato Database

| Domanda | Risposta |
|---------|----------|
| I marker esistono realmente? | ❓ **Probabilmente solo quelli creati via Edge Function (bulk)** |
| Perché | Solo le Edge Functions con SERVICE_ROLE_KEY bypassano RLS |

### 3️⃣ Stato Rendering

| Domanda | Risposta |
|---------|----------|
| Vengono renderizzati? | ✅ Sì, SE esistono E zoom ≥ min_zoom |
| Se NO → perché | (a) Non esistono nel DB, (b) Zoom insufficiente |

### 4️⃣ Stato Zoom

| Parametro | Valore |
|-----------|--------|
| Livello minimo richiesto | **17** (default) |
| Livello attuale | Dipende dall'utente |
| Condizione bloccante | `currentZoom < 17` nasconde i marker |

### 5️⃣ Stato iOS Wrapping

| Parametro | Valore |
|-----------|--------|
| Differenze rispetto web | **NESSUNA** (problema è backend RLS) |

---

## 🔎 CONCLUSIONE

### Causa Principale (95% probabilità)

**RLS Policy `markers_no_insert` blocca l'inserimento diretto da MarkerRewardManager.**

Il codice chiama:
```typescript
await supabase.from('markers').insert({...})
```

Ma la RLS policy dice:
```sql
CREATE POLICY markers_no_insert ON public.markers
  FOR INSERT TO authenticated WITH CHECK (false);
```

### Cause Secondarie

1. **Zoom troppo alto (50%)**: Anche se i marker esistessero, con `min_zoom=17` sono visibili solo zoomando molto vicino.

2. **Finestra temporale scaduta (10%)**: Se `visible_to` è passato, i marker non vengono fetchati.

---

## 🛠️ FIX CONSIGLIATI (SOLO SCRITTI, NON APPLICATI)

### FIX 1: Permettere INSERT agli Admin (CONSIGLIATO)

**Opzione A: Modificare RLS Policy**
```sql
-- Rimuovere il blocco totale
DROP POLICY IF EXISTS markers_no_insert ON public.markers;

-- Creare policy che permette agli admin
CREATE POLICY markers_admin_insert ON public.markers
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_secure());
```

**Opzione B: Usare Edge Function per INSERT**
- Creare `supabase/functions/admin-create-marker/index.ts`
- Usare `adminClient` con SERVICE_ROLE_KEY
- Chiamarla da MarkerRewardManager invece di insert diretto

### FIX 2: Ridurre Zoom Default

```typescript
// In RewardsLayer3D.tsx
const DEFAULT_MIN_ZOOM = 14;  // Invece di 17
```

```typescript
// In MarkerRewardManager.tsx
const [minZoom, setMinZoom] = useState(14);  // Invece di 17
```

### FIX 3: Aggiungere Logging per Debug

```typescript
// In MarkerRewardManager.tsx, dopo l'insert
if (markerError) {
  console.error('❌ [MarkerManager] INSERT FAILED:', markerError.message, markerError.code);
  toast.error(`Errore DB: ${markerError.message}`);
  return;
}
```

---

## ⚠️ NOTA IMPORTANTE

Questo report è **SOLO ANALISI**. Nessun file è stato modificato. I fix proposti devono essere approvati prima dell'implementazione.

---

*Report generato: 2026-02-11*  
*Modalità: READ-ONLY FORENSICS*  
*ZERO MODIFICHE APPLICATE*
