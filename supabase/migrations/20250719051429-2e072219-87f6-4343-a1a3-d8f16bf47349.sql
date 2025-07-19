-- © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
-- Estensione tabella monthly_missions per area dinamica globale

-- 1. Aggiungi colonna area_radius_km alla tabella monthly_missions
ALTER TABLE public.monthly_missions 
ADD COLUMN area_radius_km INTEGER DEFAULT NULL;

-- 2. Crea tabella user_mission_registrations se non esiste
CREATE TABLE IF NOT EXISTS public.user_mission_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mission_id UUID NOT NULL REFERENCES public.monthly_missions(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, mission_id)
);

-- 3. Abilita RLS per user_mission_registrations
ALTER TABLE public.user_mission_registrations ENABLE ROW LEVEL SECURITY;

-- 4. Policy per user_mission_registrations
CREATE POLICY "Users can register for missions"
ON public.user_mission_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their registrations"
ON public.user_mission_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- 5. Crea tabella panel_logs se non esiste
CREATE TABLE IF NOT EXISTS public.panel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    mission_id UUID REFERENCES public.monthly_missions(id),
    user_count INTEGER,
    area_radius_assigned INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Abilita RLS per panel_logs (solo admin)
ALTER TABLE public.panel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access panel logs"
ON public.panel_logs
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- 7. Funzione per assegnare area radius dinamicamente
CREATE OR REPLACE FUNCTION public.assign_area_radius(p_mission_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_count INTEGER;
    calculated_radius INTEGER;
    mission_scope TEXT;
BEGIN
    -- Conta utenti registrati per questa missione
    SELECT COUNT(*) INTO user_count
    FROM public.user_mission_registrations
    WHERE mission_id = p_mission_id AND status = 'active';
    
    -- Ottieni scope della missione (se esiste nella tabella)
    SELECT scope INTO mission_scope
    FROM public.monthly_missions
    WHERE id = p_mission_id;
    
    -- Calcola radius in base alle regole
    IF mission_scope = 'local' OR mission_scope = 'italia' THEN
        calculated_radius := 500;
    ELSIF mission_scope = 'continental' OR mission_scope = 'europa' THEN
        calculated_radius := CASE 
            WHEN user_count < 5000 THEN 800
            WHEN user_count < 20000 THEN 1000
            ELSE 1200
        END;
    ELSE -- missione globale
        calculated_radius := CASE 
            WHEN user_count < 10000 THEN 1500
            WHEN user_count < 100000 THEN 2000
            ELSE 2500
        END;
    END IF;
    
    -- Aggiorna la missione con il radius calcolato
    UPDATE public.monthly_missions
    SET area_radius_km = calculated_radius
    WHERE id = p_mission_id;
    
    -- Log dell'operazione
    INSERT INTO public.panel_logs (
        event_type, 
        mission_id, 
        user_count, 
        area_radius_assigned,
        details
    ) VALUES (
        'area_radius_assigned',
        p_mission_id,
        user_count,
        calculated_radius,
        jsonb_build_object(
            'scope', mission_scope,
            'calculation_time', now(),
            'user_count', user_count,
            'radius_km', calculated_radius
        )
    );
    
    RETURN calculated_radius;
END;
$$;

-- 8. Funzione trigger per auto-assegnazione
CREATE OR REPLACE FUNCTION public.trigger_assign_area_radius()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Se la missione viene attivata e non ha ancora un radius
    IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.area_radius_km IS NULL THEN
        PERFORM public.assign_area_radius(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- 9. Crea trigger per attivazione automatica
DROP TRIGGER IF EXISTS auto_assign_area_radius ON public.monthly_missions;
CREATE TRIGGER auto_assign_area_radius
    AFTER UPDATE ON public.monthly_missions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_assign_area_radius();

-- 10. Aggiungi colonna scope se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'monthly_missions' 
        AND column_name = 'scope'
    ) THEN
        ALTER TABLE public.monthly_missions 
        ADD COLUMN scope TEXT DEFAULT 'global';
    END IF;
END $$;

-- 11. Funzione per registrare utente a missione attiva
CREATE OR REPLACE FUNCTION public.register_user_to_active_mission(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    active_mission_id UUID;
BEGIN
    -- Trova missione attiva
    SELECT id INTO active_mission_id
    FROM public.monthly_missions
    WHERE status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF active_mission_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Registra utente (ignora se già registrato)
    INSERT INTO public.user_mission_registrations (user_id, mission_id)
    VALUES (p_user_id, active_mission_id)
    ON CONFLICT (user_id, mission_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$;