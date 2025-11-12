# 🎯 BATTLE SYSTEM - FASE 1 (Data Model Base)
## © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

---

## ✅ COMPLETATO (FASE 1 - Sicuro)

### 📁 Files Creati

1. **TypeScript Types**
   - `src/types/battle.ts` - Types per battle system
   - `src/hooks/useBattleSystem.ts` - Hook React per interagire con il sistema

### 🗄️ Migrations SQL da Eseguire

**IMPORTANTE**: Le seguenti migrations SQL sono **idempotenti** e sicure. NON toccano nessuna parte esistente della mappa.

#### Migration 1: Verifica (Opzionale)
```sql
-- File: supabase/migrations/20250112_battle_system_phase1_verification.sql
-- Verifica esistenza componenti prima di creare
```

#### Migration 2: Schema Base ⭐ **ESEGUI QUESTA**
```sql
-- File: supabase/migrations/20250112_battle_system_phase1_schema.sql
-- Crea tabelle: battle_sessions, battle_actions, user_arsenal, 
--               weapons_catalog, user_cooldowns
-- Include RLS policies, indici, triggers
-- Seed armi base: pulse_beam, emp_wave, missile
```

#### Migration 3: RPC Functions ⭐ **ESEGUI QUESTA**
```sql
-- File: supabase/migrations/20250112_battle_system_phase1_rpc.sql
-- Funzioni RPC:
-- - start_battle(defender_id, weapon_key, nonce)
-- - get_my_battles(status?, limit?)
-- - get_my_cooldowns()
-- - get_weapons_catalog()
-- - Helper: is_user_attackable(), has_active_cooldown(), generate_battle_seed()
```

---

## 📋 COME ESEGUIRE LE MIGRATIONS

### Opzione A: Via Supabase Dashboard (Consigliato)

1. Vai su **Supabase Dashboard** > **SQL Editor**
2. Copia il contenuto di `20250112_battle_system_phase1_schema.sql`
3. Esegui la query
4. Copia il contenuto di `20250112_battle_system_phase1_rpc.sql`
5. Esegui la query
6. ✅ Verifica output: dovresti vedere `NOTICE` con `✓` per ogni componente creato

### Opzione B: Via Lovable Migration Tool

1. Usa lo strumento migration tool in Lovable
2. Incolla il contenuto delle migrations
3. Esegui

---

## 🧪 TEST POST-MIGRATION

### 1. Verifica Tabelle Create

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'battle_sessions', 
    'battle_actions', 
    'user_arsenal', 
    'weapons_catalog', 
    'user_cooldowns'
  );
```

**Atteso**: 5 righe

### 2. Verifica RPC Functions

```sql
SELECT proname 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND proname IN (
    'start_battle',
    'get_my_battles',
    'get_my_cooldowns',
    'get_weapons_catalog',
    'is_user_attackable'
  );
```

**Atteso**: 5 righe

### 3. Verifica Catalogo Armi

```sql
SELECT key, name, power, m1u_cost, effect_key
FROM public.weapons_catalog;
```

**Atteso**: 3 armi base (pulse_beam, emp_wave, missile)

### 4. Verifica Realtime Publication

```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'battle_sessions';
```

**Atteso**: 1 riga

---

## 🎮 COME TESTARE IL SISTEMA (Client-side)

### Test 1: Recupera Catalogo Armi

```typescript
import { useBattleSystem } from '@/hooks/useBattleSystem';

function TestComponent() {
  const { getWeaponsCatalog } = useBattleSystem();
  
  useEffect(() => {
    getWeaponsCatalog().then(weapons => {
      console.log('Weapons:', weapons);
      // Atteso: [{ weapon_key: 'pulse_beam', ... }, ...]
    });
  }, []);
}
```

### Test 2: Verifica se Utente è Attackable

```typescript
const { isUserAttackable } = useBattleSystem();

// Sostituisci con UUID reale di un utente online
const targetUserId = 'uuid-here';
const canAttack = await isUserAttackable(targetUserId);
console.log('Can attack:', canAttack);
```

### Test 3: Inizia Attacco (Mockup)

```typescript
const { startAttack } = useBattleSystem();

// IMPORTANTE: Assicurati che:
// 1. Tu sia autenticato
// 2. Il defender sia online (in agent_locations)
// 3. Nessuna battaglia attiva per te o per il defender
const result = await startAttack(
  'defender-uuid-here',
  'pulse_beam'
);

console.log('Attack result:', result);
// Atteso: { success: true, session_id: '...', expires_at: '...', ... }
```

---

## ⚠️ LIMITAZIONI FASE 1

### ❌ NON IMPLEMENTATO (FASE 2):
- ✗ Integrazione economia M1U (user_wallet)
- ✗ Sistema difesa (`submit_defense`)
- ✗ Calcolo esito battaglia (RNG deterministico)
- ✗ Reward M1U/PE al vincitore
- ✗ Aggiornamento rank/reputation
- ✗ Notifiche push al difensore
- ✗ Finalizzazione batch battaglie scadute
- ✗ UI Battle HUD e animazioni

### ✅ IMPLEMENTATO (FASE 1):
- ✓ Data model completo (tabelle + RLS)
- ✓ RPC `start_battle` base (senza economia)
- ✓ RPC utility (get_my_battles, cooldowns, catalog)
- ✓ Verifica attackable (online, no stealth, no busy)
- ✓ Cooldown armi
- ✓ Indici anti-concorrenza (una battaglia attiva per utente)
- ✓ Seed audit deterministico (per futura verifica esiti)
- ✓ Hook React `useBattleSystem`
- ✓ TypeScript types

---

## 🔐 SICUREZZA

### RLS Policies Attive
- ✅ Users possono vedere solo le proprie battaglie
- ✅ Solo RPC può inserire/aggiornare battle_sessions
- ✅ Solo RPC può inserire battle_actions
- ✅ Users vedono solo il proprio inventario
- ✅ Tutti vedono catalogo armi (enabled=true)

### Anti-Abuso Implementato
- ✅ Indice unico: un attaccante → una battaglia attiva
- ✅ Indice unico: un difensore → una battaglia attiva
- ✅ Cooldown armi (impedisce spam)
- ✅ Nonce unico per sessione (anti-replay)
- ✅ Constraint: attacker ≠ defender
- ✅ Verifica attackable (online, no stealth, no busy)

---

## 📊 STRUTTURA DATABASE

### Tabella: `battle_sessions`
```sql
id              uuid PRIMARY KEY
attacker_id     uuid → auth.users
defender_id     uuid → auth.users
status          text ('await_defense' | 'resolved' | 'cancelled')
started_at      timestamptz
expires_at      timestamptz (started_at + 60s)
ended_at        timestamptz
winner_id       uuid → auth.users
weapon_key      text
defense_key     text
audit_seed_hash text (per audit RNG)
metadata        jsonb
version         integer
```

### Tabella: `battle_actions`
```sql
id                uuid PRIMARY KEY
session_id        uuid → battle_sessions
user_id           uuid → auth.users
role              text ('attacker' | 'defender')
action_type       text ('attack' | 'defend')
item_key          text
energy_cost_m1u   numeric
nonce             text (UNIQUE per session)
result            jsonb
```

### Tabella: `user_arsenal`
```sql
id          uuid PRIMARY KEY
user_id     uuid → auth.users
item_type   text ('weapon' | 'defense' | 'stealth')
item_key    text
quantity    integer (≥ 0)
UNIQUE (user_id, item_type, item_key)
```

### Tabella: `weapons_catalog`
```sql
id            uuid PRIMARY KEY
key           text UNIQUE
name          text
description   text
power         numeric (> 0)
m1u_cost      numeric (≥ 0)
cooldown_sec  integer (≥ 0)
effect_key    text (per animazioni FX)
min_rank      integer
enabled       boolean
```

### Tabella: `user_cooldowns`
```sql
id            uuid PRIMARY KEY
user_id       uuid → auth.users
cooldown_key  text
until_ts      timestamptz
UNIQUE (user_id, cooldown_key)
```

---

## 🚀 PROSSIMI PASSI (FASE 2)

Quando sarai pronto per FASE 2, fornirò:
1. File `user_wallet` structure
2. Sistema rank/reputation esistente
3. Sistema PE (Pulse Energy)
4. Pipeline notifiche push esistente

Poi implementeremo:
- ✅ Integrazione economia completa
- ✅ RPC `submit_defense` con calcolo esito
- ✅ RPC `finalize_expired` (cron)
- ✅ Reward M1U/PE al vincitore
- ✅ Aggiornamento rank/reputation/leaderboard
- ✅ Notifiche push (attack_started, defense_needed, battle_resolved)
- ✅ Battle HUD UI + animazioni 3D/2D

---

## 🛡️ GARANZIE PALETTI RISPETTATI

### ✅ NON TOCCATO:
- ✅ Buzz / Buzz Map / geolocalizzazione globale
- ✅ Notifiche push (SW/VAPID/FCM/APNs pipeline)
- ✅ Stripe/pagamenti
- ✅ Tasto "ON M1SSION"
- ✅ fetch-interceptor, CORS globali, norah-chat-v2
- ✅ UnifiedHeader.tsx e BottomNavigation.tsx
- ✅ Pill in Home, Buzz, /map-3d-tiler
- ✅ Marker rossi agente e marker rewards
- ✅ NO hard-code chiavi/URL
- ✅ NO dipendenze proprietarie Lovable

### ✅ MAPPA FUNZIONANTE:
- La mappa `/map-3d-tiler` rimane **pienamente funzionante**
- Zero modifiche ai componenti mappa esistenti
- Zero modifiche ai layer markers
- Zero rischio di regressioni

---

## 📞 SUPPORT

Se riscontri problemi:
1. Verifica output migrations (NOTICE con ✓)
2. Controlla console browser per errori
3. Esegui test SQL queries sopra
4. Contatta per passare a FASE 2

---

**© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™**
