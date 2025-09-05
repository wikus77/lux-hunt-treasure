-- Fix security warning: add search_path to upsert_webpush_subscription function
create or replace function public.upsert_webpush_subscription(
  p_user_id uuid,
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_platform text default 'desktop'
) returns webpush_subscriptions
language plpgsql
security definer
set search_path to 'public'
as $$
declare rec webpush_subscriptions;
begin
  if length(p_endpoint) < 16 then
    raise exception 'Endpoint too short';
  end if;
  if p_p256dh is null or p_auth is null then
    raise exception 'Missing keys';
  end if;

  insert into public.webpush_subscriptions(user_id, endpoint, p256dh, auth, platform)
  values (p_user_id, p_endpoint, p_p256dh, p_auth, coalesce(p_platform,'desktop'))
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh  = excluded.p256dh,
        auth    = excluded.auth,
        platform= excluded.platform,
        is_active = true
  returning * into rec;

  return rec;
end;
$$;