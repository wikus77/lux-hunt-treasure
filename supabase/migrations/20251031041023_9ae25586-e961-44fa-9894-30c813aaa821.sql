-- Health check RPC for Mind Fractal 3D
-- Returns OK status and counts for user's links and milestones

create or replace function mf_health()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_links_count bigint;
  v_milestones_count bigint;
begin
  -- Get authenticated user
  v_user_id := auth.uid();
  
  if v_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'Not authenticated'
    );
  end if;
  
  -- Count links
  select count(*) into v_links_count
  from dna_mind_links
  where user_id = v_user_id;
  
  -- Count milestones
  select count(*) into v_milestones_count
  from dna_mind_milestones
  where user_id = v_user_id;
  
  return jsonb_build_object(
    'ok', true,
    'links', v_links_count,
    'milestones', v_milestones_count,
    'timestamp', now()
  );
end;
$$;

-- Grant execute to authenticated users
grant execute on function mf_health() to authenticated;

comment on function mf_health() is 'Health check for Mind Fractal 3D - returns user link and milestone counts';

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™