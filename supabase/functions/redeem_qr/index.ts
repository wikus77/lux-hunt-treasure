// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// CORS allowlist handling (dynamic, supports previews)
const STATIC = new Set([
  'https://m1ssion.com',
  'https://www.m1ssion.com',
  'https://m1ssion.pages.dev',
  'http://localhost:5173',
])

function allowOrigin(origin: string | null) {
  if (!origin) return 'https://m1ssion.com'
  try {
    const h = new URL(origin).hostname
    if (STATIC.has(origin)) return origin
    if (h.endsWith('.lovable.dev') || h === 'lovable.dev') return origin
    if (h.endsWith('.lovableproject.com') || h === 'lovableproject.com') return origin
    return 'https://m1ssion.com'
  } catch {
    return 'https://m1ssion.com'
  }
}

function buildCorsHeaders(origin: string | null) {
  const o = allowOrigin(origin)
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  const corsHeaders = buildCorsHeaders(origin)
  try { console.log({ op: 'cors', origin, allow: corsHeaders['Access-Control-Allow-Origin'] }) } catch {}


  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const { code } = await req.json().catch(() => ({ code: null }))
    if (!code) {
      return new Response('Missing code', { status: 400, headers: corsHeaders })
    }

    const url = Deno.env.get('SUPABASE_URL')!
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Require JWT: validate Authorization header via Supabase Auth
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const sAuth = createClient(url, key, { global: { headers: { Authorization: authHeader } } })
    const { data: authData, error: authError } = await sAuth.auth.getUser()
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const s = createClient(url, key)

    // load qr
    const { data: qr, error: qe } = await s
      .from('qr_codes')
      .select('code,is_active,reward_type,title')
      .eq('code', code)
      .maybeSingle()
    if (qe) throw qe
    if (!qr) {
      return new Response('Not found', { status: 404, headers: corsHeaders })
    }

// mark as used (idempotent)
    if (!qr.is_active) {
      console.log({ op: 'redeem', code, result: 'already_redeemed' })
      return new Response(JSON.stringify({ error: 'already_redeemed' }), {
        status: 409,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const { error: ue } = await s
      .from('qr_codes')
      .update({ is_active: false })
      .eq('code', code)
    if (ue) throw ue

    // optional notification entry
    await s.from('user_notifications').insert({
      title: 'QR riscattato',
      content: `Hai riscattato ${qr.title || code}`,
      type: 'general',
    })

    console.log({ op: 'redeem', code, result: 'ok' })
    return new Response(JSON.stringify({ ok: true, code }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(String(e?.message || e), { status: 500, headers: corsHeaders })
  }
})
