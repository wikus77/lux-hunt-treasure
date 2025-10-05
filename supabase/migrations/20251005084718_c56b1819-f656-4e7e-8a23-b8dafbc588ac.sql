-- =====================================================
-- M1SSION™ Web Push Unification Migration (FIX)
-- Aggiorna tabella push_tokens esistente
-- =====================================================

-- 1. Aggiungere colonne mancanti a push_tokens (se non esistono)
DO $$
BEGIN
  -- Aggiungi provider se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'push_tokens' 
                 AND column_name = 'provider') THEN
    ALTER TABLE public.push_tokens ADD COLUMN provider TEXT NOT NULL DEFAULT 'webpush';
  END IF;

  -- Aggiungi device_info se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'push_tokens' 
                 AND column_name = 'device_info') THEN
    ALTER TABLE public.push_tokens ADD COLUMN device_info JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Aggiungi last_used se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'push_tokens' 
                 AND column_name = 'last_used') THEN
    ALTER TABLE public.push_tokens ADD COLUMN last_used TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Aggiungi is_active se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'push_tokens' 
                 AND column_name = 'is_active') THEN
    ALTER TABLE public.push_tokens ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 2. Creare tabella per logging push attempts
CREATE TABLE IF NOT EXISTS public.push_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT,
  status TEXT NOT NULL,
  status_code INTEGER,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Eliminare tabelle vecchie se esistono
DROP TABLE IF EXISTS public.webpush_subscriptions CASCADE;
DROP TABLE IF EXISTS public.fcm_tokens CASCADE;

-- 4. Creare indici per performance
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_is_active ON public.push_tokens(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_logs_created_at ON public.push_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_logs_user_id ON public.push_logs(user_id);

-- 5. Abilitare RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;

-- 6. Eliminare vecchie policies (se esistono)
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Service role can read all tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can view own logs" ON public.push_logs;
DROP POLICY IF EXISTS "Service role can manage all logs" ON public.push_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.push_logs;

-- 7. Creare nuove RLS Policies per push_tokens
CREATE POLICY "Users can manage own tokens"
ON public.push_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can read all tokens"
ON public.push_tokens
FOR SELECT
TO service_role
USING (true);

-- 8. RLS Policies per push_logs
CREATE POLICY "Users can view own logs"
ON public.push_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all logs"
ON public.push_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all logs"
ON public.push_logs
FOR SELECT
TO authenticated
USING (is_admin_secure());

-- 9. Funzione per cleanup automatico token scaduti (lifecycle)
CREATE OR REPLACE FUNCTION public.cleanup_expired_push_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.push_tokens
  SET is_active = false
  WHERE is_active = true
    AND last_used < now() - INTERVAL '90 days';
    
  DELETE FROM public.push_tokens
  WHERE is_active = false
    AND last_used < now() - INTERVAL '180 days';
END;
$$;

-- 10. Trigger per aggiornare last_used
CREATE OR REPLACE FUNCTION public.touch_push_token_last_used()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_used = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS push_tokens_touch_last_used ON public.push_tokens;
CREATE TRIGGER push_tokens_touch_last_used
BEFORE UPDATE ON public.push_tokens
FOR EACH ROW
EXECUTE FUNCTION public.touch_push_token_last_used();

COMMENT ON TABLE public.push_tokens IS 'Unified Web Push tokens - M1SSION™';
COMMENT ON TABLE public.push_logs IS 'Push delivery logs for diagnostics';
