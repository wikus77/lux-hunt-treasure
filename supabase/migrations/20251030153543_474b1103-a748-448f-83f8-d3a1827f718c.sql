-- Mind Fractal: Links between nodes (synapses) and evolution milestones
create table if not exists dna_mind_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed bigint not null,
  node_a int not null,
  node_b int not null,
  theme text not null check (theme in ('Etica','Strategia','Adattività','Visione')),
  intensity real not null default 1.0 check (intensity between 0 and 5),
  created_at timestamptz not null default now()
);

create index if not exists dna_mind_links_user_seed_idx on dna_mind_links (user_id, seed);

-- Evolution milestones (every 5 links of same theme)
create table if not exists dna_mind_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed bigint not null,
  theme text not null check (theme in ('Etica','Strategia','Adattività','Visione')),
  level int not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists dna_mind_milestones_user_seed_idx on dna_mind_milestones (user_id, seed, theme, level);

-- RLS
alter table dna_mind_links enable row level security;
alter table dna_mind_milestones enable row level security;

create policy "links_select_own" on dna_mind_links
  for select using (auth.uid() = user_id);
create policy "links_insert_own" on dna_mind_links
  for insert with check (auth.uid() = user_id);

create policy "mile_select_own" on dna_mind_milestones
  for select using (auth.uid() = user_id);
create policy "mile_insert_own" on dna_mind_milestones
  for insert with check (auth.uid() = user_id);

-- RPC: Register link and check for milestone
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
) language plpgsql security definer as $$
declare
  v_theme_links int;
  v_level int;
  v_added boolean := false;
begin
  insert into dna_mind_links(user_id, seed, node_a, node_b, theme, intensity)
  values (p_user_id, p_seed, p_node_a, p_node_b, p_theme, greatest(0.1, least(p_intensity, 5)));

  select count(*) into v_theme_links
  from dna_mind_links
  where user_id = p_user_id and seed = p_seed and theme = p_theme;

  if (v_theme_links % 5 = 0) then
    v_level := v_theme_links / 5;
    insert into dna_mind_milestones(user_id, seed, theme, level, message)
    values (p_user_id, p_seed, p_theme, v_level, 'Il tuo DNA ha raggiunto una nuova consapevolezza')
    on conflict do nothing;
    v_added := true;
  end if;

  return query
  select
    (select count(*)::int from dna_mind_links where user_id = p_user_id and seed = p_seed) as total_links,
    v_theme_links::int as theme_links,
    v_added as milestone_added,
    coalesce(v_level, 0)::int as milestone_level;
end $$;