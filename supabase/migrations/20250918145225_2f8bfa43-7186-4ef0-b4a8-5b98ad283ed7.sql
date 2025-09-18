-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Idempotent function to insert markers with explicit enum cast
create or replace function public.fn_markers_bulk_insert(markers jsonb)
returns table(id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare m jsonb;
begin
  for m in select * from jsonb_array_elements(markers)
  loop
    insert into public.markers (title, lat, lng, active, visible_from, visible_to, reward_type, reward_payload, drop_id)
    values (
      m->>'title',
      (m->>'lat')::double precision,
      (m->>'lng')::double precision,
      coalesce((m->>'active')::boolean, true),
      nullif(m->>'visible_from','')::timestamptz,
      nullif(m->>'visible_to','')::timestamptz,
      (m->>'reward_type')::reward_type,
      coalesce(m->'reward_payload','{}'::jsonb),
      nullif(m->>'drop_id','')::uuid
    )
    returning id into id;
    return next;
  end loop;
end;
$$;