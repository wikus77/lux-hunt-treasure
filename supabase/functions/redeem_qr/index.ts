// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// CORS allowlist handling
const ALLOWED_ORIGINS = new Set([
  'https://m1ssion.com',
  'https://www.m1ssion.com',
  'https://m1ssion.pages.dev',
  'http://localhost:5173',
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
    const { code } = await req.json().catch(() => ({ code: null }))
    if (!code) {
      return new Response('Missing code', { status: 400, headers: corsHeaders })
    }

    const url = Deno.env.get('SUPABASE_URL')!
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
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
