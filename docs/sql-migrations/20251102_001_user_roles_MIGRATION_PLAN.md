# User Roles System - Migration Plan
**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## 📋 Executive Summary

Questa migrazione sostituisce il sistema **INSICURO** basato su `profiles.role` con il nuovo sistema **SICURO** `user_roles` + `has_role()`.

### 🚨 Perché è Critica?

**VULNERABILITÀ ATTUALI (da eliminare):**
1. **Privilege Escalation:** Un utente può modificare `profiles.role = 'admin'` con una semplice UPDATE
2. **Recursive RLS:** Policy che controllano `(SELECT role FROM profiles WHERE ...)` causano loop infiniti
3. **No Audit Trail:** Nessun log di chi ha assegnato ruoli e quando
4. **Type Unsafe:** Ruoli come stringhe senza validazione (es. `'adnim'` invece di `'admin'`)

**BENEFICI NUOVI (dopo migrazione):**
1. ✅ **Separate Roles Table:** Impossibile auto-assegnarsi ruoli admin
2. ✅ **SECURITY DEFINER:** `has_role()` bypassa RLS (no recursion)
3. ✅ **Audit Trail:** Ogni modifica tracciata in `admin_logs`
4. ✅ **Type Safe:** Enum `app_role` previene typos

---

## 🔍 Audit Completo: File da Migrare

Dopo aver scansionato il codebase, abbiamo trovato **38 file SQL** con pattern insicuri che devono essere migrati.

### **Categoria A: Funzioni `is_admin()` da Deprecare**

Queste funzioni esistono già ma usano il vecchio sistema insicuro:

```sql
-- ❌ VECCHIO: supabase/migrations/*_is_admin*.sql
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;  -- ❌ INSICURO!
$$;
```

**Files da deprecare:**
- `supabase/migrations/20250729134226-*_is_admin.sql`
- `supabase/migrations/20250729134333-*_is_admin.sql`
- `supabase/migrations/20250802124242_*_is_admin*.sql`
- `supabase/migrations/20250802124304_*_is_admin*.sql`
- Tutti i file che contengono `is_admin()` o `is_admin_secure()` o `is_admin_user()`

**Action Plan:**
1. ✅ NON eliminare subito (breaking change)
2. ✅ Creare wrapper che chiama `has_role()`:
   ```sql
   CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
   RETURNS BOOLEAN AS $$
     SELECT public.has_role(user_id, 'admin');  -- ✅ Usa il nuovo sistema
   $$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;
   ```
3. ✅ Deprecation notice nei commenti
4. ✅ Rimuovere dopo 1 mese (dare tempo ai client di aggiornare)

---

### **Categoria B: Policies con `profiles.role` da Migrare**

Pattern trovati in **19 file SQL** (24 occorrenze):

#### **Pattern 1: Policy con EXISTS**
```sql
-- ❌ VECCHIO (recursive RLS, insicuro)
CREATE POLICY "Admins can manage"
ON some_table
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- ✅ NUOVO (non-recursive, sicuro)
CREATE POLICY "Admins can manage"
ON some_table
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

#### **Pattern 2: Policy con WHERE diretto**
```sql
-- ❌ VECCHIO
CREATE POLICY "Admins only"
ON some_table
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ✅ NUOVO
CREATE POLICY "Admins only"
ON some_table
USING (public.has_role(auth.uid(), 'admin'));
```

#### **Pattern 3: Policy con WITH CHECK**
```sql
-- ❌ VECCHIO
CREATE POLICY "Admin insert"
ON some_table
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- ✅ NUOVO
CREATE POLICY "Admin insert"
ON some_table
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

**Files che richiedono migrazione:**

1. **Prize Clues (bassa priorità, feature secondaria):**
   - `supabase/functions/create-prize-clues-table/index.sql`
   - `supabase/functions/create-table.sql`

2. **Core Tables (ALTA PRIORITÀ):**
   - `supabase/migrations/20250711103428-*_user_xp.sql`
   - `supabase/migrations/20250718093042-*_missions.sql`
   - `supabase/migrations/20250718093120-*_mission_progress.sql`
   - `supabase/migrations/20250718093158-*_achievements.sql`
   - `supabase/migrations/20250719061659-*_user_stats.sql`
   - `supabase/migrations/20250720073311-*_leaderboards.sql`
   - `supabase/migrations/20250722134433-*_rewards.sql`
   - `supabase/migrations/20250724042743-*_notifications.sql`

3. **Profiles Security (CRITICA):**
   - `supabase/migrations/20250729134306-*_profiles_rls.sql` (line 18-19)
   - `supabase/migrations/20250802130519-*_profiles.sql`

4. **Admin Tables (CRITICA):**
   - `supabase/migrations/20250812124809-*_admin_tables.sql`
   - `supabase/migrations/20250909134606-*_admin_access.sql`
   - `supabase/migrations/20251004145627-*_admin_panel.sql`
   - `supabase/migrations/20251024082427-*_rank_history.sql`
   - `supabase/migrations/20251031100023-*_admin_logs.sql`

---

### **Categoria C: Constraints e Validazioni**

#### **Pattern 4: COALESCE check per prevenire role changes**
```sql
-- ❌ VECCHIO (in profiles table UPDATE policy)
-- Line 18-19 in 20250729134306-*.sql
(profiles.role = COALESCE(
  (SELECT role FROM public.profiles WHERE id = auth.uid()), 
  profiles.role
) OR EXISTS (
  SELECT 1 FROM public.profiles p2 
  WHERE p2.id = auth.uid() AND p2.role = 'admin'
))

-- ✅ NUOVO
-- Opzione 1: Bloccare completamente le modifiche alla colonna role
(OLD.role = NEW.role OR public.has_role(auth.uid(), 'admin'))

-- Opzione 2 (RACCOMANDATO): Deprecare profiles.role completamente
-- 1. Migrare tutti i check a user_roles
-- 2. Rendere profiles.role nullable e deprecato
-- 3. Aggiungere trigger che sincronizza user_roles → profiles.role (read-only)
```

---

## 🎯 Piano di Migrazione Graduale

### **FASE 1: FOUNDATION (COMPLETA)**
- [x] Creare tabella `user_roles` ✅
- [x] Creare funzione `has_role()` SECURITY DEFINER ✅
- [x] Creare tabella `admin_logs` ✅
- [x] Assegnare ruolo admin al fondatore ✅

### **FASE 2: BACKWARD COMPATIBILITY (Next)**
**Obiettivo:** Permettere ai sistemi vecchi e nuovi di coesistere temporaneamente.

```sql
-- A. Creare wrapper function per retrocompatibilità
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- DEPRECATION NOTICE: Use public.has_role(user_id, 'admin') instead
  SELECT public.has_role(user_id, 'admin');
$$;

-- B. Creare trigger per sync user_roles → profiles.role (read-only)
CREATE OR REPLACE FUNCTION public.sync_user_roles_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles.role based on highest priority role in user_roles
  UPDATE public.profiles
  SET role = (
    SELECT role::text
    FROM public.user_roles
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    ORDER BY 
      CASE role::text
        WHEN 'admin' THEN 1
        WHEN 'moderator' THEN 2
        WHEN 'agent' THEN 3
      END
    LIMIT 1
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_user_roles_sync ON public.user_roles;
CREATE TRIGGER on_user_roles_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_to_profiles();

-- C. Migrare dati esistenti da profiles.role → user_roles
INSERT INTO public.user_roles (user_id, role, assigned_by, metadata)
SELECT 
  id,
  role::public.app_role,
  id,  -- Self-assigned (migration)
  jsonb_build_object(
    'migrated_from', 'profiles.role',
    'migration_date', NOW()
  )
FROM public.profiles
WHERE role IN ('admin', 'moderator', 'agent')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = profiles.id
  );
```

**Durata:** 1-2 giorni (test + deploy)

---

### **FASE 3: POLICY MIGRATION (Core Tables)**
**Obiettivo:** Migrare le policy critiche una tabella alla volta.

**Priorità ALTA (fare subito):**
1. ✅ `profiles` (previene privilege escalation)
2. ✅ `admin_logs` (già usa has_role)
3. ⏳ `user_xp` (XP manipulation)
4. ⏳ `agent_ranks` (rank manipulation)
5. ⏳ `m1_units_balance` (currency manipulation)

**Template SQL:**
```sql
-- Per ogni tabella critica:
-- 1. Drop vecchia policy
DROP POLICY IF EXISTS "Admin full access" ON public.TABLE_NAME;

-- 2. Crea nuova policy con has_role()
CREATE POLICY "Admin full access"
ON public.TABLE_NAME
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Test
SELECT * FROM public.TABLE_NAME;  -- Come admin: dovrebbe funzionare
-- (Testa anche come non-admin: dovrebbe fallire)
```

**Durata:** 1 settimana (1-2 tabelle/giorno con test)

---

### **FASE 4: SECONDARY TABLES**
**Obiettivo:** Migrare tabelle meno critiche.

**Priorità MEDIA:**
- Missions, Achievements, Notifications, Leaderboards
- Prize Clues, Referrals, User Stats

**Durata:** 1 settimana

---

### **FASE 5: CLEANUP**
**Obiettivo:** Rimuovere codice legacy.

```sql
-- A. Deprecare colonna profiles.role
ALTER TABLE public.profiles 
  ADD COLUMN role_deprecated TEXT;

UPDATE public.profiles 
  SET role_deprecated = role;

ALTER TABLE public.profiles 
  DROP COLUMN role;

-- B. Rimuovere wrapper functions
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin_secure();
DROP FUNCTION IF EXISTS public.is_admin_user();

-- C. Rimuovere sync trigger
DROP TRIGGER IF EXISTS on_user_roles_sync ON public.user_roles;
DROP FUNCTION IF EXISTS public.sync_user_roles_to_profiles();
```

**Durata:** 1 giorno (dopo 1 mese di grace period)

---

## 🧪 Testing Checklist per Ogni Tabella Migrata

Prima di considerare una tabella "migrata", verifica:

### **Security Tests:**
- [ ] Admin può SELECT/INSERT/UPDATE/DELETE
- [ ] Non-admin NON può modificare dati critici
- [ ] Anonymous user NON ha accesso

### **Backward Compatibility Tests:**
- [ ] Frontend esistente (se usa `is_admin()`) funziona ancora
- [ ] Query vecchie (se esistono) non crashano
- [ ] Edge functions non affette

### **Performance Tests:**
- [ ] `EXPLAIN ANALYZE SELECT` usa index su `user_roles.user_id`
- [ ] Tempo esecuzione `has_role()` < 5ms
- [ ] No N+1 queries

### **Audit Tests:**
- [ ] Modifiche ai ruoli loggano in `admin_logs`
- [ ] Log contiene: admin_id, action, timestamp, details
- [ ] IP address e user_agent catturati (se disponibili)

---

## 📊 Migration Progress Tracker

| Tabella              | Status | Policy Migrated | Tested | Notes                    |
|----------------------|--------|-----------------|--------|--------------------------|
| user_roles           | ✅     | ✅              | ✅     | New system               |
| admin_logs           | ✅     | ✅              | ✅     | New system               |
| profiles             | ⏳     | ❌              | ❌     | CRITICAL - Do first      |
| user_xp              | ⏳     | ❌              | ❌     | High priority            |
| agent_ranks          | ⏳     | ❌              | ❌     | High priority            |
| m1_units_balance     | ⏳     | ❌              | ❌     | High priority            |
| missions             | ⏳     | ❌              | ❌     | Medium priority          |
| achievements         | ⏳     | ❌              | ❌     | Medium priority          |
| notifications        | ⏳     | ❌              | ❌     | Medium priority          |
| leaderboards         | ⏳     | ❌              | ❌     | Medium priority          |
| prize_clues          | ⏳     | ❌              | ❌     | Low priority (feature)   |

**Legend:**
- ✅ Complete
- ⏳ Pending
- ❌ Not Started
- 🚧 In Progress

---

## 🚨 Rollback Procedures

Se qualcosa va storto durante la migrazione di una tabella:

### **Scenario A: Policy Migrated but Broken**
```sql
-- 1. Drop nuova policy
DROP POLICY IF EXISTS "Admin full access" ON public.TABLE_NAME;

-- 2. Re-create vecchia policy (temporary)
CREATE POLICY "Admin full access LEGACY"
ON public.TABLE_NAME
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- 3. Debug issue offline
-- 4. Retry migration dopo fix
```

### **Scenario B: Complete System Failure**
```sql
-- Nuclear option: Revert to legacy system
-- (Usa solo in emergenza assoluta)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Re-enable legacy system
-- (Policies originali dovrebbero essere ancora in git history)
```

---

## 📞 Next Steps

1. **Review this plan:** Condividi con team/stakeholders
2. **Phase 2 Setup:** Esegui backward compatibility SQL
3. **Test in staging:** Crea ambiente di test con dati reali
4. **Migrate one table:** Inizia con `profiles` (la più critica)
5. **Monitor logs:** Controlla `admin_logs` per anomalie
6. **Iterate:** Ripeti per altre tabelle seguendo priorità

---

## 📚 References

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [SECURITY DEFINER Best Practices](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [M1SSION Security Hardening Guide](./20251102_001_user_roles_SETUP.md)

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
