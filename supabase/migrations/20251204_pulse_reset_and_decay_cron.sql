-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- PULSE RESET + DECAY CRON SETUP
-- ============================================================================

-- ============================================================================
-- OPZIONE A: RESET PULSE A 50% (per test)
-- ============================================================================

-- Reset the global pulse value to 50%
UPDATE public.pulse_state 
SET value = 50.0, 
    last_threshold = 50,
    updated_at = NOW()
WHERE id = 1;

-- Log del reset
INSERT INTO public.pulse_thresholds_log (threshold, value_snapshot)
VALUES (50, 50.0);

-- Notify realtime subscribers
SELECT pg_notify('pulse_channel', 
  json_build_object(
    'value', 50.0, 
    'delta', -50.0, 
    'threshold', NULL, 
    'type', 'admin_reset'
  )::text
);

-- ============================================================================
-- OPZIONE B: CONFIGURAZIONE DECAY AUTOMATICO
-- ============================================================================

-- 1. Verifica/crea estensione pg_cron (se non esiste)
-- NOTA: pg_cron deve essere abilitato nel progetto Supabase (Dashboard > Database > Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Rimuovi eventuali job esistenti per evitare duplicati
SELECT cron.unschedule('pulse_decay_tick') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'pulse_decay_tick'
);

-- 3. Crea il job CRON per il decay del Pulse
-- Esegue ogni 30 minuti, riduce il Pulse dello 0.5%
-- In 24 ore: 48 tick × 0.5% = 24% di decay potenziale
SELECT cron.schedule(
  'pulse_decay_tick',           -- Nome del job
  '*/30 * * * *',               -- Ogni 30 minuti
  $$SELECT public.rpc_pulse_decay_tick(0.5)$$  -- Decay 0.5% per tick
);

-- 4. Verifica che il job sia stato creato
SELECT * FROM cron.job WHERE jobname = 'pulse_decay_tick';

-- ============================================================================
-- VERIFICA FINALE
-- ============================================================================

-- Mostra lo stato attuale del Pulse
SELECT 
  value as "Pulse Value (%)",
  last_threshold as "Last Threshold",
  updated_at as "Last Update"
FROM public.pulse_state 
WHERE id = 1;

-- Mostra i job CRON attivi
SELECT jobname, schedule, command 
FROM cron.job 
WHERE jobname LIKE 'pulse%';






