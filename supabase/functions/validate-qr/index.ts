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
    const url = new URL(req.url)
    const raw = url.searchParams.get('c')
    if (!raw) {
      return new Response(JSON.stringify({ valid: false, reason: 'missing_code' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const code = decodeURIComponent(raw).trim()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const s = createClient(supabaseUrl, serviceKey)

    // Read minimal fields known to exist
    const { data: qr, error } = await s
      .from('qr_codes')
      .select('code,is_active,reward_type,title')
      .eq('code', code)
      .maybeSingle()

    if (error) throw error

    if (!qr || qr.is_active !== true) {
      console.log({ op: 'validate', code, valid: false, reason: 'not_found_or_inactive' })
      return new Response(JSON.stringify({ valid: false }), {
        status: 404,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const payload = {
      valid: true,
      reward: { buzz: 1 }, // valore placeholder, la logica ricompense rimane lato server
      one_time: true,
      tag: qr.reward_type || 'buzz_credit',
      title: qr.title || null,
    }

    console.log({ op: 'validate', code, valid: true })
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get('Origin')), 'content-type': 'application/json' },
    })
  }
})
