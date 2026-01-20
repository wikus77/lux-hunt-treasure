/**
 * M1SSION™ IAP Restore Subscription Edge Function
 * Restores subscriptions on new device or reinstall
 * 
 * ENTERPRISE HARDENING: Rate Limiting + Structured Logging
 * 
 * © 2026 Joseph MULÉ – NIYVORA KFT™ – ALL RIGHTS RESERVED
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  checkRateLimit, 
  rateLimitResponse, 
  generateCorrelationId,
  structuredLog,
  getRateLimitHeaders
} from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APPLE_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';

interface RestoreRequest {
  platform: 'ios' | 'android';
  receipt_data?: string;        // iOS
  purchase_tokens?: string[];   // Android - array of active subscription tokens
}

interface RestoreResponse {
  success: boolean;
  entitlements: {
    sub_tier: string;
    sub_status: string;
    sub_expires_at: string | null;
    is_active: boolean;
  };
  balance: number;
  restored_products: string[];
  error?: string;
}

serve(async (req) => {
  const correlationId = generateCorrelationId();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization', correlation_id: correlationId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token', correlation_id: correlationId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================
    // RATE LIMITING
    // =====================
    const rateLimitResult = await checkRateLimit(
      supabaseAdmin,
      user.id,
      'user',
      'restore-iap-subscription'
    );

    if (!rateLimitResult.allowed) {
      structuredLog('warn', 'Rate limit exceeded for restore', correlationId, { userId: user.id });
      return rateLimitResponse(rateLimitResult, correlationId);
    }

    structuredLog('info', 'Processing restore request', correlationId, { userId: user.id });

    const body: RestoreRequest = await req.json();
    const { platform, receipt_data, purchase_tokens } = body;

    const restoredProducts: string[] = [];
    let highestTier: string | null = null;
    let latestExpiry: Date | null = null;

    // =====================
    // iOS RESTORE
    // =====================
    
    if (platform === 'ios' && receipt_data) {
      // Verify receipt with Apple
      const verifyUrl = Deno.env.get('IAP_SANDBOX') === 'true'
        ? 'https://sandbox.itunes.apple.com/verifyReceipt'
        : 'https://buy.itunes.apple.com/verifyReceipt';

      let response = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'receipt-data': receipt_data,
          'password': APPLE_SHARED_SECRET,
          'exclude-old-transactions': false
        })
      });

      let result = await response.json();

      // Handle sandbox receipt in production
      if (result.status === 21007) {
        response = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'receipt-data': receipt_data,
            'password': APPLE_SHARED_SECRET,
            'exclude-old-transactions': false
          })
        });
        result = await response.json();
      }

      if (result.status === 0) {
        // Process latest_receipt_info for subscriptions
        const latestReceipts = result.latest_receipt_info || [];
        
        for (const item of latestReceipts) {
          const productId = item.product_id;
          const expiresDate = new Date(parseInt(item.expires_date_ms));
          const isActive = expiresDate > new Date();

          if (isActive) {
            restoredProducts.push(productId);
            
            // Get product details
            const { data: product } = await supabaseAdmin
              .from('iap_products')
              .select('tier')
              .eq('ios_sku', productId)
              .single();

            if (product?.tier) {
              // Track highest tier
              const tierRank = { silver: 1, gold: 2, black: 3, titanium: 4 };
              if (!highestTier || tierRank[product.tier as keyof typeof tierRank] > tierRank[highestTier as keyof typeof tierRank]) {
                highestTier = product.tier;
              }
              if (!latestExpiry || expiresDate > latestExpiry) {
                latestExpiry = expiresDate;
              }
            }
          }
        }
      }
    }

    // =====================
    // ANDROID RESTORE
    // =====================
    
    if (platform === 'android' && purchase_tokens && purchase_tokens.length > 0) {
      // For each purchase token, verify with Google
      // (simplified - in production, implement full Google verification)
      
      for (const token of purchase_tokens) {
        // Check if we have a verified transaction for this token
        const { data: txn } = await supabaseAdmin
          .from('iap_transactions')
          .select('product_id, created_at')
          .eq('purchase_token', token)
          .eq('status', 'verified')
          .single();

        if (txn) {
          const { data: product } = await supabaseAdmin
            .from('iap_products')
            .select('tier, product_id')
            .eq('product_id', txn.product_id)
            .single();

          if (product?.tier) {
            restoredProducts.push(product.product_id);
            
            const tierRank = { silver: 1, gold: 2, black: 3, titanium: 4 };
            if (!highestTier || tierRank[product.tier as keyof typeof tierRank] > tierRank[highestTier as keyof typeof tierRank]) {
              highestTier = product.tier;
            }
            
            // Estimate expiry (30 days from purchase)
            const purchaseDate = new Date(txn.created_at);
            const expiry = new Date(purchaseDate);
            expiry.setDate(expiry.getDate() + 30);
            
            if (expiry > new Date() && (!latestExpiry || expiry > latestExpiry)) {
              latestExpiry = expiry;
            }
          }
        }
      }
    }

    // =====================
    // UPDATE ENTITLEMENTS
    // =====================
    
    if (highestTier && latestExpiry && latestExpiry > new Date()) {
      await supabaseAdmin
        .from('user_entitlements')
        .upsert({
          user_id: user.id,
          sub_tier: highestTier,
          sub_status: 'active',
          sub_expires_at: latestExpiry.toISOString(),
          sub_platform: platform,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Also update profiles
      await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_tier: highestTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Audit log
      await supabaseAdmin.rpc('log_iap_audit', {
        p_user_id: user.id,
        p_action: 'SUBSCRIPTION_RESTORED',
        p_details: { 
          platform, 
          tier: highestTier, 
          expires_at: latestExpiry.toISOString(),
          restored_products: restoredProducts
        }
      });
    }

    // =====================
    // GET FINAL STATE
    // =====================
    
    const { data: entitlements } = await supabaseAdmin.rpc('get_user_entitlements', { p_user_id: user.id });
    const { data: balance } = await supabaseAdmin.rpc('get_user_m1u_balance', { p_user_id: user.id });

    structuredLog('info', 'Restore completed', correlationId, {
      userId: user.id,
      platform,
      restoredCount: restoredProducts.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        entitlements: entitlements || {
          sub_tier: 'none',
          sub_status: 'none',
          sub_expires_at: null,
          is_active: false
        },
        balance: balance || 0,
        restored_products: restoredProducts,
        correlation_id: correlationId
      } as RestoreResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitResult)
        } 
      }
    );

  } catch (error) {
    structuredLog('error', 'Restore error', correlationId, { error: error.message });
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', correlation_id: correlationId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

