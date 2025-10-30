-- Fix search_path for upsert_dna_mind_link function
create or replace function upsert_dna_mind_link(
  p_user_id uuid,
  p_seed bigint,
  p_node_a int,
  p_node_b int,
  p_theme text,
  p_intensity real default 1.0
) returns table (
  total_links int,
  theme_links int,
  milestone_added boolean,
  milestone_level int
) language plpgsql security definer set search_path = '' as $$
declare
  v_theme_links int;
  v_level int;
  v_added boolean := false;
begin
  insert into public.dna_mind_links(user_id, seed, node_a, node_b, theme, intensity)
  values (p_user_id, p_seed, p_node_a, p_node_b, p_theme, greatest(0.1, least(p_intensity, 5)));

  select count(*) into v_theme_links
  from public.dna_mind_links
  where user_id = p_user_id and seed = p_seed and theme = p_theme;

  if (v_theme_links % 5 = 0) then
    v_level := v_theme_links / 5;
    insert into public.dna_mind_milestones(user_id, seed, theme, level, message)
    values (p_user_id, p_seed, p_theme, v_level, 'Il tuo DNA ha raggiunto una nuova consapevolezza')
    on conflict do nothing;
    v_added := true;
  end if;

  return query
  select
    (select count(*)::int from public.dna_mind_links where user_id = p_user_id and seed = p_seed) as total_links,
    v_theme_links::int as theme_links,
    v_added as milestone_added,
    coalesce(v_level, 0)::int as milestone_level;
end $$;