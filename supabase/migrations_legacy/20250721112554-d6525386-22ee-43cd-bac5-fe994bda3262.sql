-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Progressive BUZZ MAPPA™ System - Missing Components Only

-- Update increment_buzz_map_counter function to match new schema
CREATE OR REPLACE FUNCTION public.increment_buzz_map_counter(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Insert or update the counter for today
  INSERT INTO public.user_buzz_map_counter (user_id, date, buzz_map_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    buzz_map_count = user_buzz_map_counter.buzz_map_count + 1,
    updated_at = now()
  RETURNING buzz_map_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Create function to validate progressive pricing
CREATE OR REPLACE FUNCTION public.validate_progressive_pricing(
  p_user_id uuid,
  p_price numeric,
  p_radius numeric,
  p_generation integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expected_price numeric;
  expected_radius numeric;
  price_table numeric[][] := ARRAY[
    [0, 500, 4.99], [1, 450, 6.99], [2, 405, 8.99], [3, 365, 10.99], [4, 329, 12.99],
    [5, 295, 14.99], [6, 265, 16.99], [7, 240, 19.99], [8, 216, 21.99], [9, 195, 25.99],
    [10, 175, 29.99], [11, 155, 29.99], [12, 140, 29.99], [13, 126, 29.99], [14, 113, 29.99],
    [15, 102, 29.99], [16, 92, 44.99], [17, 83, 67.99], [18, 75, 101.99], [19, 67, 152.99],
    [20, 60, 229.99], [21, 54, 344.99], [22, 49, 517.99], [23, 44, 776.99], [24, 39, 1165.99],
    [25, 35, 1748.99], [26, 31, 2622.99], [27, 28, 2622.99], [28, 25, 2622.99], [29, 23, 2622.99],
    [30, 20, 2622.99], [31, 18, 2622.99], [32, 16, 2622.99], [33, 14.5, 2622.99], [34, 13.1, 2622.99],
    [35, 11.8, 3933.99], [36, 10.6, 3933.99], [37, 9.5, 4999.00], [38, 8.6, 4999.00],
    [39, 7.7, 4999.00], [40, 6.9, 4999.00], [41, 5, 4999.00]
  ];
  max_generation INTEGER := 41;
  actual_generation INTEGER;
BEGIN
  -- Use the smaller of provided generation or max generation
  actual_generation := LEAST(p_generation, max_generation);
  
  -- Get expected values from price table (generation + 1 because array is 1-indexed)
  expected_radius := price_table[actual_generation + 1][2];
  expected_price := price_table[actual_generation + 1][3];
  
  -- Validate with small tolerance for floating point precision
  RETURN (ABS(p_price - expected_price) < 0.01) AND (ABS(p_radius - expected_radius) < 1);
END;
$$;