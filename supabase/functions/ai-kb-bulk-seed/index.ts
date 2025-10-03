// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: ai-kb-bulk-seed
// ADMIN-ONLY: Bulk seed knowledge base with initial documents

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkDocument {
  title: string;
  body_md: string;
  tags: string[];
  category?: string;
  locale?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();
  console.log(`[ai-kb-bulk-seed] traceId:${traceId} start`);

  try {
    // Auth check: only admin or service role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { documents } = await req.json() as { documents: BulkDocument[] };

    if (!Array.isArray(documents) || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid documents array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[ai-kb-bulk-seed] traceId:${traceId} processing ${documents.length} documents`);

    const results = [];
    const errors = [];

    // Process each document via ai-kb-upsert
    for (const doc of documents) {
      try {
        const upsertResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-kb-upsert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc)
        });

        const upsertData = await upsertResponse.json();

        if (!upsertResponse.ok) {
          errors.push({ title: doc.title, error: upsertData.error });
          console.error(`[ai-kb-bulk-seed] Failed to upsert "${doc.title}":`, upsertData.error);
        } else {
          results.push({ title: doc.title, status: 'success', chunks: upsertData.chunks });
          console.log(`[ai-kb-bulk-seed] Successfully upserted "${doc.title}": ${upsertData.chunks} chunks`);
        }
      } catch (error) {
        errors.push({ title: doc.title, error: error.message });
        console.error(`[ai-kb-bulk-seed] Exception for "${doc.title}":`, error);
      }
    }

    console.log(`[ai-kb-bulk-seed] traceId:${traceId} completed: ${results.length} success, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        total: documents.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[ai-kb-bulk-seed] traceId:${traceId} error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
