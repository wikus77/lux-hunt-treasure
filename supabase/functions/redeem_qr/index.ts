// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// CORS allowlist handling
const ALLOWED_ORIGINS = new Set([
  'https://m1ssion.com',
  'https://www.m1ssion.com',
  'https://m1ssion.eu',
  'https://www.m1ssion.eu',
  'https://m1ssion.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

function buildCorsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://m1ssion.com'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  const corsHeaders = buildCorsHeaders(origin)

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') || ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!bearer) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${bearer}` } } })
    const svc = createClient(url, service)

    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData?.user) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }
    const uid = userData.user.id

    const { code } = await req.json().catch(() => ({ code: null }))
    if (!code) {
      return new Response('Missing code', { status: 400, headers: corsHeaders })
    }

    // load qr with validation
    const up = String(code).trim().toUpperCase()
    const { data: qr, error: qe } = await svc
      .from('qr_codes')
      .select('code,is_active,reward_type,title,expires_at,reward_buzz')
      .eq('code', up)
      .maybeSingle()
    if (qe) throw qe
    const expired = qr?.expires_at ? new Date(qr.expires_at as any) <= new Date() : false
    if (!qr || qr.is_active !== true || expired) {
      return new Response('invalid_or_expired', { status: 404, headers: corsHeaders })
    }

    // idempotent redemption via unique constraint
    const { error: insErr } = await svc.from('qr_redemptions').insert({ code: up, user_id: uid, meta: { reward_type: qr.reward_type, title: qr.title } })
    if (insErr) {
      if ((insErr as any).code === '23505') {
        return new Response(JSON.stringify({ error: 'already_redeemed' }), {
          status: 409,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        })
      }
      throw insErr
    }

    // mark as used (idempotent)
    if (qr.is_active) {
      const { error: ue } = await svc
        .from('qr_codes')
        .update({ is_active: false })
        .eq('code', up)
      if (ue) throw ue
    }

    // optional notification entry
    await svc.from('user_notifications').insert({
      title: 'QR riscattato',
      content: `Hai riscattato ${qr.title || up}`,
      type: 'general',
      user_id: uid,
    })

    const payload = { ok: true, code: up, reward: { type: 'buzz_credit', buzz: Number((qr as any).reward_buzz ?? 1) }, tag: qr.reward_type || 'buzz_credit' }
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(String(e?.message || e), { status: 500, headers: corsHeaders })
  }
})
