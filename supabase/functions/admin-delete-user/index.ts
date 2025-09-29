import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Authorized admin email hash (SHA-256)
const AUTHORIZED_EMAIL_HASH = 'b8c6b53e032c9755b6e39dce07b9b8456e8c6e1b9c8f0a6b2e39dce7b9b8456e'

// Hash function for email verification
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(email.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    
    // Verify JWT and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JWT or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify admin privileges by email hash
    const userEmailHash = await hashEmail(user.email || '')
    if (userEmailHash !== AUTHORIZED_EMAIL_HASH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient privileges - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body = await req.json()
    const { user_id } = body

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete from auth.users (this will cascade to profiles due to foreign key)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user_id)
    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to delete user from auth: ${deleteAuthError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Also explicitly delete from profiles table to be sure
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id)

    if (deleteProfileError) {
      console.warn('Warning deleting profile:', deleteProfileError.message)
      // Don't fail here as auth deletion was successful
    }

    // Log the action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        event_type: 'user_deleted',
        user_id: user.id,
        details: {
          deleted_user_id: user_id,
          deleted_by: user.email,
          timestamp: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        deleted_user_id: user_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in admin-delete-user function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})