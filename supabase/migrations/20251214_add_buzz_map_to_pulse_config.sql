-- Migration: Add BUZZ_MAP_COMPLETED to pulse_config_weights
-- This enables the PulseBar to increment when users use BUZZ MAP
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- Add BUZZ_MAP_COMPLETED event type if not exists
INSERT INTO public.pulse_config_weights (type, weight, cooldown_sec, per_user_cap_day, enabled, description) 
VALUES ('BUZZ_MAP_COMPLETED', 3.5, 180, 15, true, 'BUZZ MAP area creata con successo')
ON CONFLICT (type) DO UPDATE SET
  weight = 3.5,
  cooldown_sec = 180,
  per_user_cap_day = 15,
  enabled = true,
  description = 'BUZZ MAP area creata con successo';

-- Verify
SELECT type, weight, cooldown_sec, per_user_cap_day, enabled FROM public.pulse_config_weights ORDER BY type;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™



