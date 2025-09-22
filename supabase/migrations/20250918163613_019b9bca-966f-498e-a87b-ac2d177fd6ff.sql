-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

-- RPC idempotente: crea/sostituisce la funzione bulk-insert con colonne qualificate
create or replace function public.fn_markers_bulk_insert(
  _rows jsonb,
  _drop_id uuid default null
)
returns table (marker_id uuid)
language plpgsql
security definer
as $$
declare
  r jsonb;
  _title text;
  _lat double precision;
  _lng double precision;
  _active boolean;
  _reward_type public.reward_type;
  _reward_payload jsonb;
  _visible_from timestamptz;
  _visible_to   timestamptz;
begin
  for r in select * from jsonb_array_elements(coalesce(_rows, '[]'::jsonb)) loop
    _title          := coalesce((r->>'title')::text, 'Marker');
    _lat            := (r->>'lat')::double precision;
    _lng            := (r->>'lng')::double precision;
    _active         := coalesce((r->>'active')::boolean, true);
    _reward_type    := (r->>'reward_type')::public.reward_type;
    _reward_payload := coalesce(r->'reward_payload', '{}'::jsonb);
    _visible_from   := coalesce((r->>'visible_from')::timestamptz, now());
    _visible_to     := (r->>'visible_to')::timestamptz;

    insert into public.markers
      (title, lat, lng, active, reward_type, reward_payload, drop_id, visible_from, visible_to)
    values
      (_title, _lat, _lng, _active, _reward_type, _reward_payload, _drop_id, _visible_from, _visible_to)
    returning public.markers.id into marker_id;  -- QUALIFICATO!
    return next;
  end loop;

  return;
end;
$$;

-- ENUM già esistente? lasciamo invariato; se mancasse:
do $$
begin
  if not exists (select 1 from pg_type where typname = 'reward_type') then
    create type public.reward_type as enum ('BUZZ_FREE','MESSAGE','XP_POINTS','EVENT_TICKET','BADGE');
  end if;
end$$;

-- Policy di sola lettura per utenti autenticati (se non presente)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='markers' and policyname='markers_read_auth'
  ) then
    create policy markers_read_auth on public.markers
    for select to authenticated using (true);
  end if;
end$$;