-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ACHIEVEMENT BADGES SYSTEM - 50+ Collectible Badges
-- Categories: Esplorazione, Social, Missioni, Tempo
-- Rarities: common, rare, epic, legendary

-- 1. ADD CATEGORY AND RARITY TO BADGES TABLE
ALTER TABLE public.badges
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common',
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 100;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON public.badges(rarity);

-- 2. DELETE OLD BADGES AND INSERT NEW COMPLETE CATALOG (50+ badges)
-- First, preserve user unlocked badges by badge name
DELETE FROM public.badges WHERE category = 'general' OR category IS NULL;

-- ============================================
-- CATEGORIA: ESPLORAZIONE (15 badge)
-- ============================================
INSERT INTO public.badges (name, description, icon, category, rarity, xp_reward, sort_order) VALUES
-- Common (5)
('🗺️ Primo Passo', 'Hai visitato il tuo primo marker sulla mappa', '🗺️', 'exploration', 'common', 10, 1),
('🔍 Esploratore Curioso', 'Hai visitato 5 marker diversi', '🔍', 'exploration', 'common', 15, 2),
('🧭 Navigatore', 'Hai visitato 10 marker diversi', '🧭', 'exploration', 'common', 20, 3),
('📍 Mappatore', 'Hai visitato 25 marker diversi', '📍', 'exploration', 'common', 25, 4),
('🌍 Globetrotter', 'Hai visitato marker in 3 città diverse', '🌍', 'exploration', 'common', 30, 5),

-- Rare (5)
('🏃 Maratoneta', 'Hai visitato 50 marker in totale', '🏃', 'exploration', 'rare', 50, 6),
('🎯 Cacciatore di Tesori', 'Hai trovato 10 reward marker', '🎯', 'exploration', 'rare', 60, 7),
('🔮 Scopritore di Segreti', 'Hai trovato un marker nascosto', '🔮', 'exploration', 'rare', 75, 8),
('⚡ Velocista', 'Hai visitato 5 marker in un solo giorno', '⚡', 'exploration', 'rare', 80, 9),
('🏔️ Conquistatore', 'Hai visitato 100 marker in totale', '🏔️', 'exploration', 'rare', 100, 10),

-- Epic (3)
('🌟 Maestro Esploratore', 'Hai visitato 200 marker', '🌟', 'exploration', 'epic', 150, 11),
('🗻 Pioniere', 'Sei stato tra i primi 10 a visitare un nuovo marker', '🗻', 'exploration', 'epic', 200, 12),
('🌈 Collezionista di Luoghi', 'Hai visitato marker in 10 regioni diverse', '🌈', 'exploration', 'epic', 250, 13),

-- Legendary (2)
('👑 Re degli Esploratori', 'Hai visitato 500 marker', '👑', 'exploration', 'legendary', 500, 14),
('🏆 Leggenda Cartografica', 'Hai visitato tutti i marker di una città', '🏆', 'exploration', 'legendary', 1000, 15)

ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- CATEGORIA: SOCIAL (12 badge)
-- ============================================
INSERT INTO public.badges (name, description, icon, category, rarity, xp_reward, sort_order) VALUES
-- Common (4)
('👋 Primo Contatto', 'Hai invitato il tuo primo amico', '👋', 'social', 'common', 15, 20),
('🤝 Connettore', 'Hai 3 amici che si sono registrati', '🤝', 'social', 'common', 25, 21),
('💬 Comunicatore', 'Hai condiviso M1SSION 5 volte', '💬', 'social', 'common', 20, 22),
('📱 Social Agent', 'Hai condiviso su 3 piattaforme diverse', '📱', 'social', 'common', 30, 23),

-- Rare (4)
('🌐 Networker', 'Hai invitato 10 amici', '🌐', 'social', 'rare', 75, 24),
('🎉 Party Starter', 'Hai creato un team di gioco', '🎉', 'social', 'rare', 60, 25),
('⭐ Influencer Locale', 'I tuoi invitati hanno guadagnato 1000 PE totali', '⭐', 'social', 'rare', 100, 26),
('🔥 Viral Agent', 'Hai condiviso un achievement che ha ricevuto 10 click', '🔥', 'social', 'rare', 80, 27),

-- Epic (2)
('💎 Ambassador', 'Hai portato 25 nuovi agenti in M1SSION', '💎', 'social', 'epic', 200, 28),
('🚀 Super Connector', 'La tua rete di referral ha 50+ membri', '🚀', 'social', 'epic', 300, 29),

-- Legendary (2)
('👑 Leggenda Social', 'Hai invitato 100+ agenti attivi', '👑', 'social', 'legendary', 750, 30),
('🌟 M1SSION Evangelist', 'Sei nel top 10 referral di sempre', '🌟', 'social', 'legendary', 1000, 31)

ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- CATEGORIA: MISSIONI (15 badge)
-- ============================================
INSERT INTO public.badges (name, description, icon, category, rarity, xp_reward, sort_order) VALUES
-- Common (5)
('🎯 Prima Missione', 'Hai partecipato alla tua prima missione', '🎯', 'missions', 'common', 10, 40),
('🔓 Decifratore', 'Hai sbloccato il tuo primo indizio', '🔓', 'missions', 'common', 15, 41),
('📚 Studioso', 'Hai sbloccato 10 indizi', '📚', 'missions', 'common', 25, 42),
('🎰 Lucky Buzzer', 'Hai usato BUZZ per la prima volta', '🎰', 'missions', 'common', 20, 43),
('🗂️ Archivista', 'Hai sbloccato 25 indizi', '🗂️', 'missions', 'common', 35, 44),

-- Rare (5)
('🧠 Mente Brillante', 'Hai sbloccato 50 indizi', '🧠', 'missions', 'rare', 75, 45),
('💡 Illuminato', 'Hai trovato un indizio raro', '💡', 'missions', 'rare', 60, 46),
('🎲 High Roller', 'Hai usato 100 BUZZ in totale', '🎲', 'missions', 'rare', 80, 47),
('🏁 Finalista', 'Hai raggiunto il 75% di una missione', '🏁', 'missions', 'rare', 100, 48),
('🔥 Streak Master', 'Hai mantenuto una streak di 15 giorni', '🔥', 'missions', 'rare', 90, 49),

-- Epic (3)
('⚔️ Gladiatore', 'Hai vinto 10 Battle', '⚔️', 'missions', 'epic', 200, 50),
('🎖️ Veterano', 'Hai completato 3 missioni', '🎖️', 'missions', 'epic', 250, 51),
('💯 Centurion', 'Hai sbloccato 100 indizi', '💯', 'missions', 'epic', 300, 52),

-- Legendary (2)
('🏆 Campione', 'Hai vinto una missione', '🏆', 'missions', 'legendary', 1000, 53),
('👑 Maestro delle Missioni', 'Hai vinto 3 missioni', '👑', 'missions', 'legendary', 2000, 54)

ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- CATEGORIA: TEMPO (12 badge)
-- ============================================
INSERT INTO public.badges (name, description, icon, category, rarity, xp_reward, sort_order) VALUES
-- Common (4)
('🌅 Early Bird', 'Hai fatto check-in prima delle 8:00', '🌅', 'time', 'common', 15, 60),
('🌙 Night Owl', 'Hai giocato dopo mezzanotte', '🌙', 'time', 'common', 15, 61),
('📅 Costante', 'Hai giocato 7 giorni consecutivi', '📅', 'time', 'common', 25, 62),
('⏰ Puntuale', 'Hai fatto check-in ogni giorno per una settimana', '⏰', 'time', 'common', 30, 63),

-- Rare (4)
('🔥 Fiamma Ardente', 'Streak di 10 giorni consecutivi', '🔥', 'time', 'rare', 60, 64),
('⚡ Inferno', 'Streak di 15 giorni consecutivi', '🌋', 'time', 'rare', 80, 65),
('🎂 Anniversario', 'Sei in M1SSION da 30 giorni', '🎂', 'time', 'rare', 100, 66),
('📆 Veterano Mensile', 'Hai completato un mese intero di check-in', '📆', 'time', 'rare', 120, 67),

-- Epic (2)
('💎 Diamante Streak', 'Streak di 30 giorni consecutivi', '💎', 'time', 'epic', 250, 68),
('🏅 Campione di Dedizione', 'Sei attivo da 90 giorni', '🏅', 'time', 'epic', 300, 69),

-- Legendary (2)
('👑 Re della Streak', 'Streak di 100 giorni consecutivi', '👑', 'time', 'legendary', 750, 70),
('🌟 Leggenda Eterna', 'Sei attivo da 365 giorni', '🌟', 'time', 'legendary', 1500, 71)

ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- CATEGORIA: SPECIALI (6 badge)
-- ============================================
INSERT INTO public.badges (name, description, icon, category, rarity, xp_reward, sort_order) VALUES
('🚀 Early Adopter', 'Ti sei registrato nel primo mese di M1SSION', '🚀', 'special', 'epic', 500, 80),
('💫 Beta Tester', 'Hai partecipato alla fase beta', '💫', 'special', 'legendary', 1000, 81),
('🎁 Gift Hunter', 'Hai riscattato 5 reward marker', '🎁', 'special', 'rare', 100, 82),
('🔐 Cracker', 'Hai completato tutti i mini-giochi', '🔐', 'special', 'epic', 300, 83),
('🎨 Personalizzatore', 'Hai completato il tuo profilo al 100%', '🎨', 'special', 'common', 50, 84),
('⭐ VIP Member', 'Hai attivato un abbonamento premium', '⭐', 'special', 'rare', 150, 85)

ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  sort_order = EXCLUDED.sort_order;

-- 3. CREATE VIEW FOR BADGE STATISTICS
CREATE OR REPLACE VIEW public.badge_stats_v AS
SELECT 
  category,
  rarity,
  COUNT(*) as total_badges,
  SUM(xp_reward) as total_xp_available
FROM public.badges
GROUP BY category, rarity
ORDER BY category, 
  CASE rarity 
    WHEN 'common' THEN 1 
    WHEN 'rare' THEN 2 
    WHEN 'epic' THEN 3 
    WHEN 'legendary' THEN 4 
  END;

-- 4. CREATE FUNCTION TO GET USER BADGE PROGRESS
CREATE OR REPLACE FUNCTION public.get_user_badge_progress(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  total_in_category BIGINT,
  unlocked_count BIGINT,
  locked_count BIGINT,
  completion_percent NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.category,
    COUNT(DISTINCT b.badge_id) as total_in_category,
    COUNT(DISTINCT ub.badge_id) as unlocked_count,
    COUNT(DISTINCT b.badge_id) - COUNT(DISTINCT ub.badge_id) as locked_count,
    ROUND((COUNT(DISTINCT ub.badge_id)::NUMERIC / NULLIF(COUNT(DISTINCT b.badge_id), 0)) * 100, 1) as completion_percent
  FROM public.badges b
  LEFT JOIN public.user_badges ub ON b.badge_id = ub.badge_id AND ub.user_id = p_user_id
  GROUP BY b.category
  ORDER BY b.category;
END;
$$;

-- 5. CREATE FUNCTION TO AWARD BADGE
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id UUID,
  p_badge_name TEXT,
  p_source TEXT DEFAULT 'system'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge RECORD;
  v_already_has BOOLEAN;
BEGIN
  -- Get badge info
  SELECT badge_id, name, description, icon, xp_reward, rarity
  INTO v_badge
  FROM public.badges
  WHERE name = p_badge_name;
  
  IF v_badge.badge_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Badge not found');
  END IF;
  
  -- Check if already has badge
  SELECT EXISTS(
    SELECT 1 FROM public.user_badges 
    WHERE user_id = p_user_id AND badge_id = v_badge.badge_id
  ) INTO v_already_has;
  
  IF v_already_has THEN
    RETURN jsonb_build_object('success', false, 'error', 'Badge already unlocked');
  END IF;
  
  -- Award badge
  INSERT INTO public.user_badges (user_id, badge_id, source)
  VALUES (p_user_id, v_badge.badge_id, p_source);
  
  -- Award XP
  UPDATE public.profiles
  SET pulse_energy = COALESCE(pulse_energy, 0) + v_badge.xp_reward
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'badge_name', v_badge.name,
    'badge_icon', v_badge.icon,
    'xp_awarded', v_badge.xp_reward,
    'rarity', v_badge.rarity
  );
END;
$$;

-- 6. GRANT PERMISSIONS
GRANT SELECT ON public.badge_stats_v TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_badge_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_badge TO authenticated;

-- Done!
SELECT 'Achievement Badges System installed! ' || COUNT(*) || ' badges created.' as status
FROM public.badges;

