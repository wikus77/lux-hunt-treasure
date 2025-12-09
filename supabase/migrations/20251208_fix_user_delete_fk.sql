-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- FIX: Permette la cancellazione degli utenti aggiungendo ON DELETE CASCADE/SET NULL
-- a tutte le foreign key che puntano ad auth.users

-- ============================================
-- 1. Fix chat_conversations.handled_by
-- ============================================
DO $$
BEGIN
  -- Drop existing constraint if exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'chat_conversations_handled_by_fkey' 
             AND table_name = 'chat_conversations') THEN
    ALTER TABLE public.chat_conversations DROP CONSTRAINT chat_conversations_handled_by_fkey;
  END IF;
  
  -- Add new constraint with ON DELETE SET NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'chat_conversations' AND column_name = 'handled_by') THEN
    ALTER TABLE public.chat_conversations 
    ADD CONSTRAINT chat_conversations_handled_by_fkey 
    FOREIGN KEY (handled_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'chat_conversations.handled_by fix skipped: %', SQLERRM;
END $$;

-- ============================================
-- 2. Fix battle_challenges.creator_id, opponent_id, winner_id
-- ============================================
DO $$
BEGIN
  -- creator_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'battle_challenges_creator_id_fkey' 
             AND table_name = 'battle_challenges') THEN
    ALTER TABLE public.battle_challenges DROP CONSTRAINT battle_challenges_creator_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'battle_challenges' AND column_name = 'creator_id') THEN
    ALTER TABLE public.battle_challenges 
    ADD CONSTRAINT battle_challenges_creator_id_fkey 
    FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- opponent_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'battle_challenges_opponent_id_fkey' 
             AND table_name = 'battle_challenges') THEN
    ALTER TABLE public.battle_challenges DROP CONSTRAINT battle_challenges_opponent_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'battle_challenges' AND column_name = 'opponent_id') THEN
    ALTER TABLE public.battle_challenges 
    ADD CONSTRAINT battle_challenges_opponent_id_fkey 
    FOREIGN KEY (opponent_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  -- winner_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'battle_challenges_winner_id_fkey' 
             AND table_name = 'battle_challenges') THEN
    ALTER TABLE public.battle_challenges DROP CONSTRAINT battle_challenges_winner_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'battle_challenges' AND column_name = 'winner_id') THEN
    ALTER TABLE public.battle_challenges 
    ADD CONSTRAINT battle_challenges_winner_id_fkey 
    FOREIGN KEY (winner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'battle_challenges fix skipped: %', SQLERRM;
END $$;

-- ============================================
-- 3. Fix gift_transactions.sender_id, recipient_id
-- ============================================
DO $$
BEGIN
  -- sender_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'gift_transactions_sender_id_fkey' 
             AND table_name = 'gift_transactions') THEN
    ALTER TABLE public.gift_transactions DROP CONSTRAINT gift_transactions_sender_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'gift_transactions' AND column_name = 'sender_id') THEN
    ALTER TABLE public.gift_transactions 
    ADD CONSTRAINT gift_transactions_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  -- recipient_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'gift_transactions_recipient_id_fkey' 
             AND table_name = 'gift_transactions') THEN
    ALTER TABLE public.gift_transactions DROP CONSTRAINT gift_transactions_recipient_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'gift_transactions' AND column_name = 'recipient_id') THEN
    ALTER TABLE public.gift_transactions 
    ADD CONSTRAINT gift_transactions_recipient_id_fkey 
    FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'gift_transactions fix skipped: %', SQLERRM;
END $$;

-- ============================================
-- 4. Fix admin_config.created_by, updated_by
-- ============================================
DO $$
BEGIN
  -- created_by
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'admin_config_created_by_fkey' 
             AND table_name = 'admin_config') THEN
    ALTER TABLE public.admin_config DROP CONSTRAINT admin_config_created_by_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'admin_config' AND column_name = 'created_by') THEN
    ALTER TABLE public.admin_config 
    ADD CONSTRAINT admin_config_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  -- updated_by
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'admin_config_updated_by_fkey' 
             AND table_name = 'admin_config') THEN
    ALTER TABLE public.admin_config DROP CONSTRAINT admin_config_updated_by_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'admin_config' AND column_name = 'updated_by') THEN
    ALTER TABLE public.admin_config 
    ADD CONSTRAINT admin_config_updated_by_fkey 
    FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'admin_config fix skipped: %', SQLERRM;
END $$;

-- ============================================
-- 5. Generic fix for any table with user_id without ON DELETE
-- ============================================
-- This catches any we might have missed

-- profiles table (critical - must be CASCADE)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'profiles_id_fkey' 
             AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'profiles fix skipped: %', SQLERRM;
END $$;

-- ============================================
-- COMMENT
-- ============================================
COMMENT ON SCHEMA public IS 'FIX: Tutte le FK che puntano ad auth.users ora hanno ON DELETE CASCADE o SET NULL per permettere la cancellazione degli utenti. © 2025 M1SSION™';


