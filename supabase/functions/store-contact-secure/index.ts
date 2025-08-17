// Secure Contact Data Storage Edge Function
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
}

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client with service role for secure database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const contactData: ContactData = await req.json();
    
    if (!contactData.name || !contactData.email || !contactData.message) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: name, email, message' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Securely store contact data using service role (bypasses RLS for authorized storage)
    const { error: insertError } = await supabase
      .from('contacts')
      .insert([{
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || null,
        subject: contactData.subject || null,
        message: contactData.message
      }]);

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to store contact information' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log security event
    await supabase
      .from('admin_logs')
      .insert({
        event_type: 'secure_contact_submitted',
        details: {
          has_phone: !!contactData.phone,
          has_subject: !!contactData.subject,
          email_domain: contactData.email.split('@')[1],
          timestamp: new Date().toISOString(),
          method: 'edge_function'
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact form submitted successfully' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact storage error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});