-- © 2025 Joseph MULÉ – M1SSION™- ALL RIGHTS RESERVED - NIYVORA KFT

-- Create blocked IPs table for rate limiting and security
CREATE TABLE IF NOT EXISTS public.blocked_ips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    unblock_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT NOT NULL DEFAULT 'rate_limit_exceeded',
    attempts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast IP lookups
CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_unblock_at ON public.blocked_ips(unblock_at);

-- Create API rate limits tracking table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_request TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_ip_endpoint ON public.api_rate_limits(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start);

-- Enable RLS on new tables
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked_ips (only system and authorized email can access)
CREATE POLICY "System can manage blocked IPs" 
ON public.blocked_ips 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authorized user can view blocked IPs" 
ON public.blocked_ips 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'wikus77@hotmail.it'
    )
);

-- RLS policies for api_rate_limits
CREATE POLICY "System can manage rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authorized user can view rate limits" 
ON public.api_rate_limits 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'wikus77@hotmail.it'
    )
);

-- Update admin_logs table to include IP and security fields if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE public.admin_logs ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE public.admin_logs ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'route') THEN
        ALTER TABLE public.admin_logs ADD COLUMN route TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'status_code') THEN
        ALTER TABLE public.admin_logs ADD COLUMN status_code INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'reason') THEN
        ALTER TABLE public.admin_logs ADD COLUMN reason TEXT;
    END IF;
END $$;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(ip_addr INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.blocked_ips 
        WHERE ip_address = ip_addr 
        AND unblock_at > now()
    );
END;
$$;

-- Function to block IP
CREATE OR REPLACE FUNCTION public.block_ip(ip_addr INET, block_duration_minutes INTEGER DEFAULT 30, block_reason TEXT DEFAULT 'rate_limit_exceeded')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.blocked_ips (ip_address, unblock_at, reason)
    VALUES (ip_addr, now() + (block_duration_minutes || ' minutes')::INTERVAL, block_reason)
    ON CONFLICT (ip_address) DO UPDATE SET
        unblock_at = now() + (block_duration_minutes || ' minutes')::INTERVAL,
        attempts = blocked_ips.attempts + 1,
        reason = block_reason;
END;
$$;

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(ip_addr INET, api_endpoint TEXT, max_requests INTEGER DEFAULT 3, window_minutes INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
    
    -- Clean old entries
    DELETE FROM public.api_rate_limits 
    WHERE window_start < window_start_time;
    
    -- Get current count for this IP and endpoint
    SELECT request_count INTO current_count
    FROM public.api_rate_limits
    WHERE ip_address = ip_addr 
    AND endpoint = api_endpoint
    AND window_start >= window_start_time;
    
    IF current_count IS NULL THEN
        -- First request in this window
        INSERT INTO public.api_rate_limits (ip_address, endpoint, request_count, window_start)
        VALUES (ip_addr, api_endpoint, 1, now());
        RETURN TRUE;
    ELSIF current_count < max_requests THEN
        -- Update count
        UPDATE public.api_rate_limits 
        SET request_count = request_count + 1, last_request = now()
        WHERE ip_address = ip_addr AND endpoint = api_endpoint;
        RETURN TRUE;
    ELSE
        -- Rate limit exceeded
        RETURN FALSE;
    END IF;
END;
$$;

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION public.cleanup_security_tables()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Remove expired IP blocks
    DELETE FROM public.blocked_ips WHERE unblock_at < now();
    
    -- Remove old rate limit entries (older than 1 hour)
    DELETE FROM public.api_rate_limits WHERE window_start < now() - INTERVAL '1 hour';
    
    -- Remove old admin logs (older than 30 days)
    DELETE FROM public.admin_logs WHERE created_at < now() - INTERVAL '30 days';
END;
$$;