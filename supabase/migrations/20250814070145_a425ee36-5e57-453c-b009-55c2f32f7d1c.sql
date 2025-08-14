-- ROLLBACK EMERGENZA: riportiamo tipi/campi/policy a uno stato compatibile con la versione funzionante

begin;

-- === 1) qr_codes: assicurati che i campi premio siano liberi e testuali ===
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
    -- se non è text, riportalo a text
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

-- === 2) qr_redemptions: stessi allentamenti per compatibilità ===
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='qr_redemptions' and column_name='reward_type') then
    alter table public.qr_redemptions
      alter column reward_type drop not null,
      alter column reward_type drop default;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='qr_redemptions' and column_name='reward_value') then
    if exists (select 1 from information_schema.columns
               where table_schema='public' and table_name='qr_redemptions'
                 and column_name='reward_value' and data_type <> 'text') then
      alter table public.qr_redemptions
        alter column reward_value type text using reward_value::text;
    end if;
    alter table public.qr_redemptions
      alter column reward_value drop not null,
      alter column reward_value drop default;
  end if;
end$$;

-- === 3) qr_redemption_logs: rimuovi colonne/trigger/indici extra introdotti ===
drop trigger if exists trg_sync_qr_log_cols on public.qr_redemption_logs;
drop function if exists public.sync_qr_log_cols();

alter table if exists public.qr_redemption_logs
  drop column if exists code,
  drop column if exists qr_code_id,
  drop column if exists status,
  drop column if exists details;

-- togli default creato in migrazione
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='qr_redemption_logs'
               and column_name='created_at' and column_default is not null) then
    alter table public.qr_redemption_logs
      alter column created_at drop default;
  end if;
end$$;

drop index if exists public.uq_qr_redemptions_user_code;
drop index if exists public.idx_qr_logs_user;
drop index if exists public.idx_qr_logs_code;

-- === 4) RLS: riapri la lettura dei marker e il redeem come prima ===
-- Se la mappa è pubblica ANON, abilita anche ANON; se vuoi solo utenti loggati, elimina la policy ANON.
drop policy if exists qr_codes_select_auth on public.qr_codes;
drop policy if exists qr_codes_select_anon on public.qr_codes;
create policy qr_codes_select_auth on public.qr_codes
  for select to authenticated using (true);
create policy qr_codes_select_anon on public.qr_codes
  for select to anon using (true);

drop policy if exists qr_redemptions_select_own on public.qr_redemptions;
drop policy if exists qr_redemptions_insert_own on public.qr_redemptions;
create policy qr_redemptions_select_own on public.qr_redemptions
  for select to authenticated using (auth.uid() = user_id);
create policy qr_redemptions_insert_own on public.qr_redemptions
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists qr_redemption_logs_select_own on public.qr_redemption_logs;
create policy qr_redemption_logs_select_own on public.qr_redemption_logs
  for select to authenticated using (auth.uid() = user_id);

-- === 5) (OPZIONALE MA UTILE) crea una view markers di compatibilità, nel caso quella precedente sia stata droppata ===
-- Se la tua app legge già da public.qr_codes, questo non serve; ma non nuoce.
-- Adattabile ai nomi colonna più comuni: latitude/longitude oppure lat/lng e name/position_name.
do $$
declare
  has_lat bool;
  has_lng bool;
  has_latitude bool;
  has_longitude bool;
  has_name bool;
  has_posname bool;
begin
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='qr_codes' and column_name='lat')
  into has_lat;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='qr_codes' and column_name='lng')
  into has_lng;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='qr_codes' and column_name='latitude')
  into has_latitude;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='qr_codes' and column_name='longitude')
  into has_longitude;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='qr_codes' and column_name='name')
  into has_name;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='qr_codes' and column_name='position_name')
  into has_posname;

  -- drop e ricrea due alias di view comuni, così la UI trova almeno uno dei nomi
  execute 'drop view if exists public.qr_codes_markers cascade';
  execute 'drop view if exists public.buzz_map_markers cascade';

  execute format($v$
    create view public.qr_codes_markers as
    select
      code,
      coalesce(
        %s,
        %s,
        code
      ) as title,
      (%s)::numeric as latitude,
      (%s)::numeric as longitude
    from public.qr_codes
    where true
  $v$,
    case when has_posname then 'position_name' when has_name then 'name' else 'null' end,
    case when has_name then 'name' else 'null' end,
    case when has_latitude then 'latitude' when has_lat then 'lat' else 'null' end,
    case when has_longitude then 'longitude' when has_lng then 'lng' else 'null' end
  );

  execute 'create view public.buzz_map_markers as select * from public.qr_codes_markers';
end$$;

-- Concedi lettura alle stesse audience dei marker
grant select on public.qr_codes_markers to anon, authenticated;
grant select on public.buzz_map_markers to anon, authenticated;

commit;