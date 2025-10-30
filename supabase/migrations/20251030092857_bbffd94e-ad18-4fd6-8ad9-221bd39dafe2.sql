-- © 2025 Joseph MULÉ – M1SSION™ – Neural Links DNA Puzzle Schema

-- Sessione di gioco per utente
create table if not exists dna_neural_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seed text not null,
  pairs_count int not null check (pairs_count between 4 and 12),
  started_at timestamptz not null default now(),
  last_state jsonb not null default '{}'::jsonb,
  moves int not null default 0,
  elapsed_seconds int not null default 0,
  solved boolean not null default false,
  solved_at timestamptz
);

-- Storico mosse (analytics)
create table if not exists dna_neural_moves (
  id bigserial primary key,
  session_id uuid not null references dna_neural_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  action text not null check (action in ('connect','undo','reset')),
  payload jsonb not null
);

-- RLS
alter table dna_neural_sessions enable row level security;
alter table dna_neural_moves enable row level security;

create policy "own sessions" on dna_neural_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own moves" on dna_neural_moves
  for all using (
    session_id in (select id from dna_neural_sessions where user_id = auth.uid())
  ) with check (
    session_id in (select id from dna_neural_sessions where user_id = auth.uid())
  );

-- RPC: Crea/recupera sessione aperta
create or replace function rpc_neural_start(p_pairs int default 6)
returns dna_neural_sessions
language plpgsql security definer as $$
declare s dna_neural_sessions;
begin
  select * into s from dna_neural_sessions
   where user_id = auth.uid() and solved = false
   order by started_at desc limit 1;

  if s.id is null then
    insert into dna_neural_sessions (user_id, seed, pairs_count)
    values (auth.uid(), encode(gen_random_bytes(8), 'hex'), greatest(4, least(p_pairs,12)))
    returning * into s;
  end if;
  return s;
end; $$;

-- RPC: Salva stato parziale
create or replace function rpc_neural_save(
  p_session uuid,
  p_state jsonb,
  p_moves int,
  p_elapsed int
) returns void language sql security definer as $$
  update dna_neural_sessions
    set last_state = coalesce(p_state,'{}'::jsonb),
        moves = p_moves,
        elapsed_seconds = p_elapsed
  where id = p_session and user_id = auth.uid();
$$;

-- RPC: Marca completata
create or replace function rpc_neural_complete(p_session uuid)
returns void language sql security definer as $$
  update dna_neural_sessions
    set solved = true, solved_at = now()
  where id = p_session and user_id = auth.uid();
$$;