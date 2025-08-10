insert into auth.redirect_urls (id, created_at, redirect_url)
values (
  gen_random_uuid(),
  now(),
  'https://m1ssion.eu/reset.html'
)
on conflict (redirect_url) do nothing;
