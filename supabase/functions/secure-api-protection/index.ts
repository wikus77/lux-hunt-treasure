// © 2025 Joseph MULÉ – M1SSION™- ALL RIGHTS RESERVED - NIYVORA KFT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1ssion-sig',
}

// HMAC secret for signature verification (should be set in Supabase secrets)
const HMAC_SECRET = Deno.env.get('M1SSION_HMAC_SECRET') || 'default-secret-change-me'
const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52'

interface SecurityValidationResult {
  success: boolean
  statusCode: number
  error?: string
  userId?: string
  userEmail?: string
  ipAddress?: string
}

// Utility function to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return '0.0.0.0' // fallback
}

// Utility function to calculate SHA-256
async function calculateSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Utility function to verify HMAC signature
async function verifyHMACSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const signatureBuffer = new Uint8Array(
      signature.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
    )
    
    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(payload)
    )
  } catch (error) {
    console.error('HMAC verification error:', error)
    return false
  }
}

// Main security validation function
async function validateSecurity(req: Request, endpoint: string): Promise<SecurityValidationResult> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const ipAddress = getClientIP(req)
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const authHeader = req.headers.get('authorization')
  const hmacSignature = req.headers.get('x-m1ssion-sig')

  console.log(`🔒 Security validation for ${endpoint} from IP: ${ipAddress}`)

  // 1. Check if IP is blocked
  const { data: isBlocked } = await supabase.rpc('is_ip_blocked', { ip_addr: ipAddress })
  if (isBlocked) {
    console.log(`🚫 IP ${ipAddress} is blocked`)
    return {
      success: false,
      statusCode: 403,
      error: 'IP_BLOCKED',
      ipAddress
    }
  }

  // 2. Check rate limit
  const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
    ip_addr: ipAddress,
    api_endpoint: endpoint,
    max_requests: 3,
    window_minutes: 1
  })

  if (!rateLimitOk) {
    console.log(`⏱️ Rate limit exceeded for IP ${ipAddress} on ${endpoint}`)
    
    // Block IP after rate limit exceeded
    await supabase.rpc('block_ip', {
      ip_addr: ipAddress,
      block_duration_minutes: 30,
      block_reason: `rate_limit_exceeded_${endpoint}`
    })

    return {
      success: false,
      statusCode: 429,
      error: 'RATE_LIMIT_EXCEEDED',
      ipAddress
    }
  }

  // 3. Verify JWT token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔐 Missing or invalid authorization header')
    return {
      success: false,
      statusCode: 401,
      error: 'MISSING_AUTH_TOKEN',
      ipAddress
    }
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    console.log('🔐 Invalid JWT token:', authError?.message)
    return {
      success: false,
      statusCode: 401,
      error: 'INVALID_TOKEN',
      ipAddress
    }
  }

  // 4. Verify email hash
  if (!user.email) {
    console.log('🔐 User has no email')
    return {
      success: false,
      statusCode: 401,
      error: 'NO_EMAIL',
      ipAddress,
      userId: user.id
    }
  }

  const emailHash = await calculateSHA256(user.email)
  if (emailHash !== AUTHORIZED_EMAIL_HASH) {
    console.log(`🔐 Unauthorized email hash. Expected: ${AUTHORIZED_EMAIL_HASH}, Got: ${emailHash}`)
    return {
      success: false,
      statusCode: 403,
      error: 'UNAUTHORIZED_EMAIL',
      ipAddress,
      userId: user.id,
      userEmail: user.email
    }
  }

  // 5. Verify HMAC signature (optional but recommended)
  if (hmacSignature) {
    const timestamp = Math.floor(Date.now() / 1000)
    const payload = `${endpoint}:${user.id}:${timestamp}`
    
    const isValidSignature = await verifyHMACSignature(payload, hmacSignature, HMAC_SECRET)
    if (!isValidSignature) {
      console.log('🔐 Invalid HMAC signature')
      return {
        success: false,
        statusCode: 403,
        error: 'INVALID_SIGNATURE',
        ipAddress,
        userId: user.id,
        userEmail: user.email
      }
    }
  }

  console.log(`✅ Security validation passed for user ${user.email}`)
  return {
    success: true,
    statusCode: 200,
    userId: user.id,
    userEmail: user.email,
    ipAddress
  }
}

// Log access attempt
async function logAccessAttempt(
  supabase: any,
  validation: SecurityValidationResult,
  endpoint: string,
  userAgent: string
) {
  await supabase.from('admin_logs').insert({
    event_type: validation.success ? 'api_access_granted' : 'api_access_denied',
    user_id: validation.userId || null,
    context: `API endpoint: ${endpoint}`,
    note: validation.error || 'success',
    device: userAgent,
    ip_address: validation.ipAddress,
    route: endpoint,
    status_code: validation.statusCode,
    reason: validation.error || 'authorized_access'
  })
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const endpoint = url.pathname
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log(`🔒 API Protection request for ${endpoint}`)

    // Validate security
    const validation = await validateSecurity(req, endpoint)

    // Log the attempt
    await logAccessAttempt(supabase, validation, endpoint, userAgent)

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: validation.error,
          message: 'Access denied',
          statusCode: validation.statusCode
        }),
        {
          status: validation.statusCode,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // If validation passed, return success with user info
    return new Response(
      JSON.stringify({
        success: true,
        userId: validation.userId,
        userEmail: validation.userEmail,
        ipAddress: validation.ipAddress,
        message: 'Access granted'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('🚨 API Protection error:', error)
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: 'Security validation failed'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})