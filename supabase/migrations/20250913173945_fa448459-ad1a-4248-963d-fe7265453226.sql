-- Tabella profili con flag admin
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Imposta admin per l'utente
insert into public.profiles (user_id, is_admin)
values ('495246c1-9154-4f01-a428-7f37fe230180'::uuid, true)
on conflict (user_id) do update set is_admin = excluded.is_admin;