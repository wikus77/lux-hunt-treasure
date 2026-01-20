/**
 * M1SSION™ IAP Verification Edge Function
 * Verifies iOS/Android purchases and credits M1U or entitlements
 * 
 * ENTERPRISE HARDENING: Rate Limiting + Replay Defense
 * 
 * © 2026 Joseph MULÉ – NIYVORA KFT™ – ALL RIGHTS RESERVED
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  checkRateLimit, 
  checkReplay,
  rateLimitResponse, 
  replayResponse,
  generateCorrelationId,
  structuredLog,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS
} from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APPLE_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';
const GOOGLE_SERVICE_ACCOUNT_KEY = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '';

interface VerifyRequest {
  platform: 'ios' | 'android';
  product_id: string;
  transaction_id?: string;      // iOS
  original_transaction_id?: string; // iOS subscription
  purchase_token?: string;      // Android
  order_id?: string;            // Android
  receipt_data?: string;        // iOS receipt
}

interface VerifyResponse {
  success: boolean;
  new_balance?: number;
  entitlements?: {
    sub_tier: string;
    sub_status: string;
    sub_expires_at: string | null;
    is_active: boolean;
  };
  error?: string;
  transaction_id?: string;
}

serve(async (req) => {
  const correlationId = generateCorrelationId();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Service role client for rate limiting (before auth)
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Extract auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      structuredLog('warn', 'Missing authorization header', correlationId, {});
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header', correlation_id: correlationId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token for auth
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      structuredLog('warn', 'Invalid or expired token', correlationId, {});
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token', correlation_id: correlationId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================
    // RATE LIMITING (per user, per minute)
    // =====================
    const rateLimitMinute = await checkRateLimit(
      supabaseAdmin,
      user.id,
      'user',
      'verify-iap-purchase'
    );

    if (!rateLimitMinute.allowed) {
      structuredLog('warn', 'Rate limit exceeded (minute)', correlationId, { userId: user.id });
      return rateLimitResponse(rateLimitMinute, correlationId);
    }

    // Rate limit per hour
    const rateLimitHour = await checkRateLimit(
      supabaseAdmin,
      user.id,
      'user',
      'verify-iap-purchase-hourly'
    );

    if (!rateLimitHour.allowed) {
      structuredLog('warn', 'Rate limit exceeded (hourly)', correlationId, { userId: user.id });
      return rateLimitResponse(rateLimitHour, correlationId);
    }

    // Parse request body
    const body: VerifyRequest = await req.json();
    const { platform, product_id, transaction_id, original_transaction_id, purchase_token, order_id, receipt_data } = body;

    // Validate required fields
    if (!platform || !product_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing platform or product_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (platform === 'ios' && !transaction_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing transaction_id for iOS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (platform === 'android' && !purchase_token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing purchase_token for Android', correlation_id: correlationId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================
    // REPLAY DEFENSE
    // =====================
    const isReplay = await checkReplay(
      supabaseAdmin,
      user.id,
      transaction_id || null,
      purchase_token || null,
      'verify-iap-purchase',
      10  // 10 minute TTL
    );

    if (isReplay) {
      structuredLog('warn', 'Replay attack detected', correlationId, { 
        userId: user.id,
        transactionId: transaction_id,
        purchaseToken: purchase_token,
      });
      return replayResponse(correlationId);
    }

    structuredLog('info', 'Processing IAP verification', correlationId, {
      userId: user.id,
      platform,
      productId: product_id,
    });

    // =====================
    // IDEMPOTENCY CHECK
    // =====================
    
    // Check if transaction already processed
    const existingQuery = platform === 'ios'
      ? supabaseAdmin
          .from('iap_transactions')
          .select('id, status, credited_m1u, credited_tier')
          .eq('transaction_id', transaction_id)
          .single()
      : supabaseAdmin
          .from('iap_transactions')
          .select('id, status, credited_m1u, credited_tier')
          .eq('purchase_token', purchase_token)
          .single();

    const { data: existing } = await existingQuery;

    if (existing) {
      if (existing.status === 'verified') {
        // Already processed successfully - return success (idempotent)
        console.log(`[IAP] Duplicate transaction detected: ${transaction_id || purchase_token}`);
        
        // Get current balance/entitlements
        const { data: balance } = await supabaseAdmin.rpc('get_user_m1u_balance', { p_user_id: user.id });
        const { data: entitlements } = await supabaseAdmin.rpc('get_user_entitlements', { p_user_id: user.id });
        
        return new Response(
          JSON.stringify({
            success: true,
            new_balance: balance,
            entitlements,
            transaction_id: existing.id,
            note: 'Already processed'
          } as VerifyResponse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (existing.status === 'rejected' || existing.status === 'error') {
        return new Response(
          JSON.stringify({ success: false, error: 'Transaction previously rejected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // =====================
    // GET PRODUCT INFO
    // =====================
    
    const { data: product, error: productError } = await supabaseAdmin
      .from('iap_products')
      .select('*')
      .eq('product_id', product_id)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unknown product' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================
    // CREATE PENDING TRANSACTION
    // =====================
    
    const { data: txn, error: txnError } = await supabaseAdmin
      .from('iap_transactions')
      .insert({
        user_id: user.id,
        platform,
        product_id,
        transaction_id: platform === 'ios' ? transaction_id : null,
        original_transaction_id: platform === 'ios' ? original_transaction_id : null,
        purchase_token: platform === 'android' ? purchase_token : null,
        order_id: platform === 'android' ? order_id : null,
        status: 'pending',
        receipt_data: { receipt_data_present: !!receipt_data }
      })
      .select('id')
      .single();

    if (txnError) {
      // Could be duplicate constraint violation
      if (txnError.code === '23505') {
        return new Response(
          JSON.stringify({ success: false, error: 'Duplicate transaction' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw txnError;
    }

    // =====================
    // VERIFY WITH APPLE / GOOGLE
    // =====================
    
    let isValid = false;
    let verificationDetails: any = {};

    if (platform === 'ios') {
      isValid = await verifyApplePurchase(receipt_data, transaction_id!, APPLE_SHARED_SECRET);
      verificationDetails = { verified_with: 'apple', transaction_id };
    } else {
      isValid = await verifyGooglePurchase(product_id, purchase_token!, GOOGLE_SERVICE_ACCOUNT_KEY);
      verificationDetails = { verified_with: 'google', purchase_token };
    }

    if (!isValid) {
      // Mark as rejected
      await supabaseAdmin
        .from('iap_transactions')
        .update({ 
          status: 'rejected',
          error_code: 'VERIFICATION_FAILED',
          error_message: 'Receipt/token verification failed'
        })
        .eq('id', txn.id);

      // Audit log
      await supabaseAdmin.rpc('log_iap_audit', {
        p_user_id: user.id,
        p_action: 'PURCHASE_REJECTED',
        p_transaction_id: txn.id,
        p_details: { product_id, platform, reason: 'verification_failed' }
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Purchase verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =====================
    // CREDIT M1U OR ENTITLEMENT
    // =====================
    
    let newBalance = 0;
    let newEntitlements: any = null;

    if (product.type === 'consumable') {
      // Credit M1U
      const m1uToCredit = product.m1u_amount || 0;

      // Update profiles.m1_units (primary source)
      const { data: profile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          m1_units: supabaseAdmin.rpc('get_user_m1u_balance', { p_user_id: user.id }) + m1uToCredit,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('m1_units')
        .single();

      // Fallback: direct increment
      if (updateError) {
        await supabaseAdmin.rpc('increment_user_m1u', { p_user_id: user.id, p_amount: m1uToCredit });
      }

      // Also update user_wallet if exists
      await supabaseAdmin
        .from('user_wallet')
        .upsert({
          user_id: user.id,
          balance_m1u: (await supabaseAdmin.rpc('get_user_m1u_balance', { p_user_id: user.id })),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Get new balance
      const { data: balance } = await supabaseAdmin.rpc('get_user_m1u_balance', { p_user_id: user.id });
      newBalance = balance || 0;

      // Update transaction
      await supabaseAdmin
        .from('iap_transactions')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          credited_m1u: m1uToCredit
        })
        .eq('id', txn.id);

    } else if (product.type === 'subscription') {
      // Calculate expiry (30 days from now for monthly)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update entitlements
      await supabaseAdmin
        .from('user_entitlements')
        .upsert({
          user_id: user.id,
          sub_tier: product.tier,
          sub_status: 'active',
          sub_expires_at: expiresAt.toISOString(),
          sub_platform: platform,
          original_transaction_id: platform === 'ios' ? (original_transaction_id || transaction_id) : purchase_token,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Also update profiles.subscription_tier
      await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_tier: product.tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Also update subscriptions table if exists
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: product.tier,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      // Update transaction
      await supabaseAdmin
        .from('iap_transactions')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          credited_tier: product.tier
        })
        .eq('id', txn.id);

      // Get new entitlements
      const { data: ent } = await supabaseAdmin.rpc('get_user_entitlements', { p_user_id: user.id });
      newEntitlements = ent;

      // Get balance too
      const { data: balance } = await supabaseAdmin.rpc('get_user_m1u_balance', { p_user_id: user.id });
      newBalance = balance || 0;
    }

    // =====================
    // AUDIT LOG
    // =====================
    
    await supabaseAdmin.rpc('log_iap_audit', {
      p_user_id: user.id,
      p_action: 'PURCHASE_VERIFIED',
      p_transaction_id: txn.id,
      p_details: { 
        product_id, 
        platform, 
        type: product.type,
        credited_m1u: product.m1u_amount,
        credited_tier: product.tier
      }
    });

    structuredLog('info', 'Purchase verified successfully', correlationId, {
      userId: user.id,
      productId: product_id,
      platform,
      creditedM1U: product.m1u_amount,
      creditedTier: product.tier,
    });

    return new Response(
      JSON.stringify({
        success: true,
        new_balance: newBalance,
        entitlements: newEntitlements,
        transaction_id: txn.id,
        correlation_id: correlationId
      } as VerifyResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(rateLimitMinute)
        } 
      }
    );

  } catch (error) {
    structuredLog('error', 'Unexpected error in verify-iap-purchase', correlationId, { 
      error: error.message 
    });
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', correlation_id: correlationId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// =====================
// APPLE VERIFICATION
// =====================

async function verifyApplePurchase(
  receiptData: string | undefined,
  transactionId: string,
  sharedSecret: string
): Promise<boolean> {
  if (!receiptData) {
    console.warn('[IAP] No receipt data for iOS verification');
    // In sandbox/dev, we might allow without receipt
    return Deno.env.get('IAP_SANDBOX') === 'true';
  }

  try {
    // Try production first
    let response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receiptData,
        'password': sharedSecret,
        'exclude-old-transactions': true
      })
    });

    let result = await response.json();

    // Status 21007 means sandbox receipt - retry with sandbox
    if (result.status === 21007) {
      response = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'receipt-data': receiptData,
          'password': sharedSecret,
          'exclude-old-transactions': true
        })
      });
      result = await response.json();
    }

    // Status 0 = valid
    if (result.status !== 0) {
      console.warn('[IAP] Apple verification failed:', result.status);
      return false;
    }

    // Check if transaction_id matches
    const receipt = result.receipt;
    const inApp = receipt?.in_app || [];
    const found = inApp.some((item: any) => item.transaction_id === transactionId);

    if (!found) {
      console.warn('[IAP] Transaction not found in receipt');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[IAP] Apple verification error:', error);
    return false;
  }
}

// =====================
// GOOGLE VERIFICATION
// =====================

async function verifyGooglePurchase(
  productId: string,
  purchaseToken: string,
  serviceAccountKey: string
): Promise<boolean> {
  if (!serviceAccountKey) {
    console.warn('[IAP] No Google service account key');
    // In sandbox/dev, we might allow without verification
    return Deno.env.get('IAP_SANDBOX') === 'true';
  }

  try {
    // Parse service account key
    const keyData = JSON.parse(serviceAccountKey);
    
    // Get access token using service account
    const accessToken = await getGoogleAccessToken(keyData);
    
    if (!accessToken) {
      console.warn('[IAP] Failed to get Google access token');
      return false;
    }

    const packageName = 'eu.m1ssion.app';
    
    // Verify purchase
    const response = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      console.warn('[IAP] Google verification failed:', response.status);
      return false;
    }

    const result = await response.json();
    
    // purchaseState: 0 = purchased, 1 = canceled, 2 = pending
    return result.purchaseState === 0;
  } catch (error) {
    console.error('[IAP] Google verification error:', error);
    return false;
  }
}

async function getGoogleAccessToken(keyData: any): Promise<string | null> {
  try {
    // Create JWT
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: keyData.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };

    // In production, implement proper JWT signing with keyData.private_key
    // For now, return null to use sandbox mode
    console.warn('[IAP] Google JWT signing not implemented - using sandbox mode');
    return null;
  } catch (error) {
    console.error('[IAP] Error getting Google access token:', error);
    return null;
  }
}

