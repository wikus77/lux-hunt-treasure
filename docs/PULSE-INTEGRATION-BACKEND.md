# 🗄️ Pulse Energy + Rank System — Backend Integration Guide

**M1SSION™ — Supabase Database Schema**  
**© 2025 Joseph MULÉ – ALL RIGHTS RESERVED – NIYVORA KFT™**

---

## 📋 Overview

Migrazione **additive e reversibile** da XP → Pulse Energy (PE) con introduzione gerarchia ufficiale v2.0.

**Obiettivi:**
1. Catalogo gradi (`agent_ranks`) con soglie PE
2. Estensione `profiles` con `pulse_energy` e `rank_id`
3. Storico promozioni (`rank_history`)
4. Funzione `award_pulse_energy()` con auto-rank-up
5. Aggiornamento trigger XP esistenti
6. Protezione MCP (SRC-∞)

**Principio guida:** Mantenere `user_xp` per retrocompatibilità, sincronizzato con `profiles.pulse_energy`.

---

## 🏗️ Schema Changes

### 1. Tabella: `agent_ranks`

**DDL:**
```sql
CREATE TABLE public.agent_ranks (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,          -- es. "AG-01", "SRC-∞"
  name_en TEXT NOT NULL,              -- "Recruit", "Master"
  name_it TEXT NOT NULL,              -- "Recluta", "Maestro"
  description TEXT,
  pe_min INT NOT NULL,                -- Soglia minima PE
  pe_max INT,                         -- Soglia massima (NULL per grado massimo)
  color TEXT NOT NULL,                -- Hex color (es. "#00ff00")
  symbol TEXT NOT NULL,               -- Emoji o char (es. "🎖️")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_ranks_pe_range ON agent_ranks (pe_min, pe_max);
```

**Seed Data (Gerarchia v2.0):**
```sql
INSERT INTO agent_ranks (code, name_en, name_it, description, pe_min, pe_max, color, symbol) VALUES
('AG-01', 'Recruit', 'Recluta', 'Nuovo agente in addestramento', 0, 999, '#808080', '🎖️'),
('AG-02', 'Field Agent', 'Agente sul Campo', 'Operativo base certificato', 1000, 2499, '#4A90E2', '🔰'),
('OP-03', 'Operative', 'Operativo', 'Agente esperto con missioni completate', 2500, 4999, '#50C878', '⚡'),
('SP-04', 'Specialist', 'Specialista', 'Esperto in tecniche avanzate', 5000, 9999, '#9370DB', '🎯'),
('SH-05', 'Shadow Operative', 'Operativo Ombra', 'Elite nell''infiltrazione', 10000, 19999, '#2F4F4F', '👁️'),
('EA-06', 'Elite Agent', 'Agente Elite', 'Top 5% degli agenti', 20000, 39999, '#FFD700', '⭐'),
('CM-07', 'Commander', 'Comandante', 'Leader di squadre operative', 40000, 79999, '#FF6347', '🎖️'),
('DR-08', 'Director', 'Direttore', 'Gestione strategica nazionale', 80000, 149999, '#8B0000', '🏆'),
('GM-09', 'Grand Master', 'Gran Maestro', 'Leggenda vivente del network', 150000, 299999, '#4B0082', '👑'),
('M1-10', 'Master', 'Maestro', 'Vertice della gerarchia', 300000, NULL, '#000080', '💎'),
('SRC-∞', 'MCP - Master Control Program', 'MCP - Programma di Controllo Principale', 'Grado riservato a Joseph Mulé', 999999999, NULL, '#FF0000', '🔺');
```

**RLS Policies:**
```sql
-- Public read
ALTER TABLE agent_ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY agent_ranks_public_read ON agent_ranks
  FOR SELECT USING (true);

-- Admin write only
CREATE POLICY agent_ranks_admin_write ON agent_ranks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 2. Estensione: `profiles`

**DDL:**
```sql
ALTER TABLE public.profiles
ADD COLUMN pulse_energy INT DEFAULT 0 NOT NULL,
ADD COLUMN rank_id INT REFERENCES agent_ranks(id),
ADD COLUMN rank_updated_at TIMESTAMPTZ;

CREATE INDEX idx_profiles_pulse_energy ON profiles (pulse_energy DESC);
CREATE INDEX idx_profiles_rank_id ON profiles (rank_id);
```

**Inizializzazione PE da XP esistente:**
```sql
-- Sync iniziale: PE = XP totale
UPDATE profiles p
SET pulse_energy = COALESCE(
  (SELECT total_xp FROM user_xp WHERE user_id = p.id),
  0
);

-- Calcola rank_id iniziale
UPDATE profiles p
SET rank_id = (
  SELECT id FROM agent_ranks
  WHERE pe_min <= p.pulse_energy
    AND (pe_max IS NULL OR p.pulse_energy < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1
),
rank_updated_at = NOW()
WHERE rank_id IS NULL;
```

---

### 3. Tabella: `rank_history`

**DDL:**
```sql
CREATE TABLE public.rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_rank_id INT REFERENCES agent_ranks(id),
  new_rank_id INT NOT NULL REFERENCES agent_ranks(id),
  delta_pe INT NOT NULL,              -- PE guadagnato che ha causato rank-up
  reason TEXT NOT NULL,               -- 'buzz', 'mission', 'referral', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rank_history_user_id ON rank_history (user_id, created_at DESC);
CREATE INDEX idx_rank_history_new_rank ON rank_history (new_rank_id);
```

**RLS Policies:**
```sql
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY rank_history_self_read ON rank_history
  FOR SELECT USING (auth.uid() = user_id);

-- Only service_role can insert
CREATE POLICY rank_history_service_insert ON rank_history
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role') = 'service_role'
  );
```

---

## ⚙️ Functions

### 1. Function: `award_pulse_energy`

**Responsabilità:**
- Incrementa PE utente
- Sincronizza `user_xp.total_xp` (retrocompat)
- Ricalcola rank; se cambia → log in `rank_history`
- Ritorna JSON con stato pre/post

**DDL:**
```sql
CREATE OR REPLACE FUNCTION award_pulse_energy(
  p_user_id UUID,
  p_delta_pe INT,
  p_reason TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_old_pe INT;
  v_new_pe INT;
  v_old_rank_id INT;
  v_new_rank_id INT;
  v_rank_changed BOOLEAN := FALSE;
BEGIN
  -- Lock profile row
  SELECT pulse_energy, rank_id INTO v_old_pe, v_old_rank_id
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % not found', p_user_id;
  END IF;

  -- Update PE
  v_new_pe := v_old_pe + p_delta_pe;

  UPDATE profiles
  SET pulse_energy = v_new_pe,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Sync user_xp (backward compat)
  UPDATE user_xp
  SET total_xp = v_new_pe,
      xp_since_reward = total_xp + p_delta_pe
  WHERE user_id = p_user_id;

  -- Recompute rank
  SELECT id INTO v_new_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_new_pe
    AND (pe_max IS NULL OR v_new_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  -- Rank changed?
  IF v_new_rank_id IS DISTINCT FROM v_old_rank_id THEN
    v_rank_changed := TRUE;

    UPDATE profiles
    SET rank_id = v_new_rank_id,
        rank_updated_at = NOW()
    WHERE id = p_user_id;

    -- Log history
    INSERT INTO rank_history (user_id, old_rank_id, new_rank_id, delta_pe, reason, metadata)
    VALUES (p_user_id, v_old_rank_id, v_new_rank_id, p_delta_pe, p_reason, p_metadata);
  END IF;

  -- Return result
  RETURN jsonb_build_object(
    'success', TRUE,
    'old_pe', v_old_pe,
    'new_pe', v_new_pe,
    'delta_pe', p_delta_pe,
    'rank_changed', v_rank_changed,
    'old_rank_id', v_old_rank_id,
    'new_rank_id', v_new_rank_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage:**
```sql
SELECT award_pulse_energy(
  '<user-uuid>',
  15,                -- +15 PE
  'buzz',            -- reason
  '{"location": "Milano"}'::jsonb
);
```

---

### 2. Function: `recompute_rank` (Utility)

**Responsabilità:** Ricalcola rank_id per un utente (idempotente)

**DDL:**
```sql
CREATE OR REPLACE FUNCTION recompute_rank(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_pe INT;
  v_correct_rank_id INT;
BEGIN
  SELECT pulse_energy INTO v_current_pe
  FROM profiles
  WHERE id = p_user_id;

  SELECT id INTO v_correct_rank_id
  FROM agent_ranks
  WHERE pe_min <= v_current_pe
    AND (pe_max IS NULL OR v_current_pe < pe_max)
  ORDER BY pe_min DESC
  LIMIT 1;

  UPDATE profiles
  SET rank_id = v_correct_rank_id,
      rank_updated_at = NOW()
  WHERE id = p_user_id
    AND rank_id IS DISTINCT FROM v_correct_rank_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 Trigger Updates

### Sostituire logiche XP con `award_pulse_energy()`

**1. Buzz (ex +15 XP):**
```sql
-- Sostituisci trigger handle_buzz_xp()
CREATE OR REPLACE FUNCTION handle_buzz_xp_v2()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_pulse_energy(
    NEW.user_id,
    15,
    'buzz',
    jsonb_build_object('buzz_id', NEW.id, 'location', NEW.location)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ricrea trigger
DROP TRIGGER IF EXISTS buzz_awards_xp ON buzz_activations;
CREATE TRIGGER buzz_awards_xp
  AFTER INSERT ON buzz_activations
  FOR EACH ROW
  EXECUTE FUNCTION handle_buzz_xp_v2();
```

**2. Buzz Map (ex +10 XP):**
```sql
CREATE OR REPLACE FUNCTION handle_buzz_map_xp_v2()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_pulse_energy(
    NEW.user_id,
    10,
    'buzz_map',
    jsonb_build_object('map_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS buzz_map_awards_xp ON buzz_map_activations;
CREATE TRIGGER buzz_map_awards_xp
  AFTER INSERT ON buzz_map_activations
  FOR EACH ROW
  EXECUTE FUNCTION handle_buzz_map_xp_v2();
```

**3. Referral (ex +25 XP):**
```sql
CREATE OR REPLACE FUNCTION handle_referral_xp_v2()
RETURNS TRIGGER AS $$
DECLARE
  v_inviter_id UUID;
BEGIN
  SELECT id INTO v_inviter_id
  FROM profiles
  WHERE agent_code = NEW.invited_by_code;

  IF FOUND THEN
    PERFORM award_pulse_energy(
      v_inviter_id,
      25,
      'referral',
      jsonb_build_object('invited_user_id', NEW.id, 'referral_code', NEW.invited_by_code)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS referral_awards_xp ON profiles;
CREATE TRIGGER referral_awards_xp
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.invited_by_code IS NOT NULL)
  EXECUTE FUNCTION handle_referral_xp_v2();
```

---

## 🔒 Protezione MCP (SRC-∞)

**Trigger BEFORE UPDATE su `profiles.rank_id`:**
```sql
CREATE OR REPLACE FUNCTION prevent_mcp_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_mcp_rank_id INT;
  v_is_joseph BOOLEAN;
BEGIN
  -- Get MCP rank ID
  SELECT id INTO v_mcp_rank_id
  FROM agent_ranks
  WHERE code = 'SRC-∞';

  -- Check if trying to assign MCP rank
  IF NEW.rank_id = v_mcp_rank_id THEN
    -- Allow only for Joseph (admin with specific email or user_id)
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = NEW.id
        AND role = 'admin'
        AND email = 'wikus77@hotmail.it'
    ) INTO v_is_joseph;

    IF NOT v_is_joseph THEN
      RAISE EXCEPTION 'MCP rank (SRC-∞) is reserved for Joseph Mulé only';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_mcp_protection
  BEFORE UPDATE OF rank_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_mcp_assignment();
```

---

## 📊 Event Map (PE Award)

| Evento | PE | Reason Code | Metadata Suggerito |
|--------|----|--------------|--------------------|
| Buzz attivato | +15 | `buzz` | `{buzz_id, location}` |
| Buzz Map attivato | +10 | `buzz_map` | `{map_id}` |
| Referral completato | +25 | `referral` | `{invited_user_id, referral_code}` |
| Daily login | +5 | `daily_login` | `{streak_days}` |
| Clue risolto | +10 | `clue` | `{clue_id, mission_id}` |
| Mission completata | +100 | `mission_complete` | `{mission_id, duration_mins}` |
| QR Guerrilla scan | +5-50 | `qr_guerrilla` | `{qr_code, rarity}` |
| Evento live partecipato | +30 | `live_event` | `{event_id, location}` |

---

## 🧪 Testing SQL

### Test 1: Award PE + Rank Up
```sql
-- Setup: user con 2450 PE (AG-02 Field Agent)
UPDATE profiles SET pulse_energy = 2450, rank_id = 2 WHERE id = '<user-uuid>';

-- Award +100 PE → dovrebbe rank-up a OP-03 (Operative)
SELECT award_pulse_energy('<user-uuid>', 100, 'test', '{}'::jsonb);

-- Verifica
SELECT pulse_energy, rank_id FROM profiles WHERE id = '<user-uuid>';
-- Expected: pulse_energy=2550, rank_id=3

SELECT * FROM rank_history WHERE user_id = '<user-uuid>' ORDER BY created_at DESC LIMIT 1;
-- Expected: old_rank_id=2, new_rank_id=3, delta_pe=100
```

### Test 2: MCP Protection
```sql
-- Try to assign MCP to non-Joseph user (should fail)
UPDATE profiles SET rank_id = 11 WHERE email != 'wikus77@hotmail.it';
-- Expected: ERROR: MCP rank (SRC-∞) is reserved for Joseph Mulé only
```

### Test 3: Retrocompat (user_xp sync)
```sql
-- Award PE
SELECT award_pulse_energy('<user-uuid>', 50, 'test', '{}'::jsonb);

-- Check user_xp.total_xp is synced
SELECT total_xp FROM user_xp WHERE user_id = '<user-uuid>';
-- Expected: total_xp = profiles.pulse_energy
```

---

## 📦 Migration Files

**Ordine di esecuzione:**
1. `20251031_001_create_agent_ranks.sql` — Crea tabella + seed
2. `20251031_002_extend_profiles_with_rank.sql` — Aggiungi colonne + indici
3. `20251031_003_create_rank_history.sql` — Tabella storico + RLS
4. `20251031_004_create_award_pulse_energy_function.sql` — Funzione award + recompute
5. `20251031_005_update_xp_triggers_to_pe.sql` — Aggiorna trigger Buzz/Map/Referral
6. `20251031_006_mcp_protection_trigger.sql` — Protezione MCP

**Rollback:** Ogni migrazione deve avere `DROP IF EXISTS` per oggetti creati.

---

## 🚨 SAFETY COMPLIANCE

### ✅ Non Toccati
- Logiche Buzz/Map (solo aggiunto PE award)
- Tabelle geolocalizzazione
- Push notifications
- Norah AI
- Stripe webhooks
- Map markers

### ✅ Retrocompatibilità
- `user_xp.total_xp` sempre sincronizzato con `profiles.pulse_energy`
- RPC `get_user_xp_status()` continua a funzionare
- Frontend può usare `useXpSystem()` fino a migrazione completa

---

**Status:** 🟡 Ready for Staging Test  
**Version:** 1.0.0  
**Last Updated:** 2025-10-31

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
