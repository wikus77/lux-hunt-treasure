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

// Generate random coordinates within Italy bounds
function generateRandomCoordinates() {
  // Italy bounding box (approximate)
  const minLat = 36.0
  const maxLat = 47.5
  const minLng = 6.5
  const maxLng = 18.8
  
  const lat = Math.random() * (maxLat - minLat) + minLat
  const lng = Math.random() * (maxLng - minLng) + minLng
  
  return { lat, lng }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
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
    const { distributions, visibilityHours } = body

    if (!distributions || !Array.isArray(distributions)) {
      return new Response(
        JSON.stringify({ success: false, error: 'distributions array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!visibilityHours || visibilityHours < 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'visibilityHours must be >= 1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate distributions
    for (const dist of distributions) {
      if (!dist.type || !dist.count || dist.count < 1) {
        return new Response(
          JSON.stringify({ success: false, error: 'Each distribution must have type and count >= 1' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (dist.type === 'message' && (!dist.text || dist.text.trim().length === 0)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Message type distributions must have non-empty text' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (dist.type === 'xp_points' && (!dist.points || dist.points < 1)) {
        return new Response(
          JSON.stringify({ success: false, error: 'XP Points distributions must have points >= 1' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Calculate visibility end time
    const visibleFrom = new Date()
    const visibleTo = new Date(visibleFrom.getTime() + (visibilityHours * 60 * 60 * 1000))

    // Generate markers for each distribution
    const markersToInsert = []
    const createdDetails = []

    for (const dist of distributions) {
      for (let i = 0; i < dist.count; i++) {
        const coords = generateRandomCoordinates()
        
        let markerData: any = {
          lat: coords.lat,
          lng: coords.lng,
          active: true,
          visible_from: visibleFrom.toISOString(),
          visible_to: visibleTo.toISOString(),
          user_id: user.id,
          source: 'admin_bulk_drop',
          radius_km: 0.1, // Default 100m radius
          created_at: new Date().toISOString()
        }

        // Set marker-specific data based on type
        switch (dist.type) {
          case 'message':
            markerData.message_text = dist.text
            markerData.level = 1
            break
          case 'buzz_free':
            markerData.level = 2
            markerData.price_eur = 0 // Free
            break
          case 'xp_points':
            markerData.level = 3
            markerData.price_eur = 0 // Free
            // Note: XP points would be handled by the client when marker is collected
            break
        }

        markersToInsert.push(markerData)
      }
      
      createdDetails.push({
        type: dist.type,
        count: dist.count,
        ...(dist.text && { text: dist.text }),
        ...(dist.points && { points: dist.points })
      })
    }

    // Insert all markers at once
    const { data: insertedMarkers, error: insertError } = await supabaseAdmin
      .from('markers')
      .insert(markersToInsert)
      .select('id')

    if (insertError) {
      console.error('Error inserting markers:', insertError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create markers: ${insertError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the bulk creation action
    await supabaseAdmin
      .from('admin_logs')
      .insert({
        event_type: 'bulk_marker_created',
        user_id: user.id,
        details: {
          created_count: markersToInsert.length,
          distributions: createdDetails,
          visibility_hours: visibilityHours,
          created_by: user.email,
          timestamp: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        created: markersToInsert.length,
        details: createdDetails,
        timestamp: new Date().toISOString(),
        marker_ids: insertedMarkers?.map(m => m.id) || []
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-random-markers function:', error)
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