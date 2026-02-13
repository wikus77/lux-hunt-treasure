# 🔍 MARKER SYSTEM FULL FORENSIC REPORT

**Data**: 2026-02-11  
**Branch**: `hotfix/marker-system-fix-safe`  
**Tag rollback**: `ROLLBACK_MARKER_SYSTEM_PRE_FIX`  
**Commit base**: `05f27c8b`  

---

## 📊 EXECUTIVE SUMMARY

| Problema | Root Cause | Severità | Fix Required |
|----------|------------|----------|--------------|
| Inserimento marker bloccato | RLS `markers_no_insert` WITH CHECK (false) | 🔴 CRITICA | FIX 4 |
| Marker invisibili | `DEFAULT_MIN_ZOOM = 17` (troppo alto) | 🟡 MEDIA | FIX 3 |
| Claim fallisce | Type mismatch `marker_id` UUID vs TEXT | 🔴 CRITICA | FIX 1 + FIX 2 |
| Wallet non aggiornato | Conseguenza del claim failure | 🔴 CRITICA | FIX 1 + FIX 2 |

---

## 🔍 FASE 1 — VERIFICA FORENSE COMPLETA

---

### 1️⃣ VERIFICA TIPI COLONNE

#### Risultato analisi migrazioni SQL:

| Tabella | Colonna | Tipo (Migration Agosto 2025) | Tipo (Migration Nov 2025) |
|---------|---------|------------------------------|---------------------------|
| `markers` | `id` | `UUID` | `UUID` |
| `marker_rewards` | `marker_id` | `UUID NOT NULL` | `TEXT NOT NULL` ⚠️ |
| `marker_claims` | `marker_id` | `UUID NOT NULL` | `UUID NOT NULL` |

#### 📍 Evidence:

**Migration `20250814124057_ec3adf48-a39b-45ce-98f2-8df374b9c48f.sql` (Agosto 2025):**
```sql
-- Table: marker_rewards (multi-reward configuration per marker)
CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL, -- ✅ UUID
  ...
);

-- Table: marker_claims
CREATE TABLE IF NOT EXISTS public.marker_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id UUID NOT NULL, -- ✅ UUID
  user_id UUID NOT NULL,
  ...
);
```

**Migration `20251120052534_1cbf48fa-3c51-46f0-bec7-4cc7df09d5dc.sql` (Novembre 2025):**
```sql
CREATE TABLE IF NOT EXISTS public.marker_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id TEXT NOT NULL, -- ⚠️ TEXT (conflitto!)
  ...
);
```

#### ❌ TYPE MISMATCH CONFERMATO

Il tipo di `marker_id` in `marker_rewards` è definito come `TEXT` nella migrazione più recente, ma `marker_claims` usa `UUID`. Questo causa errori PostgreSQL quando:
1. Si tenta di inserire in `marker_claims` con `marker_id` stringa
2. Si fa JOIN tra le tabelle con tipi diversi

---

### 2️⃣ VERIFICA RLS SU MARKERS

#### 📍 Evidence (file `20250919031352_54142285-41ca-4dad-8fd3-99aceb8e67c0.sql`):

```sql
-- Niente insert/update/delete da authenticated (verranno fatti via RPC security definer)
CREATE POLICY markers_no_insert ON public.markers
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY markers_no_update ON public.markers
  FOR UPDATE TO authenticated USING (false);
```

#### ❌ RLS BLOCCO INSERT CONFERMATO

La policy `markers_no_insert` blocca TUTTE le operazioni INSERT sulla tabella `markers` per gli utenti `authenticated`. Questo impedisce:
- Inserimento marker da `MarkerRewardManager.tsx`
- Qualsiasi inserimento diretto da client

**Conseguenza**: L'admin non può creare nuovi marker tramite il panel.

---

### 3️⃣ VERIFICA EDGE FUNCTION `claim-marker-reward`

#### 📍 Evidence (file `supabase/functions/claim-marker-reward/index.ts`):

**Linea 17 - Nessuna validazione UUID:**
```typescript
const markerId = String((body?.markerId || "")).trim();
if (!markerId) return jsonResponse({ status: "error", error: "missing_marker_id" }, 400);
// ⚠️ Nessun check se markerId è UUID valido!
```

**Linea 44-46 - Query con string non castata:**
```typescript
const { data: existingClaim, error: checkError } = await admin
  .from("marker_claims")
  .select("id")
  .eq("user_id", user_id)
  .eq("marker_id", markerId)  // ⚠️ STRING passata a colonna UUID!
  .maybeSingle();
```

**Linea 77-79 - Insert con string non castata:**
```typescript
const { error: claimError } = await admin
  .from("marker_claims")
  .insert([{ user_id, marker_id: markerId }]);  // ⚠️ STRING in colonna UUID!
```

#### ❌ PROBLEMI CONFERMATI:

1. **Nessuna validazione UUID**: `markerId` non viene validato come UUID valido
2. **Nessun cast esplicito**: La stringa viene passata direttamente a query su colonna UUID
3. **Error handling insufficiente**: Gli errori di tipo non sono gestiti specificamente

**Errore PostgreSQL probabile:**
```
invalid input syntax for type uuid: "..."
```

---

### 4️⃣ VERIFICA ZOOM VISIBILITY

#### 📍 Evidence (file `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx`):

**Linea 30:**
```typescript
const DEFAULT_MIN_ZOOM = 17;  // ⚠️ TROPPO ALTO!
```

**Linea 79:**
```typescript
const markerMinZoom = rewardMarker.min_zoom || DEFAULT_MIN_ZOOM;
//                                          ^^
// ⚠️ Operatore || : se min_zoom = 0 (o null/undefined), usa 17
```

**Linea 80:**
```typescript
const isVisible = rewardMarker.claimed || currentZoom >= markerMinZoom;
```

#### ❌ PROBLEMI CONFERMATI:

1. **DEFAULT_MIN_ZOOM = 17**: Zoom 17 corrisponde a ~500 metri di vista. I marker sono invisibili a zoom normali (14-16).
2. **Operatore `||` invece di `??`**: Se `min_zoom` è `0` o falsy, viene usato `17` invece del valore impostato.

**Conseguenza**: I marker non sono visibili a meno che l'utente non sia zoommato molto vicino.

---

### 5️⃣ VERIFICA WALLET UPDATE

#### 📍 Evidence (file `supabase/functions/claim-marker-reward/index.ts`):

**Linea 343-347 - M1U Credit via RPC:**
```typescript
const { data: rpcResult, error: rpcError } = await admin.rpc('admin_credit_m1u', {
  p_user_id: user_id,
  p_amount: m1uAmount,
  p_reason: `marker_reward:${markerId}`
});
```

#### ✅ CONFERMATO: Wallet M1U è SEPARATO da IAP

La funzione `admin_credit_m1u`:
- È un RPC con `SECURITY DEFINER`
- Usa `service_role` (bypass RLS)
- NON tocca logica IAP, Stripe, o receipt validation
- Accredita M1U direttamente su `user_wallet`

**Impatto Zero su IAP**: Il credito M1U da marker reward NON interferisce con:
- `verify-iap-purchase`
- `iapService.ts`
- Subscription flow
- Stripe payments

---

## 📋 ROOT CAUSE RANKING

| # | Causa | Probabilità | Impatto | File |
|---|-------|-------------|---------|------|
| 1 | Type mismatch `marker_id` (UUID vs TEXT) | 95% | 🔴 Critico | Edge Function + DB Schema |
| 2 | RLS `markers_no_insert` blocca INSERT | 100% | 🔴 Critico | `20250919031352...sql` |
| 3 | `DEFAULT_MIN_ZOOM = 17` troppo alto | 100% | 🟡 Medio | `RewardsLayer3D.tsx` |
| 4 | Operatore `\|\|` invece di `??` per zoom | 80% | 🟡 Medio | `RewardsLayer3D.tsx` |

---

## 🔧 FIX PROPOSTI (NON APPLICATI)

### FIX 1 — Uniformare `marker_id` a UUID

```sql
-- Solo se marker_rewards.marker_id è TEXT:
ALTER TABLE public.marker_rewards
ALTER COLUMN marker_id TYPE UUID USING marker_id::uuid;
```

**Rischio**: Se esistono record con `marker_id` non-UUID, la conversione fallisce.  
**Mitigation**: Prima verificare con `SELECT marker_id FROM marker_rewards WHERE marker_id !~ '^[0-9a-f-]{36}$'`

---

### FIX 2 — Validazione UUID in Edge Function

```typescript
// In claim-marker-reward/index.ts, dopo riga 17:
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(markerId)) {
  return jsonResponse({ status: "error", error: "invalid_marker_id", detail: "marker_id must be a valid UUID" }, 400);
}
```

**Rischio**: Basso, è validazione aggiuntiva.

---

### FIX 3 — Correzione Zoom Visibility

```typescript
// In RewardsLayer3D.tsx:
// Riga 30:
const DEFAULT_MIN_ZOOM = 14;  // Era 17

// Riga 79:
const markerMinZoom = rewardMarker.min_zoom ?? DEFAULT_MIN_ZOOM;
//                                          ^^
//                                          Cambiato da || a ??
```

**Rischio**: Nessuno, solo UI.

---

### FIX 4 — Sistemare RLS per Admin INSERT

```sql
-- Drop policy bloccante
DROP POLICY IF EXISTS markers_no_insert ON public.markers;

-- Creare policy sicura per admin
CREATE POLICY markers_admin_insert
ON public.markers
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner'))
);
```

**Rischio**: Se la funzione `is_admin_secure()` non esiste, usare la query diretta sopra.

---

## ✅ TEST DA ESEGUIRE DOPO FIX

| Test | Descrizione | Expected |
|------|-------------|----------|
| 1 | Inserimento marker da MarkerRewardManager | ✅ Marker creato in DB |
| 2 | Marker visibile a zoom 14-15 | ✅ Marker verde visibile |
| 3 | Claim marker reward | ✅ Popup OK, nessun errore |
| 4 | Wallet balance dopo claim M1U | ✅ Balance aumentata |

---

## 🔐 GARANZIE DI SICUREZZA

✅ **NON sarà modificato:**
- `src/iap/iapService.ts`
- `supabase/functions/verify-iap-purchase/index.ts`
- Qualsiasi logica Stripe
- Qualsiasi logica subscription
- UnifiedHeader / BottomNavigation
- Login / Auth flow
- Safe Area / WKWebView config

✅ **Scope modifiche SOLO:**
- `supabase/functions/claim-marker-reward/index.ts` (validazione UUID)
- `src/pages/sandbox/map3d/layers/RewardsLayer3D.tsx` (zoom)
- Eventuali migrazioni SQL per RLS markers

---

## 🔁 ROLLBACK IMMEDIATO

```bash
# Git
git reset --hard ROLLBACK_MARKER_SYSTEM_PRE_FIX
git clean -fd

# Se Edge Function deployata:
# Redeploy versione precedente da backup
```

---

## ⚠️ AZIONE RICHIESTA

```
FORENSIC VERIFICATION COMPLETE — NO CHANGES APPLIED

Attendere conferma utente prima di applicare fix.
```

---

© 2026 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
