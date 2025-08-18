-- © 2025 Joseph MULÉ – M1SSION™
-- Ensure RPC functions exist for marker rewards

create or replace function grant_buzz(p_user uuid, p_source text, p_count int)
returns void language sql security definer set search_path to public as $$
  insert into buzz_grants(user_id, source, remaining)
  values (p_user, p_source, p_count)
  on conflict (user_id, source)
  do update set remaining = buzz_grants.remaining + excluded.remaining;
$$;

create or replace function increment_xp(p_user uuid, p_amount int)
returns void language sql security definer set search_path to public as $$
  insert into user_xp(user_id, total_xp) values (p_user, 0)
  on conflict (user_id) do update set total_xp = user_xp.total_xp + coalesce(p_amount,0);
$$;