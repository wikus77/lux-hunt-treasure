-- ============================================================================
-- M1SSION™ REFERRAL SYSTEM - Bonus Invita Amico
-- SICURO: Non modifica tabelle esistenti, aggiunge solo nuove
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- 1. Tabella per tracciare i referral
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- Chi ha invitato
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- Chi è stato invitato
  referrer_reward INTEGER NOT NULL DEFAULT 50,  -- M1U per chi invita
  referred_reward INTEGER NOT NULL DEFAULT 50,  -- M1U per chi viene invitato
  status VARCHAR(20) DEFAULT 'pending',  -- pending, completed, cancelled
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utente può essere referito solo una volta
  UNIQUE(referred_id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_referred ON referral_rewards(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_status ON referral_rewards(status);

-- 2. Aggiungi colonna referral_code ai profiles (se non esiste)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);

-- 3. Funzione per generare codice referral unico
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
DECLARE
  v_code VARCHAR(10);
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Genera codice alfanumerico 8 caratteri
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
    
    -- Verifica unicità
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = v_code) INTO v_exists;
    
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$;

-- 4. Assegna referral code a utenti esistenti che non ce l'hanno
UPDATE profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- 5. Trigger per assegnare referral code ai nuovi utenti
CREATE OR REPLACE FUNCTION assign_referral_code_on_profile_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_assign_referral_code ON public.profiles;
CREATE TRIGGER trigger_assign_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_referral_code_on_profile_insert();

-- 6. Funzione per validare e registrare un referral
CREATE OR REPLACE FUNCTION apply_referral_code(
  p_referred_user_id UUID,
  p_referral_code VARCHAR(10)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_already_referred BOOLEAN;
  v_referrer_reward INTEGER := 50;
  v_referred_reward INTEGER := 50;
BEGIN
  -- Verifica che l'utente non sia già stato referito
  SELECT referred_by IS NOT NULL INTO v_already_referred
  FROM profiles WHERE id = p_referred_user_id;
  
  IF v_already_referred THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_referred',
      'message', 'Hai già utilizzato un codice referral'
    );
  END IF;
  
  -- Trova il referrer dal codice
  SELECT id INTO v_referrer_id
  FROM profiles WHERE referral_code = UPPER(p_referral_code);
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'invalid_code',
      'message', 'Codice referral non valido'
    );
  END IF;
  
  -- Non permettere auto-referral
  IF v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'self_referral',
      'message', 'Non puoi usare il tuo stesso codice'
    );
  END IF;
  
  -- Aggiorna il profilo dell'utente referito
  UPDATE profiles SET referred_by = v_referrer_id WHERE id = p_referred_user_id;
  
  -- Crea record referral
  INSERT INTO referral_rewards (
    referrer_id, referred_id, referrer_reward, referred_reward, status, completed_at
  ) VALUES (
    v_referrer_id, p_referred_user_id, v_referrer_reward, v_referred_reward, 'completed', NOW()
  );
  
  -- Assegna M1U al referrer
  PERFORM admin_credit_m1u(v_referrer_id, v_referrer_reward, 'referral_bonus_referrer');
  
  -- Assegna M1U al referred
  PERFORM admin_credit_m1u(p_referred_user_id, v_referred_reward, 'referral_bonus_referred');
  
  RETURN jsonb_build_object(
    'success', true,
    'referrer_reward', v_referrer_reward,
    'referred_reward', v_referred_reward,
    'message', 'Bonus referral applicato! +' || v_referred_reward || ' M1U!'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION apply_referral_code TO authenticated;

-- 7. Funzione per ottenere statistiche referral utente
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referral_code VARCHAR(10);
  v_total_referrals INTEGER;
  v_total_earned INTEGER;
BEGIN
  -- Ottieni codice referral
  SELECT referral_code INTO v_referral_code
  FROM profiles WHERE id = p_user_id;
  
  -- Conta referral completati
  SELECT COUNT(*), COALESCE(SUM(referrer_reward), 0)
  INTO v_total_referrals, v_total_earned
  FROM referral_rewards
  WHERE referrer_id = p_user_id AND status = 'completed';
  
  RETURN jsonb_build_object(
    'referral_code', v_referral_code,
    'total_referrals', v_total_referrals,
    'total_m1u_earned', v_total_earned,
    'reward_per_invite', 50
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_referral_stats TO authenticated;

-- 8. Aggiungi RLS per referral_rewards
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

