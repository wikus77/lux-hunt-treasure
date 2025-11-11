# User Roles System - Setup Guide
**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**

## 📋 Overview
Migrazione critica per implementare RBAC (Role-Based Access Control) sicuro con:
- ✅ Tabella `user_roles` separata (no privilege escalation)
- ✅ Funzione `has_role()` SECURITY DEFINER (no RLS recursion)
- ✅ Audit trail `admin_logs` per tutte le operazioni admin
- ✅ Type-safe RPC functions in TypeScript

---

## 🚀 Step-by-Step Setup

### **STEP 1: Esegui la Migrazione SQL**

1. Apri Supabase Dashboard → SQL Editor
2. Copia/incolla il contenuto di `20251102_001_user_roles_system.sql`
3. Click **RUN** (durata: ~3 secondi)

**Expected output:**
```
SUCCESS: CREATE TYPE
SUCCESS: CREATE TABLE user_roles
SUCCESS: CREATE TABLE admin_logs
SUCCESS: CREATE FUNCTION has_role
SUCCESS: CREATE FUNCTION current_user_role
SUCCESS: CREATE FUNCTION log_admin_action
SUCCESS: CREATE TRIGGER on_user_role_change
```

---

### **STEP 2: Assegna Ruolo Admin al Fondatore**

**⚠️ CRITICO:** Esegui questo comando **UNA SOLA VOLTA** con il tuo `user_id` effettivo.

```sql
-- Trova il tuo user_id
SELECT id, email FROM auth.users WHERE email = 'TUA_EMAIL_FONDATORE@domain.com';

-- Assegna ruolo admin (sostituisci USER_ID_QUI con l'ID sopra)
INSERT INTO public.user_roles (user_id, role, assigned_by, metadata)
VALUES (
  'USER_ID_QUI'::uuid,  -- ← SOSTITUISCI CON IL TUO USER_ID
  'admin'::public.app_role,
  'USER_ID_QUI'::uuid,  -- ← STESSO USER_ID
  jsonb_build_object(
    'assigned_reason', 'founder_initialization',
    'assigned_date', NOW()
  )
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Verifica assegnazione
SELECT 
  ur.user_id, 
  u.email, 
  ur.role, 
  ur.assigned_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

**Expected output:**
```
user_id                              | email                  | role  | assigned_at
-------------------------------------|------------------------|-------|-------------------------
YOUR_USER_ID                         | your@email.com         | admin | 2025-11-02 04:00:00+00
```

---

### **STEP 3: Test RPC Functions**

Testa le funzioni dal frontend o da SQL Editor (loggato come fondatore):

```sql
-- Test 1: Controlla se sei admin
SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
-- Expected: true

-- Test 2: Ottieni il tuo ruolo corrente
SELECT public.current_user_role();
-- Expected: 'admin'

-- Test 3: Log un'azione di test
SELECT public.log_admin_action(
  'TEST_ACTION',
  auth.uid(),
  'user_roles',
  '{"test": true}'::jsonb
);
-- Expected: UUID del log creato

-- Test 4: Visualizza i log
SELECT 
  action,
  target_user_id,
  target_table,
  details,
  created_at
FROM public.admin_logs
ORDER BY created_at DESC
LIMIT 5;
```

---

### **STEP 4: Verifica RLS Policies**

Testa che le policy funzionino correttamente:

```sql
-- Come admin, dovresti vedere TUTTE le righe
SELECT COUNT(*) FROM public.user_roles;
-- Expected: ≥ 1 (almeno il tuo ruolo admin)

-- Dovresti vedere i log admin
SELECT COUNT(*) FROM public.admin_logs;
-- Expected: ≥ 1 (almeno il test log di Step 3)

-- Non loggato, dovresti avere accesso negato
-- (testa in una finestra incognito o con un utente non-admin)
```

---

## 🔧 Frontend Integration

Le RPC functions sono già tipizzate in `src/lib/supabase/rpc-types.ts`.

### **Esempio: Check Admin Status**

```typescript
import { supabase } from '@/integrations/supabase/client';

async function checkIfAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });
  
  if (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
  
  return data === true;
}

// Usage
const isAdmin = await checkIfAdmin(user.id);
```

### **Esempio: Get Current User Role**

```typescript
async function getCurrentRole(): Promise<'admin' | 'moderator' | 'agent' | null> {
  const { data, error } = await supabase.rpc('current_user_role');
  
  if (error) {
    console.error('Error fetching role:', error);
    return null;
  }
  
  return data;
}
```

### **Esempio: Log Admin Action**

```typescript
async function logAdminAction(
  action: string,
  targetUserId?: string,
  targetTable?: string,
  details?: Record<string, any>
): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_admin_action', {
    _action: action,
    _target_user_id: targetUserId,
    _target_table: targetTable,
    _details: details
  });
  
  if (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
  
  return data; // Returns log UUID
}

// Usage
await logAdminAction(
  'USER_BANNED',
  targetUser.id,
  'profiles',
  { reason: 'spam', duration: '7d' }
);
```

---

## 🔐 Security Notes

### **✅ Best Practices Implementate**

1. **No Recursive RLS:** La funzione `has_role()` usa `SECURITY DEFINER` per bypassare RLS e evitare loop infiniti
2. **Separate Roles Table:** I ruoli NON sono su `profiles` o `auth.users` (previene privilege escalation)
3. **Audit Trail:** Ogni modifica ai ruoli viene loggata automaticamente in `admin_logs`
4. **Type-Safe:** RPC functions sono tipizzate in TypeScript per compile-time safety
5. **Granular Permissions:** Policies separate per SELECT/INSERT/UPDATE/DELETE

### **⚠️ Migrare Policies Esistenti**

Se hai tabelle che usano il vecchio sistema `(SELECT role FROM profiles ...)`, devi migrare le policy a `has_role()`:

**❌ VECCHIO (unsafe, recursive):**
```sql
CREATE POLICY "Admins can delete"
ON some_table
FOR DELETE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
```

**✅ NUOVO (safe, non-recursive):**
```sql
CREATE POLICY "Admins can delete"
ON some_table
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
```

---

## 📊 Database Schema Reference

### **Table: user_roles**
```
Column        | Type             | Description
--------------|------------------|----------------------------------
id            | uuid             | Primary key
user_id       | uuid             | FK to auth.users(id)
role          | app_role         | ENUM: admin, moderator, agent
assigned_by   | uuid             | FK to auth.users(id) - chi ha assegnato
assigned_at   | timestamptz      | Timestamp assegnazione
metadata      | jsonb            | Dati aggiuntivi (motivo, contesto, etc)
```

### **Table: admin_logs**
```
Column          | Type             | Description
----------------|------------------|----------------------------------
id              | uuid             | Primary key
admin_id        | uuid             | FK to auth.users(id) - chi ha eseguito
action          | text             | Nome azione (es. 'USER_BANNED')
target_user_id  | uuid             | FK to auth.users(id) - target
target_table    | text             | Tabella coinvolta
details         | jsonb            | Dettagli azione
ip_address      | inet             | IP dell'admin
user_agent      | text             | Browser dell'admin
created_at      | timestamptz      | Timestamp azione
```

---

## 🧪 Testing Checklist

Dopo aver completato lo setup:

- [ ] **Step 1:** Migrazione SQL eseguita senza errori
- [ ] **Step 2:** Ruolo admin assegnato al fondatore
- [ ] **Step 3:** `has_role()` ritorna `true` per fondatore
- [ ] **Step 4:** `current_user_role()` ritorna `'admin'`
- [ ] **Step 5:** `log_admin_action()` crea log correttamente
- [ ] **Step 6:** RLS policies bloccano accesso a utenti non-admin
- [ ] **Step 7:** Frontend può chiamare RPC senza errori TypeScript
- [ ] **Step 8:** Audit trail registra modifiche ai ruoli

---

## 🚨 Rollback Plan

Se qualcosa va storto, esegui questo per rimuovere il sistema:

```sql
-- ⚠️ WARNING: Questo rimuove TUTTO il sistema ruoli
DROP TRIGGER IF EXISTS on_user_role_change ON public.user_roles;
DROP FUNCTION IF EXISTS public.trigger_log_role_change();
DROP FUNCTION IF EXISTS public.log_admin_action(TEXT, UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.current_user_role();
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
```

---

## 📞 Support

Se incontri problemi durante lo setup:

1. Verifica che le tabelle siano state create: `\dt public.user_roles`
2. Verifica che le funzioni esistano: `\df public.has_role`
3. Controlla i log Supabase: Dashboard → Logs → Postgres
4. Testa con un utente non-admin per confermare RLS

**Next Steps:** Una volta completato lo setup, puoi aggiornare le policy esistenti su altre tabelle per usare `has_role()` invece del vecchio sistema.

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
