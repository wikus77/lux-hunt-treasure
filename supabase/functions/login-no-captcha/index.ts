
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const { email } = await req.json()
  if (!email) {
    return new Response(JSON.stringify({ success: false, error: 'Missing email' }), { status: 400 })
  }

  console.info('[Info] 🔐 DEVELOPER AUTO-LOGIN REQUEST - START')

  const { data: users, error } = await supabaseAdmin
    .from('auth.users')
    .select('*')
    .eq('email', email)

  if (error || !users || users.length === 0) {
    console.error('[Error] ❌ Developer user not found or DB error', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Developer user not found' }),
      { status: 404 }
    )
  }

  const user = users[0]

  const sessionRes = await supabaseAdmin.auth.admin.createSession({
    user_id: user.id
  })

  if (sessionRes.error || !sessionRes.data) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to create session', details: sessionRes.error?.message }),
      { status: 500 }
    )
  }

  console.info('[Info] ✅ DEVELOPER LOGIN SUCCESS')

  return new Response(
    JSON.stringify({
      success: true,
      access_token: sessionRes.data.session.access_token,
      refresh_token: sessionRes.data.session.refresh_token,
      user: sessionRes.data.user
    }),
    { status: 200 }
  )
})
