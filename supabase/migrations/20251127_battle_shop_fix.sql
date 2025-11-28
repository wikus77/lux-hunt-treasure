-- =====================================================================
-- BATTLE SHOP FIX - Create purchase_battle_item RPC
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

-- 1) Ensure user_m1_units_events table has metadata column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_m1_units_events' 
    AND column_name = 'metadata'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.user_m1_units_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    ALTER TABLE public.user_m1_units_events ENABLE ROW LEVEL SECURITY;
    
    CREATE INDEX IF NOT EXISTS idx_user_m1_units_events_user_id 
      ON public.user_m1_units_events(user_id);
  ELSE
    -- Just add the column if table exists but column doesn't
    BEGIN
      ALTER TABLE public.user_m1_units_events 
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Column might already exist
    END;
  END IF;
END $$;

-- 2) Create battle_items catalog table if not exists
CREATE TABLE IF NOT EXISTS public.battle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('weapon', 'defense')),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_key TEXT DEFAULT 'default',
  base_price_m1u INTEGER NOT NULL DEFAULT 100,
  power INTEGER NOT NULL DEFAULT 100,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  min_rank INTEGER DEFAULT 0,
  max_stack INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Create user_battle_items inventory table if not exists
CREATE TABLE IF NOT EXISTS public.user_battle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.battle_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.user_battle_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_battle_items
DROP POLICY IF EXISTS "Users can view own battle items" ON public.user_battle_items;
CREATE POLICY "Users can view own battle items"
  ON public.user_battle_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own battle items" ON public.user_battle_items;
CREATE POLICY "Users can insert own battle items"
  ON public.user_battle_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own battle items" ON public.user_battle_items;
CREATE POLICY "Users can update own battle items"
  ON public.user_battle_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4) Seed some default battle items
INSERT INTO public.battle_items (type, code, name, description, base_price_m1u, power, rarity, max_stack) VALUES
  ('weapon', 'BASIC_MISSILE', 'Basic Missile', 'Standard attack missile with moderate damage', 100, 100, 'common', 10),
  ('weapon', 'ADVANCED_MISSILE', 'Advanced Missile', 'Enhanced missile with improved tracking', 300, 150, 'rare', 5),
  ('weapon', 'PLASMA_CANNON', 'Plasma Cannon', 'High-energy plasma weapon with devastating power', 1000, 300, 'legendary', 3),
  ('weapon', 'EMP_BLAST', 'EMP Blast', 'Electromagnetic pulse that disrupts defenses', 500, 200, 'epic', 5),
  ('defense', 'BASIC_SHIELD', 'Basic Shield', 'Standard defensive shield', 100, 100, 'common', 10),
  ('defense', 'ADVANCED_SHIELD', 'Advanced Shield', 'Reinforced shield with extended duration', 300, 150, 'rare', 5),
  ('defense', 'QUANTUM_BARRIER', 'Quantum Barrier', 'Ultimate protection field', 1000, 300, 'legendary', 3),
  ('defense', 'STEALTH_CLOAK', 'Stealth Cloak', 'Temporary invisibility from attacks', 500, 200, 'epic', 5)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price_m1u = EXCLUDED.base_price_m1u,
  power = EXCLUDED.power,
  rarity = EXCLUDED.rarity;

-- 5) Create list_available_battle_items RPC
CREATE OR REPLACE FUNCTION public.list_available_battle_items()
RETURNS TABLE (
  item_id UUID,
  type TEXT,
  code TEXT,
  name TEXT,
  description TEXT,
  icon_key TEXT,
  base_price_m1u INTEGER,
  power INTEGER,
  rarity TEXT,
  min_rank INTEGER,
  max_stack INTEGER,
  is_owned BOOLEAN,
  owned_quantity INTEGER,
  is_equipped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    bi.id AS item_id,
    bi.type,
    bi.code,
    bi.name,
    bi.description,
    bi.icon_key,
    bi.base_price_m1u,
    bi.power,
    bi.rarity,
    bi.min_rank,
    bi.max_stack,
    COALESCE(ubi.id IS NOT NULL, false) AS is_owned,
    COALESCE(ubi.quantity, 0) AS owned_quantity,
    COALESCE(ubi.is_equipped, false) AS is_equipped
  FROM public.battle_items bi
  LEFT JOIN public.user_battle_items ubi 
    ON ubi.item_id = bi.id AND ubi.user_id = v_user_id
  WHERE bi.is_active = true
  ORDER BY bi.rarity DESC, bi.power DESC;
END;
$$;

-- 6) Create purchase_battle_item RPC
CREATE OR REPLACE FUNCTION public.purchase_battle_item(
  p_item_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_item RECORD;
  v_current_balance INTEGER;
  v_total_cost INTEGER;
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Validate user
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get item details
  SELECT * INTO v_item FROM public.battle_items WHERE id = p_item_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found or unavailable');
  END IF;

  -- Calculate total cost
  v_total_cost := v_item.base_price_m1u * p_quantity;

  -- Get user's current M1U balance (try both tables)
  SELECT COALESCE(p.m1_units, 0) INTO v_current_balance
  FROM public.profiles p
  WHERE p.id = v_user_id;

  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
  END IF;

  -- Check balance
  IF v_current_balance < v_total_cost THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Insufficient M1U. Need %s but have %s', v_total_cost, v_current_balance)
    );
  END IF;

  -- Check current quantity
  SELECT COALESCE(quantity, 0) INTO v_current_quantity
  FROM public.user_battle_items
  WHERE user_id = v_user_id AND item_id = p_item_id;

  IF v_current_quantity IS NULL THEN
    v_current_quantity := 0;
  END IF;

  v_new_quantity := v_current_quantity + p_quantity;

  -- Check max stack
  IF v_new_quantity > v_item.max_stack THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Max stack reached (%s/%s)', v_current_quantity, v_item.max_stack)
    );
  END IF;

  -- Deduct M1U from profiles
  UPDATE public.profiles
  SET m1_units = m1_units - v_total_cost,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Add/Update inventory
  INSERT INTO public.user_battle_items (user_id, item_id, quantity)
  VALUES (v_user_id, p_item_id, p_quantity)
  ON CONFLICT (user_id, item_id) 
  DO UPDATE SET 
    quantity = user_battle_items.quantity + p_quantity,
    purchased_at = NOW();

  -- Log transaction (skip if table doesn't exist properly)
  BEGIN
    INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
    VALUES (
      v_user_id,
      -v_total_cost,
      'battle_item_purchase',
      jsonb_build_object(
        'item_id', p_item_id,
        'item_code', v_item.code,
        'item_name', v_item.name,
        'quantity', p_quantity,
        'unit_price', v_item.base_price_m1u,
        'total_cost', v_total_cost
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log failed but continue (non-critical)
    RAISE NOTICE 'M1U event log failed: %', SQLERRM;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'item_code', v_item.code,
    'item_name', v_item.name,
    'quantity_purchased', p_quantity,
    'total_cost', v_total_cost,
    'new_balance', v_current_balance - v_total_cost
  );
END;
$$;

-- 7) Create get_user_battle_inventory RPC
CREATE OR REPLACE FUNCTION public.get_user_battle_inventory()
RETURNS TABLE (
  inventory_id UUID,
  item_id UUID,
  type TEXT,
  code TEXT,
  name TEXT,
  description TEXT,
  icon_key TEXT,
  power INTEGER,
  rarity TEXT,
  quantity INTEGER,
  is_equipped BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    ubi.id AS inventory_id,
    bi.id AS item_id,
    bi.type,
    bi.code,
    bi.name,
    bi.description,
    bi.icon_key,
    bi.power,
    bi.rarity,
    ubi.quantity,
    ubi.is_equipped
  FROM public.user_battle_items ubi
  JOIN public.battle_items bi ON bi.id = ubi.item_id
  WHERE ubi.user_id = v_user_id AND ubi.quantity > 0
  ORDER BY bi.type, bi.rarity DESC, bi.power DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.list_available_battle_items() TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_battle_item(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_battle_inventory() TO authenticated;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

