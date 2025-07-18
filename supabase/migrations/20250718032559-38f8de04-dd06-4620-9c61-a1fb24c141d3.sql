-- 🔐 SECURITY AUDIT: Verificare policy RLS su tabelle critiche

-- 1. Verificare che user_map_areas abbia policy corrette (NO true)
DROP POLICY IF EXISTS "Allow access to owner" ON public.user_map_areas;
CREATE POLICY "Allow access to owner" ON public.user_map_areas
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Verificare che user_buzz_counter abbia policy corrette (NO true) 
DROP POLICY IF EXISTS "Allow access to owner" ON public.user_buzz_counter;
CREATE POLICY "Allow access to owner" ON public.user_buzz_counter
FOR ALL  
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Verificare che user_clues abbia policy corrette (NO true)
DROP POLICY IF EXISTS "Allow access to owner" ON public.user_clues;
CREATE POLICY "Allow access to owner" ON public.user_clues
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Mantenere policy admin per prizes ma verificare che sia limitata
DROP POLICY IF EXISTS "Public read access" ON public.prizes;
CREATE POLICY "Public read access" ON public.prizes
FOR SELECT
USING (true);

-- Le policy admin esistenti per prizes sono OK poiché verificano ruolo admin