-- READ-ONLY VERIFICATION — EMAIL AUTO INFRA

-- 0) Tables exist?
select
  (to_regclass('public.email_sends') is not null) as email_sends_exists,
  (to_regclass('public.email_send_config') is not null) as email_send_config_exists,
  (to_regclass('public.prize_claims') is not null) as prize_claims_exists,
  (to_regclass('public.final_shoot_winners') is not null) as final_shoot_winners_exists;

-- 1) Columns (prize_claims)
select column_name, data_type
from information_schema.columns
where table_schema='public' and table_name='prize_claims'
order by ordinal_position;

-- 2) Columns (final_shoot_winners)
select column_name, data_type
from information_schema.columns
where table_schema='public' and table_name='final_shoot_winners'
order by ordinal_position;

-- 3) Triggers (enabled + definition)
select
  t.tgname,
  c.relname as table_name,
  n.nspname as schema_name,
  t.tgenabled,
  pg_get_triggerdef(t.oid, true) as trigger_def
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public'
  and t.tgname in ('trigger_email_marker_physical_prize','trigger_email_final_shoot_winner')
order by t.tgname;

-- 4) Functions exist + security definer?
select
  p.proname,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) as fn_def
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in ('queue_and_invoke_marker_prize_email','queue_and_invoke_final_shoot_winner_email')
order by p.proname;

-- 5) pg_net extension?
select exists(
  select 1 from pg_extension where extname='pg_net'
) as pg_net_installed;

-- 6) email_send_config row + base_url/auth_token status (no secrets)
select
  count(*) as rows_count,
  case when max(base_url) is null then 'NULL' else 'SET' end as base_url_status,
  case when max(auth_token) is null then 'NULL' else 'SET' end as auth_token_status
from public.email_send_config;

-- 7) email_sends last rows
select
  id,
  template_id,
  status,
  error_code,
  created_at,
  sent_at
from public.email_sends
order by created_at desc
limit 50;

-- 8) net schema tables
select table_schema, table_name
from information_schema.tables
where table_schema='net'
order by table_name;

-- 9) net.http_request_queue columns (to fix your created_at error)
select column_name, data_type
from information_schema.columns
where table_schema='net' and table_name='http_request_queue'
order by ordinal_position;

-- 10) net.http_response columns (to fix your composite type error)
select column_name, data_type
from information_schema.columns
where table_schema='net' and table_name='http_response'
order by ordinal_position;

-- 11) If http_request_queue has a time column, pull last 20 using that column (auto-pick)
do $$
declare
  col text;
begin
  select c.column_name into col
  from information_schema.columns c
  where c.table_schema='net' and c.table_name='http_request_queue'
    and c.column_name in ('created_at','inserted_at','queued_at','requested_at','enqueued_at','ts')
  order by case c.column_name
    when 'created_at' then 1
    when 'inserted_at' then 2
    when 'queued_at' then 3
    when 'requested_at' then 4
    when 'enqueued_at' then 5
    when 'ts' then 6
    else 99 end
  limit 1;

  if col is not null then
    execute format('select * from net.http_request_queue order by %I desc limit 20', col);
  else
    raise notice 'No known timestamp column found in net.http_request_queue';
  end if;
end $$;

