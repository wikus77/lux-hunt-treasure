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

    const up = decodeURIComponent(raw).trim().toUpperCase()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const s = createClient(supabaseUrl, serviceKey)

    // Read minimal fields known to exist (case-insensitive code match)
    const { data: qr, error } = await s
      .from('qr_codes')
      .select('code,is_active,reward_type,title,lat,lng,message,expires_at,reward_buzz')
      .ilike('code', up)
      .maybeSingle()

    if (error) throw error

    const expired = qr?.expires_at ? new Date(qr.expires_at as any) <= new Date() : false
    if (!qr || qr.is_active !== true || expired) {
      console.log({ op: 'validate', code: up, valid: false, reason: 'not_found_inactive_or_expired' })
      return new Response(JSON.stringify({ valid: false }), {
        status: 404,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const payload = {
      valid: true,
      reward: { type: 'buzz_credit', buzz: Number((qr as any).reward_buzz ?? 1) },
      one_time: true,
      tag: qr.reward_type || 'buzz_credit',
      title: qr.title || null,
      lat: (qr as any).lat ?? null,
      lng: (qr as any).lng ?? null,
      message: (qr as any).message ?? null,
    }

    console.log({ op: 'validate', code: up, valid: true })
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
