// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'
import { encode } from 'https://deno.land/x/djwt@v3.0.2/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendTestRequest {
  token: string;
  title: string;
  body: string;
  data?: any;
}

// Generate JWT for Firebase Auth
async function generateJWT(): Promise<string> {
  const projectId = Deno.env.get('FCM_PROJECT_ID')
  const clientEmail = Deno.env.get('FCM_CLIENT_EMAIL')
  const privateKey = Deno.env.get('FCM_PRIVATE_KEY')?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing FCM credentials')
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + 3600 // 1 hour

  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: exp,
    iat: now
  }

  // Import private key
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  return await encode({ alg: 'RS256', typ: 'JWT' }, payload, keyData)
}

// Get access token from Google OAuth2
async function getAccessToken(): Promise<string> {
  const jwt = await generateJWT()
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

// Send FCM message
async function sendFCMMessage(token: string, title: string, body: string, data: any = {}): Promise<any> {
  const projectId = Deno.env.get('FCM_PROJECT_ID')
  const accessToken = await getAccessToken()

  const message = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: data,
      webpush: {
        fcm_options: {
          link: 'https://m1ssion.eu'
        }
      }
    }
  }

  console.log('[FCM] Sending message:', JSON.stringify(message, null, 2))

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  const responseData = await response.json()
  
  if (!response.ok) {
    console.error('[FCM] Error response:', responseData)
    throw new Error(`FCM request failed: ${JSON.stringify(responseData)}`)
  }

  console.log('[FCM] Message sent successfully:', responseData)
  return responseData
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Check if user is admin (for now, we'll use service role key)
    // In production, you'd want to verify admin role from JWT

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { token, title, body, data }: SendTestRequest = await req.json()

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Token, title, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[FCM] Sending test push to token: ${token.substring(0, 20)}...`)

    const result = await sendFCMMessage(token, title, body, data || { source: 'supabase-test' })

    return new Response(
      JSON.stringify({ ok: true, messageId: result.name, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[FCM] Error in send-test-push:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})