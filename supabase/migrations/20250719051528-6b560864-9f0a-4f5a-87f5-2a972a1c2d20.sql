-- © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
-- Creazione sistema monthly_missions con area dinamica globale

-- 1. Crea tabella monthly_missions
CREATE TABLE IF NOT EXISTS public.monthly_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    scope TEXT NOT NULL DEFAULT 'global',
    area_radius_km INTEGER DEFAULT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    prize_description TEXT,
    target_location JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Abilita RLS per monthly_missions
ALTER TABLE public.monthly_missions ENABLE ROW LEVEL SECURITY;

-- 3. Policy per monthly_missions
CREATE POLICY "Public can view active missions"
ON public.monthly_missions
FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage missions"
ON public.monthly_missions
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- 4. Crea tabella user_mission_registrations
CREATE TABLE IF NOT EXISTS public.user_mission_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mission_id UUID NOT NULL REFERENCES public.monthly_missions(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, mission_id)
);

-- 5. Abilita RLS per user_mission_registrations
ALTER TABLE public.user_mission_registrations ENABLE ROW LEVEL SECURITY;

-- 6. Policy per user_mission_registrations
CREATE POLICY "Users can register for missions"
ON public.user_mission_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their registrations"
ON public.user_mission_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- 7. Crea tabella panel_logs
CREATE TABLE IF NOT EXISTS public.panel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    mission_id UUID REFERENCES public.monthly_missions(id),
    user_count INTEGER,
    area_radius_assigned INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Abilita RLS per panel_logs (solo admin)
ALTER TABLE public.panel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access panel logs"
ON public.panel_logs
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- 9. Funzione per assegnare area radius dinamicamente
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
    
    -- Ottieni scope della missione
    SELECT scope INTO mission_scope
    FROM public.monthly_missions
    WHERE id = p_mission_id;
    
    -- Calcola radius in base alle regole specificate
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
    SET area_radius_km = calculated_radius,
        updated_at = now()
    WHERE id = p_mission_id;
    
    -- Log dell'operazione nel panel
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
            'radius_km', calculated_radius,
            'logic_version', '1.0'
        )
    );
    
    RETURN calculated_radius;
END;
$$;

-- 10. Funzione trigger per auto-assegnazione del radius
CREATE OR REPLACE FUNCTION public.trigger_assign_area_radius()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Quando una missione viene attivata e non ha ancora un radius
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') AND NEW.area_radius_km IS NULL THEN
        PERFORM public.assign_area_radius(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- 11. Crea trigger per attivazione automatica
DROP TRIGGER IF EXISTS auto_assign_area_radius ON public.monthly_missions;
CREATE TRIGGER auto_assign_area_radius
    AFTER UPDATE ON public.monthly_missions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_assign_area_radius();

-- 12. Funzione per registrare utente a missione attiva
CREATE OR REPLACE FUNCTION public.register_user_to_active_mission(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    active_mission_id UUID;
    registration_success BOOLEAN := FALSE;
BEGIN
    -- Trova la missione attiva più recente
    SELECT id INTO active_mission_id
    FROM public.monthly_missions
    WHERE status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF active_mission_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Registra l'utente (ignora se già registrato)
    INSERT INTO public.user_mission_registrations (user_id, mission_id)
    VALUES (p_user_id, active_mission_id)
    ON CONFLICT (user_id, mission_id) DO NOTHING;
    
    -- Verifica se la registrazione è avvenuta
    IF FOUND THEN
        registration_success := TRUE;
        
        -- Ricalcola il radius se necessario (ogni 100 nuove registrazioni)
        IF (SELECT COUNT(*) FROM public.user_mission_registrations WHERE mission_id = active_mission_id) % 100 = 0 THEN
            PERFORM public.assign_area_radius(active_mission_id);
        END IF;
    END IF;
    
    RETURN registration_success;
END;
$$;

-- 13. Trigger per aggiornamento timestamp
CREATE OR REPLACE FUNCTION public.update_monthly_missions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_monthly_missions_updated_at
    BEFORE UPDATE ON public.monthly_missions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_monthly_missions_updated_at();