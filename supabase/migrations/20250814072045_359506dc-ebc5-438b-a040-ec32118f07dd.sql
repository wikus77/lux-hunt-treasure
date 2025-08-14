-- 🔒 EMERGENCY ROLLBACK (MARKERS + RLS + VIEW COMPATIBILITA')
begin;

-- 1) POLICY: rendi leggibili i marker come prima (sia anon che auth)
drop policy if exists qr_codes_select_auth on public.qr_codes;
drop policy if exists qr_codes_select_anon on public.qr_codes;
create policy qr_codes_select_auth on public.qr_codes
  for select to authenticated using (true);
create policy qr_codes_select_anon on public.qr_codes
  for select to anon using (true);

-- 2) Allinea tipi premio come versione funzionante (reward_value = text; colonne non obbligatorie)
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='qr_codes' and column_name='reward_type') then
    alter table public.qr_codes
      alter column reward_type drop not null,
      alter column reward_type drop default;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='qr_codes' and column_name='reward_value') then
    if exists (select 1 from information_schema.columns
               where table_schema='public' and table_name='qr_codes'
                 and column_name='reward_value' and data_type <> 'text') then
      alter table public.qr_codes
        alter column reward_value type text using reward_value::text;
    end if;
    alter table public.qr_codes
      alter column reward_value drop not null,
      alter column reward_value drop default;
  end if;
end$$;

-- 3) VIEW di compatibilità per i marker (gestisce sia lat/lng che latitude/longitude e name/position_name)
do $$
declare
  has_lat bool; has_lng bool; has_latitude bool; has_longitude bool; has_name bool; has_posname bool;
begin
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='qr_codes' and column_name='lat') into has_lat;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='qr_codes' and column_name='lng') into has_lng;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='qr_codes' and column_name='latitude') into has_latitude;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='qr_codes' and column_name='longitude') into has_longitude;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='qr_codes' and column_name='name') into has_name;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='qr_codes' and column_name='position_name') into has_posname;

  execute 'drop view if exists public.qr_codes_markers cascade';
  execute 'drop view if exists public.buzz_map_markers cascade';

  execute format($v$
    create view public.qr_codes_markers as
    select
      code,
      coalesce(
        %s,        -- position_name se presente
        %s,        -- name se presente
        code::text -- fallback
      ) as title,
      (%s)::numeric as latitude,
      (%s)::numeric as longitude
    from public.qr_codes
    where ( %s is not null ) and ( %s is not null );
  $v$,
    case when has_posname then 'position_name' when has_name then 'name' else 'null' end,
    case when has_name then 'name' else 'null' end,
    case when has_latitude then 'latitude' when has_lat then 'lat' else 'null' end,
    case when has_longitude then 'longitude' when has_lng then 'lng' else 'null' end,
    case when has_latitude then 'latitude' when has_lat then 'lat' else 'null' end,
    case when has_longitude then 'longitude' when has_lng then 'lng' else 'null' end
  );

  -- alias storico usato dalla mappa
  execute 'create view public.buzz_map_markers as select * from public.qr_codes_markers';
end$$;

-- 4) Permessi di lettura sulle view
grant select on public.qr_codes_markers to anon, authenticated;
grant select on public.buzz_map_markers to anon, authenticated;

commit;