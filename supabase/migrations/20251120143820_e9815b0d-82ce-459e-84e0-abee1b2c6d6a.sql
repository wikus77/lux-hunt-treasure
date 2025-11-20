-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Winners Public View: Leaderboard globale accessibile a tutti

CREATE OR REPLACE VIEW public.winners_public AS
SELECT 
  fs.id,
  fs.completion_time,
  fs.winner_user_id,
  p.nickname,
  p.avatar_url,
  p.agent_code,
  m.title as mission_title,
  m.code as mission_code,
  pr.name as prize_name,
  pr.value as prize_value,
  pr.image_url as prize_image
FROM public.final_shots fs
LEFT JOIN public.profiles p ON p.id = fs.winner_user_id
LEFT JOIN public.missions m ON m.id = fs.mission_id
LEFT JOIN public.prizes pr ON pr.id = fs.prize_id
ORDER BY fs.completion_time DESC;

-- RLS: la view è pubblica, tutti possono leggere
ALTER VIEW public.winners_public SET (security_invoker = false);

COMMENT ON VIEW public.winners_public IS 'Public leaderboard of all mission winners with profile and prize details';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™