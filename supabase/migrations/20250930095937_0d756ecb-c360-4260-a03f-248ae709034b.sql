-- 1) CATEGORIE PREMIO
create table if not exists public.prize_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2) PREMI PER MISSIONE
create table if not exists public.mission_prizes (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  category_id uuid references public.prize_categories(id) on delete set null,
  title text not null,
  description text,
  value_text text,
  status text not null default 'available' check (status in ('available','unavailable')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 3) INDICI
create index if not exists idx_mission_prizes_mission on public.mission_prizes(mission_id);
create index if not exists idx_mission_prizes_category on public.mission_prizes(category_id);

-- 4) RLS
alter table public.prize_categories enable row level security;
alter table public.mission_prizes enable row level security;

-- Policy per prize_categories
do $$
begin
  if not exists (select 1 from pg_policies where tablename='prize_categories' and policyname='pc_admin_read') then
    create policy pc_admin_read on public.prize_categories
      for select using (is_admin_secure());
  end if;
  
  if not exists (select 1 from pg_policies where tablename='prize_categories' and policyname='pc_admin_write') then
    create policy pc_admin_write on public.prize_categories
      for all using (is_admin_secure()) with check (is_admin_secure());
  end if;
end$$;

-- Policy per mission_prizes
do $$
begin
  if not exists (select 1 from pg_policies where tablename='mission_prizes' and policyname='mp_admin_read') then
    create policy mp_admin_read on public.mission_prizes
      for select using (is_admin_secure());
  end if;
  
  if not exists (select 1 from pg_policies where tablename='mission_prizes' and policyname='mp_admin_write') then
    create policy mp_admin_write on public.mission_prizes
      for all using (is_admin_secure()) with check (is_admin_secure());
  end if;
end$$;

-- 5) Abilita realtime
alter publication supabase_realtime add table public.prize_categories;
alter publication supabase_realtime add table public.mission_prizes;