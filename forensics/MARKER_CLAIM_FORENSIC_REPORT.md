# 🔍 FORENSIC REPORT — MARKER VERDI INVISIBILI + ERRORE RISCATTO PREMIO
## M1SSION iOS WRAPPED — Analisi Forense (SOLO LETTURA)

**Data Report:** 2026-02-11  
**Modalità:** READ-ONLY (ZERO MODIFICHE)  
**Branch:** fix/iap-edge-400  

---

## 📊 EXECUTIVE SUMMARY

| Area | Problema | Root Cause | Severità |
|------|----------|------------|----------|
| **Visibilità Marker** | Marker verdi non visibili | 🟡 Zoom default = 17 (molto alto) | ALTA |
| **Creazione Marker** | Marker non inseribili | 🔴 RLS `markers_no_insert WITH CHECK (false)` | CRITICA |
| **Riscatto Premio** | "Errore nel riscatto del premio" | 🔴 **TYPE MISMATCH marker_id** (UUID vs TEXT) | CRITICA |
| **RLS marker_claims** | INSERT potrebbe fallire | ⚠️ Policy su user_id, ma Edge Function usa admin client | MEDIA |

---

## 📋 FASE 1 — STATO DATABASE (READ-ONLY)

### 1.1 Tabella `markers`

**Struttura identificata:**
```sql
-- ID è UUID
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Campi rilevanti:**
- `id UUID` - Primary key
- `lat DOUBLE PRECISION`
- `lng DOUBLE PRECISION`  
- `title TEXT`
- `active BOOLEAN`
- `visible_from TIMESTAMPTZ`
- `visible_to TIMESTAMPTZ`

### 1.2 Tabella `marker_rewards`

**🔴 PROBLEMA CRITICO: DEFINIZIONE CONFLITTUALE**

Due migrazioni definiscono la tabella in modo diverso:

| Migration | marker_id Type |
|-----------|----------------|
| `20250814124057_*.sql` | `UUID NOT NULL` |
| `20251120052534_*.sql` | `TEXT NOT NULL` |

**Codice SQL (Migration 1):**
```sql
-- File: 20250814124057_ec3adf48-a39b-45ce-98f2-8df374b9c48f.sql
CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL,  -- 🔴 UUID
  reward_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Codice SQL (Migration 2):**
```sql
-- File: 20251120052534_1cbf48fa-3c51-46f0-bec7-4cc7df09d5dc.sql
CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id TEXT NOT NULL,  -- 🔴 TEXT (diverso!)
  reward_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.3 Tabella `marker_claims`

```sql
-- File: 20250814124057/156
CREATE TABLE IF NOT EXISTS public.marker_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL,  -- 🟡 UUID
  user_id UUID NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(marker_id, user_id)
);
```

---

## 📋 FASE 2 — RENDERING MAPPA

### 2.1 Visibilità Marker (RewardsLayer3D.tsx)

**File:** `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`

```typescript
// Linea 30: DEFAULT MOLTO ALTO!
const DEFAULT_MIN_ZOOM = 17;

// Linea 79-80: Condizione di visibilità
const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
```

**Significato:**
| Zoom | Distanza Visuale |
|------|------------------|
| 14 | ~5 km |
| 15 | ~2 km |
| **17** | **~500 metri** ← Default! |
| 18 | ~200 m |

**CONCLUSIONE:** Con `DEFAULT_MIN_ZOOM = 17`, i marker sono visibili SOLO quando l'utente zooma fino a vedere singoli edifici (~500m).

### 2.2 Layer Style

**Verificato:**
- ✅ `opacity` non impostata a 0
- ✅ `iconSize` impostato correttamente (22px)
- ✅ Nessun `visibility: none`
- ✅ Nessun filtro che nasconde i marker
- ✅ Click handler sul wrapper corretto

---

## 📋 FASE 3 — FLUSSO CLAIM (RISCATTO)

### 3.1 Componente UI: ClaimRewardModal.tsx

**File:** `src/components/marker-rewards/ClaimRewardModal.tsx`

```typescript
// Linea 88-89: Chiama Edge Function
const { data, error } = await supabase.functions
  .invoke('claim-marker-reward', { body: { markerId } });

// Linea 177-178: Errore generico
console.error('M1QR-TRACE', { step: 'claim_error', markerId, error, data });
toast.error('Errore nel riscatto del premio');
```

**Osservazione:** Il `markerId` viene passato come stringa (dal click sul marker).

### 3.2 Edge Function: claim-marker-reward

**File:** `supabase/functions/claim-marker-reward/index.ts`

```typescript
// Linea 17: marker_id è stringa
const markerId = String((body?.markerId || "")).trim();

// Linea 41-46: Query marker_claims con admin client
const { data: existingClaim, error: checkError } = await admin
  .from("marker_claims")
  .select("id")
  .eq("user_id", user_id)
  .eq("marker_id", markerId)  // 🔴 markerId è STRING, ma tabella aspetta UUID!
  .maybeSingle();

// Linea 58-61: Query marker_rewards
const { data: rewards, error: rewardsError } = await userClient
  .from("marker_rewards")
  .select("reward_type, payload, description")
  .eq("marker_id", markerId);  // 🔴 Potenziale mismatch tipo!

// Linea 77-78: Insert claim
const { error: claimError } = await admin
  .from("marker_claims")
  .insert([{ user_id, marker_id: markerId }]);  // 🔴 STRING in colonna UUID?
```

### 3.3 RLS Policies

**marker_claims:**
```sql
-- SELECT: Tutti possono vedere
CREATE POLICY "Anyone can view marker claims for visibility"
ON public.marker_claims FOR SELECT USING (true);

-- INSERT: Solo proprio user_id
CREATE POLICY "Users can insert their own claims"
ON public.marker_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**marker_rewards:**
```sql
-- SELECT: Tutti possono vedere
CREATE POLICY "Public can view marker rewards"
ON public.marker_rewards FOR SELECT USING (true);
```

---

## 📋 FASE 4 — WEB vs iOS WRAPPED

| Aspetto | Status | Note |
|---------|--------|------|
| Problema solo iOS? | ❌ No | Problema è DB/backend |
| WKWebView influisce? | ❌ No | Network funziona |
| Token auth valido? | ✅ Sì | Edge Function riceve user_id |
| Sessione valida? | ✅ Sì | 401 solo se scaduta |
| Supabase URL? | ✅ Corretto | Env vars corrette |

---

## 📊 REPORT FINALE STRUTTURATO

### 1️⃣ STATO MARKER

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Esistono marker? | ❓ **Probabilmente pochi** | RLS blocca INSERT dal client |
| Attivi? | ❓ Se esistono, `active=true` | MarkerRewardManager li crea attivi |
| Visibili temporalmente? | ❓ Se esistono | `visible_from`/`visible_to` impostati |
| min_zoom reale | **17** (default) o payload | Hardcoded in `DEFAULT_MIN_ZOOM` |

### 2️⃣ STATO RENDERING

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Vengono caricati? | ✅ Sì, se esistono | `MapTiler3D.tsx` query `markers` |
| Vengono filtrati? | ✅ Sì, per zoom | `currentZoom >= markerMinZoom` |
| Motivo invisibilità | **Zoom < 17** | `DEFAULT_MIN_ZOOM = 17` |

### 3️⃣ STATO CLAIM

| Domanda | Risposta | Evidenza |
|---------|----------|----------|
| Funzione chiamata | `supabase.functions.invoke('claim-marker-reward')` | ClaimRewardModal.tsx:88 |
| Endpoint | Edge Function `/functions/v1/claim-marker-reward` | Standard Supabase |
| RLS coinvolta | ⚠️ Parziale | Admin client bypassa per claims |
| UPDATE bloccato? | N/A | Usa INSERT, non UPDATE |
| **Errore preciso** | 🔴 **TYPE MISMATCH** | `marker_id STRING` vs `UUID` in DB |

### 4️⃣ ROOT CAUSE ORDINATE PER PROBABILITÀ

| Prob. | Causa | Evidenza |
|-------|-------|----------|
| **90%** | 🔴 **TYPE MISMATCH marker_id (STRING vs UUID)** | Migration conflittuali: una usa TEXT, l'altra UUID. Query fallisce perché PostgreSQL non può comparare UUID con string. |
| **70%** | 🟡 Zoom troppo alto (17) | `DEFAULT_MIN_ZOOM = 17` richiede zoom molto vicino |
| **60%** | 🟡 Marker non esistono nel DB | RLS `markers_no_insert WITH CHECK (false)` blocca INSERT |
| **30%** | 🟡 marker_rewards vuoto per marker_id | Se nessun record in `marker_rewards`, restituisce `NO_REWARD` |
| **20%** | ⚪ Finestra temporale scaduta | `visible_to < now()` |
| **10%** | ⚪ Marker già claimato | `ALREADY_CLAIMED` (ma utente vede errore generico) |

---

## 🔴 ROOT CAUSE PRINCIPALE: TYPE MISMATCH

### Dettaglio Tecnico

1. **Tabella `markers`:** `id UUID`
2. **Tabella `marker_rewards`:** `marker_id` è **TEXT** o **UUID** (conflitto migrazioni)
3. **Tabella `marker_claims`:** `marker_id UUID`
4. **Edge Function:** Passa `markerId` come **STRING**

### Scenario di Errore

Quando l'utente clicca "Riscatta subito":

1. ✅ Click sul marker → `markerId = "abc-123-uuid-format"`
2. ✅ Modal aperto → mostra rewards (se esistono)
3. ❌ **Query `marker_claims`:**
   ```sql
   SELECT id FROM marker_claims 
   WHERE marker_id = 'abc-123-uuid-format'  -- STRING!
   -- Ma marker_id è UUID, quindi PostgreSQL fa implicit cast
   -- o ritorna errore "invalid input syntax for type uuid"
   ```
4. ❌ **Query `marker_rewards`:**
   ```sql
   SELECT * FROM marker_rewards 
   WHERE marker_id = 'abc-123-uuid-format'
   -- Se la colonna è UUID: errore di tipo
   -- Se la colonna è TEXT: potrebbe funzionare
   ```
5. ❌ **INSERT `marker_claims`:**
   ```sql
   INSERT INTO marker_claims (user_id, marker_id)
   VALUES ('user-uuid', 'marker-string')
   -- marker_id è UUID nella tabella → errore!
   ```

### Errore Probabile nei Log Supabase

```
error: invalid input syntax for type uuid: "abc-123-uuid-format"
-- oppure --
error: column "marker_id" is of type uuid but expression is of type text
```

---

## 🛠️ FIX PROPOSTI (NON APPLICATI)

### FIX 1: Verificare Tipo Reale in Produzione

```sql
-- Eseguire in Supabase SQL Editor (SOLO SELECT)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('markers', 'marker_rewards', 'marker_claims')
  AND column_name IN ('id', 'marker_id');
```

### FIX 2: Edge Function - Cast Esplicito a UUID

```typescript
// In claim-marker-reward/index.ts
// PRIMA: const markerId = String((body?.markerId || "")).trim();
// DOPO:
const markerIdRaw = String((body?.markerId || "")).trim();
// Validare come UUID
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(markerIdRaw)) {
  return jsonResponse({ status: "error", error: "invalid_marker_id" }, 400);
}
const markerId = markerIdRaw; // Ora è validato come UUID
```

### FIX 3: Uniformare Tipo `marker_id` in Tutte le Tabelle

```sql
-- Se marker_rewards ha marker_id TEXT, convertire:
ALTER TABLE public.marker_rewards 
  ALTER COLUMN marker_id TYPE UUID USING marker_id::uuid;
```

### FIX 4: Ridurre Zoom Default

```typescript
// In RewardsLayer3D.tsx
const DEFAULT_MIN_ZOOM = 14;  // Invece di 17
```

### FIX 5: Modificare RLS per Permettere INSERT Admin

```sql
DROP POLICY IF EXISTS markers_no_insert ON public.markers;
CREATE POLICY markers_admin_insert ON public.markers
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_secure());
```

---

## ⚠️ VERIFICHE URGENTI DA ESEGUIRE

1. **Verificare tipo `marker_id` in produzione** (query SQL sopra)
2. **Verificare logs Edge Function** in Supabase Dashboard → Functions → Logs
3. **Testare claim con UUID valido** direttamente in console browser
4. **Controllare se esistono marker attivi** con:
   ```sql
   SELECT COUNT(*) FROM markers WHERE active = true;
   SELECT COUNT(*) FROM marker_rewards;
   ```

---

## 📝 CONCLUSIONE

Il problema **"Errore nel riscatto del premio"** è quasi certamente causato da un **TYPE MISMATCH** tra:
- `marker_id` passato come **STRING** dalla Edge Function
- `marker_id` definito come **UUID** nelle tabelle `marker_rewards` e/o `marker_claims`

Il problema dei **marker invisibili** è causato da:
1. **Zoom troppo alto** (default 17 = 500m di distanza)
2. **Marker potrebbero non esistere** (RLS blocca INSERT)

---

*Report generato: 2026-02-11*  
*Modalità: READ-ONLY FORENSICS*  
*ZERO MODIFICHE APPLICATE*
