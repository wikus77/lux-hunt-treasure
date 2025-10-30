-- RPC function to increment DNA attribute when cube is solved
create or replace function public.increment_dna_attribute(p_user uuid, p_attribute text)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.agent_dna
  set
    intuito     = case when p_attribute = 'intuito' then least(intuito + 1, 100) else intuito end,
    audacia     = case when p_attribute = 'audacia' then least(audacia + 1, 100) else audacia end,
    etica       = case when p_attribute = 'etica' then least(etica + 1, 100) else etica end,
    rischio     = case when p_attribute = 'rischio' then least(rischio + 1, 100) else rischio end,
    vibrazione  = case when p_attribute = 'vibrazione' then least(vibrazione + 1, 100) else vibrazione end,
    updated_at  = now()
  where user_id = p_user;
  
  return found;
end;
$$;

-- Grant execute permission
grant execute on function public.increment_dna_attribute(uuid, text) to authenticated;