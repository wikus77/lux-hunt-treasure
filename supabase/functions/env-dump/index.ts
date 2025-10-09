Deno.serve(async ()=>{
  const need = [
    "SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PROJECT_REF",
    "SUPABASE_URL",
    "POSTGREST_URL"
  ];
  const env = Deno.env.toObject();
  const present = Object.fromEntries(need.map((k)=>[
      k,
      Boolean(env[k])
    ]));
  return new Response(JSON.stringify({
    present,
    env_keys: Object.keys(env).sort()
  }), {
    headers: {
      "content-type": "application/json"
    }
  });
});
