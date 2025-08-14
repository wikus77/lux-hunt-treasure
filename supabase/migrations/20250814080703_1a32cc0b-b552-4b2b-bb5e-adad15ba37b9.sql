-- ========== EMERGENCY FIX: QR MAP + REDEEM (SIMPLIFIED) ==========
begin;

-- Update existing app_config with value_int for marker threshold
insert into public.app_config (key, value_int)
values ('marker_min_zoom', 17)
on conflict (key) do update
set value_int = excluded.value_int,
    updated_at = now();

-- Create or update edge function redeem-qr
create or replace function redeem_qr(code_input text)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_uuid uuid;
  qr_record record;
  existing_redemption record;
  result jsonb;
begin
  -- Get current user
  user_uuid := auth.uid();
  if user_uuid is null then
    return jsonb_build_object('status', 'error', 'error', 'unauthorized');
  end if;

  -- Get QR code
  select * into qr_record
  from public.qr_codes
  where code = upper(trim(code_input))
    and is_active = true
    and (expires_at is null or expires_at > now());
  
  if not found then
    return jsonb_build_object('status', 'error', 'error', 'invalid_or_inactive_code');
  end if;

  -- Check if already redeemed
  select * into existing_redemption
  from public.qr_redemptions
  where user_id = user_uuid and code = qr_record.code;
  
  if found then
    return jsonb_build_object('status', 'already_claimed', 'reward_type', qr_record.reward_type, 'reward_value', qr_record.reward_value);
  end if;

  -- Insert redemption
  insert into public.qr_redemptions (user_id, code, reward_type, reward_value)
  values (user_uuid, qr_record.code, qr_record.reward_type, qr_record.reward_value);

  return jsonb_build_object('status', 'ok', 'reward_type', qr_record.reward_type, 'reward_value', qr_record.reward_value);
end;
$$;

-- 3) VIEWS markers compatibili: qr_codes_markers e alias buzz_map_markers
drop view if exists public.qr_codes_markers cascade;
drop view if exists public.buzz_map_markers cascade;

-- Use actual column names from qr_codes
create view public.qr_codes_markers as
select
  code,
  title,
  (lat)::numeric as latitude,
  (lng)::numeric as longitude
from public.qr_codes
where lat is not null and lng is not null and is_hidden = false;

create view public.buzz_map_markers as
select * from public.qr_codes_markers;

grant select on public.qr_codes_markers to anon, authenticated;
grant select on public.buzz_map_markers to anon, authenticated;

commit;