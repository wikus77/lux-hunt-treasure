-- =====================================================================
-- FIX: Battle Item Purchase - M1U Deduction
-- Run this DIRECTLY in Supabase SQL Editor
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- =====================================================================

-- Drop old function first
DROP FUNCTION IF EXISTS public.purchase_battle_item(UUID, INTEGER);

-- Recreate with proper M1U deduction
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
  v_rows_updated INTEGER;
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

  -- Get user's current M1U balance from profiles
  SELECT COALESCE(m1_units, 0) INTO v_current_balance
  FROM public.profiles
  WHERE id = v_user_id;

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

  -- Check current quantity in inventory
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

  -- ===== DEDUCT M1U FROM PROFILES =====
  UPDATE public.profiles
  SET 
    m1_units = m1_units - v_total_cost,
    updated_at = NOW()
  WHERE id = v_user_id
    AND m1_units >= v_total_cost;  -- Extra safety check
  
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  -- Verify deduction happened
  IF v_rows_updated = 0 THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Failed to deduct M1U - balance may have changed'
    );
  END IF;

  -- Add/Update inventory
  INSERT INTO public.user_battle_items (user_id, item_id, quantity, purchased_at)
  VALUES (v_user_id, p_item_id, p_quantity, NOW())
  ON CONFLICT (user_id, item_id) 
  DO UPDATE SET 
    quantity = user_battle_items.quantity + p_quantity,
    purchased_at = NOW();

  -- Log transaction
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
        'total_cost', v_total_cost,
        'balance_before', v_current_balance,
        'balance_after', v_current_balance - v_total_cost
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log failed but continue (non-critical)
    NULL;
  END;

  -- Return success with new balance
  RETURN jsonb_build_object(
    'success', true,
    'item_code', v_item.code,
    'item_name', v_item.name,
    'quantity_purchased', p_quantity,
    'total_cost', v_total_cost,
    'balance_before', v_current_balance,
    'new_balance', v_current_balance - v_total_cost
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.purchase_battle_item(UUID, INTEGER) TO authenticated;

-- Verify the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'purchase_battle_item';

