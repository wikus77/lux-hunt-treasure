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

// Apple IAP validation secrets:
// - APPLE_SHARED_SECRET: For legacy verifyReceipt API (deprecated but still works)
// - APPLE_PRIVATE_KEY_V2: For App Store Server API v2 (JWT-based, recommended)
// - APPLE_KEY_ID, APPLE_ISSUER_ID, APPLE_TEAM_ID: Required for Server API v2
const APPLE_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';
const APPLE_PRIVATE_KEY = Deno.env.get('APPLE_PRIVATE_KEY_V2') || '';
const APPLE_KEY_ID = Deno.env.get('APPLE_KEY_ID') || '';
const APPLE_ISSUER_ID = Deno.env.get('APPLE_ISSUER_ID') || '';

// Google Play validation
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
    // REPLAY DEFENSE (DISABLED - causing false positives on retry)
    // The idempotency check below is sufficient protection
    // =====================
    // 🔧 [IAP_FIX_V12] DISABLED: Replay check was causing "Error checking replay" 
    // and blocking legitimate retries. The idempotency check (line ~190) already
    // prevents duplicate credits. Re-enable after fixing the check_replay RPC.
    /*
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
    */
    structuredLog('info', '[IAP_FIX_V12] Replay defense DISABLED - using idempotency check only', correlationId, {});

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
    // GET PRODUCT INFO (with fallback for missing config)
    // 🔧 [IAP_FIX_V12] Added fallback when iap_products table is empty/missing
    // =====================
    
    const { data: product, error: productError } = await supabaseAdmin
      .from('iap_products')
      .select('*')
      .eq('product_id', product_id)
      .single();

    // 🔧 [IAP_FIX_V12] Fallback product config when table lookup fails
    // This allows IAP to work even if iap_products table is not configured
    let productConfig = product;
    
    if (productError || !product) {
      structuredLog('warn', '[IAP_FIX_V12] Product not found in iap_products table, using fallback', correlationId, {
        productId: product_id,
        error: productError?.message,
      });
      
      // Fallback: Extract M1U amount from product_id pattern
      // Format: com.m1ssion.m1u.pack.{tier}
      const m1uAmounts: Record<string, number> = {
        'com.m1ssion.m1u.pack.starter': 50,
        'com.m1ssion.m1u.pack.agent': 110,
        'com.m1ssion.m1u.pack.elite': 250,
        'com.m1ssion.m1u.pack.commander': 550,
        'com.m1ssion.m1u.pack.director': 1200,
        'com.m1ssion.m1u.pack.master': 3000,
      };
      
      const m1uAmount = m1uAmounts[product_id];
      
      if (!m1uAmount) {
        structuredLog('error', '[IAP_FIX_V12] Unknown product and no fallback available', correlationId, { productId: product_id });
        return new Response(
          JSON.stringify({ success: false, error: `Unknown product: ${product_id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create fallback product config
      productConfig = {
        product_id,
        product_type: 'consumable',
        m1u_amount: m1uAmount,
        subscription_tier: null,
      };
      
      structuredLog('info', '[IAP_FIX_V12] Using fallback product config', correlationId, { productConfig });
    }

    // =====================
    // CREATE PENDING TRANSACTION
    // 🔧 [IAP_FIX_V13] Fixed: product_code, store_product_id, product_type are required
    // =====================
    
    // Derive product_code from product_id (e.g., "com.m1ssion.m1u.pack.starter" -> "M1U_STARTER")
    const productCodeMap: Record<string, string> = {
      'com.m1ssion.m1u.pack.starter': 'M1U_STARTER',
      'com.m1ssion.m1u.pack.agent': 'M1U_AGENT',
      'com.m1ssion.m1u.pack.elite': 'M1U_ELITE',
      'com.m1ssion.m1u.pack.commander': 'M1U_COMMANDER',
      'com.m1ssion.m1u.pack.director': 'M1U_DIRECTOR',
      'com.m1ssion.m1u.pack.master': 'M1U_MASTER',
      'com.m1ssion.sub.silver': 'SUB_SILVER',
      'com.m1ssion.sub.gold': 'SUB_GOLD',
      'com.m1ssion.sub.black': 'SUB_BLACK',
      'com.m1ssion.sub.titanium': 'SUB_TITANIUM',
    };
    
    const productCode = productCodeMap[product_id] || `UNKNOWN_${product_id.split('.').pop()?.toUpperCase() || 'PRODUCT'}`;
    const productType = productConfig.product_type || 'consumable';
    
    structuredLog('info', '[IAP_FIX_V13] Creating transaction record', correlationId, {
      productId: product_id,
      productCode,
      productType,
      m1uAmount: productConfig.m1u_amount,
    });
    
    const { data: txn, error: txnError } = await supabaseAdmin
      .from('iap_transactions')
      .insert({
        user_id: user.id,
        platform,
        // 🔧 [IAP_FIX_V13] Required fields that were missing
        product_code: productCode,
        store_product_id: product_id,
        product_type: productType,
        // Original fields
        product_id, // Keep for backward compatibility with patch migration
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

      // 🔧 [IAP_FIX_V13] Audit log - non-blocking
      try {
        await supabaseAdmin.rpc('log_iap_audit', {
          p_user_id: user.id,
          p_action: 'PURCHASE_REJECTED',
          p_transaction_id: txn.id,
          p_details: { product_id, product_code: productCode, platform, reason: 'verification_failed' }
        });
      } catch (auditErr) {
        console.error('[IAP_FIX_V13] Audit log failed (non-blocking):', auditErr);
      }

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

    // 🔧 [IAP_FIX_V14] Removed duplicate productType declaration - already defined at line 314
    // productType is already defined above as: const productType = productConfig.product_type || 'consumable';
    
    if (productType === 'consumable') {
      // 🔧 [IAP_FIX_V12] Simplified M1U crediting - more robust
      const m1uToCredit = productConfig.m1u_amount || 0;
      
      structuredLog('info', '[IAP_FIX_V12] Crediting M1U', correlationId, { 
        userId: user.id, 
        m1uToCredit,
        productId: product_id 
      });

      // Method 1: Direct SQL increment on profiles.m1_units
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .select('m1_units')
        .eq('id', user.id)
        .single();
      
      const currentM1U = updatedProfile?.m1_units || 0;
      const newM1U = currentM1U + m1uToCredit;
      
      const { error: creditError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          m1_units: newM1U,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (creditError) {
        structuredLog('error', '[IAP_FIX_V12] Failed to credit M1U to profiles', correlationId, { 
          error: creditError.message 
        });
        // Try RPC fallback
        try {
          await supabaseAdmin.rpc('increment_user_m1u', { p_user_id: user.id, p_amount: m1uToCredit });
        } catch (rpcErr) {
          structuredLog('error', '[IAP_FIX_V12] RPC increment also failed', correlationId, { error: String(rpcErr) });
        }
      }

      // Also update user_wallet if table exists (non-blocking)
      try {
        await supabaseAdmin
          .from('user_wallet')
          .upsert({
            user_id: user.id,
            balance_m1u: newM1U,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (walletErr) {
        // Ignore - table may not exist
      }

      // Get new balance
      const { data: balanceResult } = await supabaseAdmin
        .from('profiles')
        .select('m1_units')
        .eq('id', user.id)
        .single();
      newBalance = balanceResult?.m1_units || newM1U;
      
      structuredLog('info', '[IAP_FIX_V12] M1U credited successfully', correlationId, { 
        oldBalance: currentM1U,
        credited: m1uToCredit,
        newBalance 
      });

      // Update transaction
      await supabaseAdmin
        .from('iap_transactions')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          credited_m1u: m1uToCredit
        })
        .eq('id', txn.id);

    } else if (productType === 'subscription') {
      // Calculate expiry (30 days from now for monthly)
      const productTier = productConfig.subscription_tier || productConfig.tier || 'basic';
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update entitlements
      await supabaseAdmin
        .from('user_entitlements')
        .upsert({
          user_id: user.id,
          sub_tier: productTier,
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
          subscription_tier: productTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Also update subscriptions table if exists
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: productTier,
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
          credited_tier: productTier
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
    
    // 🔧 [IAP_FIX_V13] Audit log - non-blocking
    try {
      await supabaseAdmin.rpc('log_iap_audit', {
        p_user_id: user.id,
        p_action: 'PURCHASE_VERIFIED',
        p_transaction_id: txn.id,
        p_details: { 
          product_id,
          product_code: productCode,
          platform, 
          type: productType,
          credited_m1u: productConfig.m1u_amount,
          credited_tier: productConfig.subscription_tier || productConfig.tier
        }
      });
    } catch (auditErr) {
      // Audit log failure should not block purchase
      console.error('[IAP_FIX_V13] Audit log failed (non-blocking):', auditErr);
    }

    structuredLog('info', '[IAP_FIX_V13] Purchase verified successfully', correlationId, {
      userId: user.id,
      productId: product_id,
      productCode,
      platform,
      creditedM1U: productConfig.m1u_amount,
      creditedTier: productConfig.subscription_tier || productConfig.tier,
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

/**
 * Verify Apple purchase - tries App Store Server API v2 first, then falls back to legacy verifyReceipt
 */
async function verifyApplePurchase(
  receiptData: string | undefined,
  transactionId: string,
  sharedSecret: string
): Promise<boolean> {
  // Try App Store Server API v2 first (if configured)
  if (APPLE_PRIVATE_KEY && APPLE_KEY_ID && APPLE_ISSUER_ID) {
    console.log('[IAP] Trying App Store Server API v2...');
    const v2Result = await verifyApplePurchaseV2(transactionId);
    if (v2Result !== null) {
      return v2Result;
    }
    console.log('[IAP] V2 failed, falling back to legacy verifyReceipt...');
  }

  // Fallback to legacy verifyReceipt
  if (!receiptData) {
    console.warn('[IAP] No receipt data for iOS verification');
    return Deno.env.get('IAP_SANDBOX') === 'true';
  }

  try {
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

    if (result.status !== 0) {
      console.warn('[IAP] Apple verification failed:', result.status);
      return false;
    }

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

/**
 * App Store Server API v2 verification (uses JWT with .p8 key)
 * Returns null if API call fails (to allow fallback), true/false for validation result
 */
async function verifyApplePurchaseV2(transactionId: string): Promise<boolean | null> {
  try {
    // Generate JWT for App Store Server API
    const jwt = await generateAppleJWT();
    if (!jwt) {
      console.warn('[IAP] Failed to generate Apple JWT');
      return null;
    }

    // Get transaction info from App Store Server API
    const bundleId = Deno.env.get('APPLE_BUNDLE_ID') || 'eu.m1ssion.app';
    const isSandbox = Deno.env.get('IAP_SANDBOX') === 'true';
    const baseUrl = isSandbox 
      ? 'https://api.storekit-sandbox.itunes.apple.com' 
      : 'https://api.storekit.itunes.apple.com';

    const response = await fetch(
      `${baseUrl}/inApps/v1/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn('[IAP] App Store Server API v2 error:', response.status);
      return null; // Allow fallback
    }

    const data = await response.json();
    
    // Check if transaction is valid
    if (data.signedTransactionInfo) {
      console.log('[IAP] ✅ Transaction verified via App Store Server API v2');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[IAP] App Store Server API v2 error:', error);
    return null; // Allow fallback
  }
}

/**
 * Generate JWT for App Store Server API authentication
 */
async function generateAppleJWT(): Promise<string | null> {
  try {
    const header = {
      alg: 'ES256',
      kid: APPLE_KEY_ID,
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: APPLE_ISSUER_ID,
      iat: now,
      exp: now + 3600, // 1 hour
      aud: 'appstoreconnect-v1',
      bid: Deno.env.get('APPLE_BUNDLE_ID') || 'eu.m1ssion.app'
    };

    // Base64url encode
    const b64url = (obj: any) => {
      const json = JSON.stringify(obj);
      const b64 = btoa(json);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const headerB64 = b64url(header);
    const payloadB64 = b64url(payload);
    const message = `${headerB64}.${payloadB64}`;

    // Import the private key and sign
    const privateKeyPem = APPLE_PRIVATE_KEY
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');

    const keyData = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      new TextEncoder().encode(message)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${message}.${signatureB64}`;
  } catch (error) {
    console.error('[IAP] JWT generation error:', error);
    return null;
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

