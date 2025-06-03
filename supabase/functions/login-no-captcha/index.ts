
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()
    const email = body.email
    const redirectTo = body.redirect_to || 'capacitor://localhost/home'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo
      }
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      message: "Magic link generato per sviluppatore",
      token: data.action_link,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Errore parsing JSON o generazione magic link',
      detail: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
