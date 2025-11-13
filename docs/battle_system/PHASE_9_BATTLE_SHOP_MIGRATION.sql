-- ============================================================================
-- PHASE 9 — BATTLE WEAPON & DEFENSE SHOP SCHEMA
-- M1SSION™ TRON Battle System
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- ⚠️ INSTRUCTIONS:
-- This migration must be run manually in Supabase SQL Editor
-- Do NOT apply automatically via Lovable deployment

-- ============================================================================
-- 1. BATTLE ITEMS CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.battle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('weapon', 'defense')),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_key TEXT NOT NULL DEFAULT 'sword',
  base_price_m1u INTEGER NOT NULL CHECK (base_price_m1u >= 0),
  power INTEGER NOT NULL DEFAULT 100 CHECK (power >= 0),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  min_rank INTEGER NOT NULL DEFAULT 0 CHECK (min_rank >= 0),
  max_stack INTEGER NOT NULL DEFAULT 99 CHECK (max_stack > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_battle_items_type ON public.battle_items(type);
CREATE INDEX IF NOT EXISTS idx_battle_items_active ON public.battle_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_battle_items_rarity ON public.battle_items(rarity);

-- RLS for battle_items
ALTER TABLE public.battle_items ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read active items
CREATE POLICY "battle_items_read_active"
  ON public.battle_items
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Only service_role can modify items
CREATE POLICY "battle_items_admin_all"
  ON public.battle_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. USER BATTLE ITEMS INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_battle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.battle_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_battle_items_user ON public.user_battle_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_battle_items_item ON public.user_battle_items(item_id);
CREATE INDEX IF NOT EXISTS idx_user_battle_items_equipped ON public.user_battle_items(user_id, is_equipped) WHERE is_equipped = true;

-- RLS for user_battle_items
ALTER TABLE public.user_battle_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own items
CREATE POLICY "user_battle_items_select_own"
  ON public.user_battle_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can update their own items (equip/unequip, metadata)
CREATE POLICY "user_battle_items_update_own"
  ON public.user_battle_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role can do anything
CREATE POLICY "user_battle_items_service_all"
  ON public.user_battle_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 3. RPC FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 list_available_battle_items()
-- Returns catalog items with user ownership info
-- ----------------------------------------------------------------------------

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
SET search_path = public
AS $$
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
    (ubi.id IS NOT NULL) AS is_owned,
    COALESCE(ubi.quantity, 0) AS owned_quantity,
    COALESCE(ubi.is_equipped, false) AS is_equipped
  FROM 
    public.battle_items bi
  LEFT JOIN 
    public.user_battle_items ubi 
    ON bi.id = ubi.item_id AND ubi.user_id = auth.uid()
  WHERE 
    bi.is_active = true
  ORDER BY 
    bi.type, bi.rarity DESC, bi.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_available_battle_items() TO authenticated;

-- ----------------------------------------------------------------------------
-- 3.2 purchase_battle_item(p_item_id UUID, p_quantity INT)
-- Purchase item using M1U balance (transactional)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.purchase_battle_item(
  p_item_id UUID,
  p_quantity INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_item RECORD;
  v_current_balance INTEGER;
  v_current_quantity INTEGER;
  v_total_cost INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: must be authenticated'
    );
  END IF;

  -- Validate quantity
  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid quantity: must be positive'
    );
  END IF;

  -- Get item details
  SELECT * INTO v_item
  FROM public.battle_items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Item not found or not available'
    );
  END IF;

  -- Calculate total cost
  v_total_cost := v_item.base_price_m1u * p_quantity;

  -- Get current M1U balance
  SELECT balance INTO v_current_balance
  FROM public.user_m1_units
  WHERE user_id = v_user_id;

  IF v_current_balance IS NULL THEN
    -- Initialize M1U account if doesn't exist
    INSERT INTO public.user_m1_units (user_id, balance)
    VALUES (v_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_current_balance := 0;
  END IF;

  -- Check sufficient balance
  IF v_current_balance < v_total_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient M1U balance',
      'required', v_total_cost,
      'available', v_current_balance
    );
  END IF;

  -- Get current quantity (if item already owned)
  SELECT quantity INTO v_current_quantity
  FROM public.user_battle_items
  WHERE user_id = v_user_id AND item_id = p_item_id;

  IF v_current_quantity IS NULL THEN
    v_current_quantity := 0;
  END IF;

  -- Check max stack limit
  v_new_quantity := v_current_quantity + p_quantity;
  IF v_new_quantity > v_item.max_stack THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Would exceed max stack limit',
      'max_stack', v_item.max_stack,
      'current', v_current_quantity,
      'requested', p_quantity
    );
  END IF;

  -- BEGIN TRANSACTION (automatic in function)
  
  -- 1. Deduct M1U from balance
  UPDATE public.user_m1_units
  SET 
    balance = balance - v_total_cost,
    total_spent = total_spent + v_total_cost,
    updated_at = now()
  WHERE user_id = v_user_id;

  -- 2. Insert/Update user inventory
  INSERT INTO public.user_battle_items (user_id, item_id, quantity, acquired_at)
  VALUES (v_user_id, p_item_id, p_quantity, now())
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET
    quantity = public.user_battle_items.quantity + p_quantity,
    metadata = jsonb_set(
      COALESCE(public.user_battle_items.metadata, '{}'::jsonb),
      '{last_purchase_at}',
      to_jsonb(now())
    );

  -- 3. Log transaction (optional, if M1U events table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_m1_units_events') THEN
    INSERT INTO public.user_m1_units_events (user_id, delta, reason, metadata)
    VALUES (
      v_user_id,
      -v_total_cost,
      'BATTLE_ITEM_PURCHASE',
      jsonb_build_object(
        'item_id', p_item_id,
        'item_code', v_item.code,
        'item_name', v_item.name,
        'quantity', p_quantity,
        'unit_price', v_item.base_price_m1u,
        'total_cost', v_total_cost
      )
    );
  END IF;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'item_id', p_item_id,
    'item_code', v_item.code,
    'quantity_purchased', p_quantity,
    'm1u_spent', v_total_cost,
    'new_balance', v_current_balance - v_total_cost,
    'new_quantity', v_new_quantity
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_battle_item(UUID, INT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 3.3 get_user_battle_inventory()
-- Get user's complete inventory with item details
-- ----------------------------------------------------------------------------

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
  is_equipped BOOLEAN,
  acquired_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    ubi.is_equipped,
    ubi.acquired_at,
    ubi.last_used_at
  FROM 
    public.user_battle_items ubi
  INNER JOIN 
    public.battle_items bi ON ubi.item_id = bi.id
  WHERE 
    ubi.user_id = auth.uid()
  ORDER BY 
    ubi.is_equipped DESC, bi.type, bi.rarity DESC, bi.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_battle_inventory() TO authenticated;

-- ============================================================================
-- 4. SEED DATA — STARTER WEAPONS & DEFENSES
-- ============================================================================

-- Weapons
INSERT INTO public.battle_items (type, code, name, description, icon_key, base_price_m1u, power, rarity, min_rank, max_stack) VALUES
('weapon', 'MISSILE_BASIC', 'Basic Missile', 'Standard attack missile with moderate damage', 'zap', 100, 100, 'common', 0, 10),
('weapon', 'MISSILE_ADVANCED', 'Advanced Missile', 'Enhanced missile with improved tracking', 'zap-off', 300, 150, 'rare', 5, 5),
('weapon', 'EMP_BLAST', 'EMP Blast', 'Electromagnetic pulse that disrupts defenses', 'flame', 500, 200, 'epic', 10, 3),
('weapon', 'PLASMA_CANNON', 'Plasma Cannon', 'High-energy plasma weapon with devastating power', 'radiation', 1000, 300, 'legendary', 15, 1),

-- Defenses
('defense', 'SHIELD_BASIC', 'Basic Shield', 'Standard energy shield with moderate protection', 'shield', 150, 100, 'common', 0, 10),
('defense', 'SHIELD_ADVANCED', 'Advanced Shield', 'Reinforced shield with enhanced durability', 'shield-check', 400, 150, 'rare', 5, 5),
('defense', 'ARMOR_REACTIVE', 'Reactive Armor', 'Adaptive armor that responds to incoming attacks', 'shield-alert', 700, 200, 'epic', 10, 3),
('defense', 'CLOAK_GHOST', 'Ghost Cloak', 'Stealth system that phases you out of combat', 'ghost', 1200, 300, 'legendary', 15, 1)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. ENABLE REALTIME (OPTIONAL)
-- ============================================================================

-- Enable realtime for user_battle_items (to sync inventory across devices)
ALTER TABLE public.user_battle_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'user_battle_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_battle_items;
    RAISE NOTICE '✅ user_battle_items added to realtime publication';
  END IF;
END $$;

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Check battle_items catalog
-- SELECT * FROM public.battle_items ORDER BY type, rarity DESC;

-- Check user inventory (run as authenticated user)
-- SELECT * FROM public.user_battle_items WHERE user_id = auth.uid();

-- Test purchase (run as authenticated user, requires M1U balance >= 100)
-- SELECT * FROM public.purchase_battle_item(
--   (SELECT id FROM public.battle_items WHERE code = 'MISSILE_BASIC'), 
--   1
-- );

-- List available items with ownership status
-- SELECT * FROM public.list_available_battle_items();

-- Get user inventory with details
-- SELECT * FROM public.get_user_battle_inventory();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ PHASE 9 BATTLE SHOP MIGRATION COMPLETE';
  RAISE NOTICE '✅ ============================================';
  RAISE NOTICE '✅ Tables created: battle_items, user_battle_items';
  RAISE NOTICE '✅ RPC functions: list_available_battle_items, purchase_battle_item, get_user_battle_inventory';
  RAISE NOTICE '✅ Seed data: 8 starter items (4 weapons, 4 defenses)';
  RAISE NOTICE '✅ Realtime: user_battle_items enabled';
  RAISE NOTICE '✅ ============================================';
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
