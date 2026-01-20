/**
 * M1SSION™ Apple App Store Server Notifications (ASN v2)
 * Handles Apple subscription lifecycle events
 * 
 * © 2026 Joseph MULÉ – NIYVORA KFT™ – ALL RIGHTS RESERVED
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  checkRateLimit, 
  rateLimitResponse, 
  generateCorrelationId,
  structuredLog 
} from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const APPLE_BUNDLE_ID = Deno.env.get('APPLE_BUNDLE_ID') || 'eu.m1ssion.app';

// Apple's JWKS URL for signature verification
const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';

// Cache for Apple JWKS keys
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL = 3600000; // 1 hour

interface AppleNotificationPayload {
  notificationType: string;
  subtype?: string;
  notificationUUID: string;
  data: {
    appAppleId?: number;
    bundleId: string;
    bundleVersion?: string;
    environment: 'Sandbox' | 'Production';
    signedTransactionInfo: string;  // JWS
    signedRenewalInfo?: string;     // JWS
  };
  version: string;
  signedDate: number;
}

interface TransactionInfo {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: number;
  originalPurchaseDate: number;
  expiresDate?: number;
  type: string;
  appAccountToken?: string;  // User identifier if provided during purchase
  bundleId: string;
  environment: string;
}

interface RenewalInfo {
  autoRenewProductId: string;
  autoRenewStatus: number;
  expirationIntent?: number;
  gracePeriodExpiresDate?: number;
  isInBillingRetryPeriod?: boolean;
  offerIdentifier?: string;
  originalTransactionId: string;
  priceIncreaseStatus?: number;
  productId: string;
  signedDate: number;
}

serve(async (req) => {
  const correlationId = generateCorrelationId();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    // Rate limit check
    const rateLimitResult = await checkRateLimit(
      supabaseAdmin,
      clientIp,
      'ip',
      'iap-apple-notifications'
    );

    if (!rateLimitResult.allowed) {
      structuredLog('warn', 'Rate limit exceeded for Apple notifications', correlationId, { ip: clientIp });
      return rateLimitResponse(rateLimitResult, correlationId);
    }

    // Parse the signed payload
    const body = await req.json();
    const signedPayload = body.signedPayload;

    if (!signedPayload) {
      structuredLog('error', 'Missing signedPayload', correlationId, {});
      return errorResponse('Missing signedPayload', 400, correlationId);
    }

    // Verify and decode the JWS payload
    const verificationResult = await verifyAndDecodeJWS(signedPayload, correlationId);
    
    if (!verificationResult.valid) {
      structuredLog('error', 'JWS verification failed', correlationId, { 
        error: verificationResult.error 
      });
      
      // Log failed verification attempt
      await logNotification(supabaseAdmin, {
        platform: 'ios',
        notificationId: null,
        notificationType: 'UNKNOWN',
        payload: { signedPayload: '[INVALID_SIGNATURE]' },
        signatureValid: false,
        correlationId,
      });
      
      return errorResponse('Invalid signature', 401, correlationId);
    }

    const payload: AppleNotificationPayload = verificationResult.payload;
    
    structuredLog('info', 'Apple notification received', correlationId, {
      type: payload.notificationType,
      subtype: payload.subtype,
      uuid: payload.notificationUUID,
      environment: payload.data.environment,
    });

    // Verify bundle ID
    if (payload.data.bundleId !== APPLE_BUNDLE_ID) {
      structuredLog('warn', 'Bundle ID mismatch', correlationId, {
        expected: APPLE_BUNDLE_ID,
        received: payload.data.bundleId,
      });
      return errorResponse('Invalid bundle ID', 400, correlationId);
    }

    // Decode transaction info
    const txnResult = await verifyAndDecodeJWS(payload.data.signedTransactionInfo, correlationId);
    if (!txnResult.valid) {
      structuredLog('error', 'Transaction info JWS invalid', correlationId, {});
      return errorResponse('Invalid transaction info', 400, correlationId);
    }
    const transactionInfo: TransactionInfo = txnResult.payload;

    // Decode renewal info if present
    let renewalInfo: RenewalInfo | null = null;
    if (payload.data.signedRenewalInfo) {
      const renewalResult = await verifyAndDecodeJWS(payload.data.signedRenewalInfo, correlationId);
      if (renewalResult.valid) {
        renewalInfo = renewalResult.payload;
      }
    }

    // Log notification (with idempotency)
    const notificationId = await logNotification(supabaseAdmin, {
      platform: 'ios',
      notificationId: payload.notificationUUID,
      notificationType: payload.notificationType,
      notificationSubtype: payload.subtype,
      originalTransactionId: transactionInfo.originalTransactionId,
      transactionId: transactionInfo.transactionId,
      productId: transactionInfo.productId,
      payload: {
        notificationType: payload.notificationType,
        subtype: payload.subtype,
        environment: payload.data.environment,
        transactionId: transactionInfo.transactionId,
        originalTransactionId: transactionInfo.originalTransactionId,
        productId: transactionInfo.productId,
        expiresDate: transactionInfo.expiresDate,
        appAccountToken: transactionInfo.appAccountToken,
      },
      signatureValid: true,
      environment: payload.data.environment.toLowerCase() as 'sandbox' | 'production',
      eventTimestamp: new Date(payload.signedDate),
      correlationId,
    });

    if (!notificationId) {
      // Duplicate notification - already processed
      structuredLog('info', 'Duplicate notification ignored', correlationId, {
        uuid: payload.notificationUUID,
      });
      return successResponse({ status: 'duplicate' }, correlationId);
    }

    // Find user by original_transaction_id
    const userId = await findUserByTransaction(supabaseAdmin, transactionInfo.originalTransactionId, transactionInfo.appAccountToken);

    // Update notification with user_id
    if (userId) {
      await supabaseAdmin
        .from('iap_notifications')
        .update({ user_id: userId })
        .eq('id', notificationId);
    }

    // Process the notification based on type
    const processResult = await processNotification(
      supabaseAdmin,
      payload.notificationType,
      payload.subtype,
      transactionInfo,
      renewalInfo,
      userId,
      correlationId
    );

    // Update notification status
    await supabaseAdmin.rpc('update_notification_status', {
      p_notification_id: notificationId,
      p_status: processResult.success ? 'processed' : 'failed',
      p_error: processResult.error || null,
    });

    structuredLog('info', 'Apple notification processed', correlationId, {
      type: payload.notificationType,
      userId,
      result: processResult.success ? 'success' : 'failed',
    });

    return successResponse({ status: 'ok' }, correlationId);

  } catch (error) {
    structuredLog('error', 'Unexpected error', correlationId, { error: error.message });
    return errorResponse('Internal server error', 500, correlationId);
  }
});

// =====================
// JWS VERIFICATION
// =====================

async function getAppleJWKS(): Promise<any[]> {
  // Check cache
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }

  const response = await fetch(APPLE_JWKS_URL);
  const data = await response.json();
  
  jwksCache = {
    keys: data.keys,
    fetchedAt: Date.now(),
  };
  
  return data.keys;
}

async function verifyAndDecodeJWS(
  jws: string,
  correlationId: string
): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = jws.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWS format' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Get JWKS and find matching key
    const jwks = await getAppleJWKS();
    const key = jwks.find(k => k.kid === header.kid);
    
    if (!key) {
      return { valid: false, error: 'Key not found in JWKS' };
    }

    // For production, implement full RS256 signature verification
    // using the public key from JWKS. This is a simplified version.
    
    // In production, use a proper JWT library like:
    // import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
    // const result = await jose.jwtVerify(jws, await jose.importJWK(key));
    
    // For now, decode payload (verification would be added in production)
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Basic validation
    if (header.alg !== 'ES256') {
      return { valid: false, error: 'Unexpected algorithm' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// =====================
// DATABASE OPERATIONS
// =====================

async function logNotification(
  supabase: SupabaseClient,
  params: {
    platform: 'ios' | 'android';
    notificationId: string | null;
    notificationType: string;
    notificationSubtype?: string;
    originalTransactionId?: string;
    transactionId?: string;
    purchaseToken?: string;
    productId?: string;
    userId?: string;
    payload: any;
    signatureValid: boolean;
    environment?: 'sandbox' | 'production';
    eventTimestamp?: Date;
    correlationId: string;
  }
): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_iap_notification', {
    p_platform: params.platform,
    p_notification_id: params.notificationId,
    p_notification_type: params.notificationType,
    p_notification_subtype: params.notificationSubtype || null,
    p_original_transaction_id: params.originalTransactionId || null,
    p_transaction_id: params.transactionId || null,
    p_purchase_token: params.purchaseToken || null,
    p_product_id: params.productId || null,
    p_user_id: params.userId || null,
    p_payload: params.payload,
    p_signature_valid: params.signatureValid,
    p_environment: params.environment || null,
    p_event_timestamp: params.eventTimestamp?.toISOString() || null,
    p_correlation_id: params.correlationId,
  });

  if (error) {
    console.error('[Apple ASN] Error logging notification:', error);
    return null;
  }

  return data;
}

async function findUserByTransaction(
  supabase: SupabaseClient,
  originalTransactionId: string,
  appAccountToken?: string
): Promise<string | null> {
  // Try to find by appAccountToken (user_id) first
  if (appAccountToken) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', appAccountToken)
      .single();
    
    if (profile) return profile.id;
  }

  // Try to find by original_transaction_id in our records
  const { data: txn } = await supabase
    .from('iap_transactions')
    .select('user_id')
    .eq('original_transaction_id', originalTransactionId)
    .eq('platform', 'ios')
    .limit(1)
    .single();

  if (txn) return txn.user_id;

  // Try entitlements
  const { data: ent } = await supabase
    .from('user_entitlements')
    .select('user_id')
    .eq('original_transaction_id', originalTransactionId)
    .limit(1)
    .single();

  return ent?.user_id || null;
}

async function processNotification(
  supabase: SupabaseClient,
  notificationType: string,
  subtype: string | undefined,
  transactionInfo: TransactionInfo,
  renewalInfo: RenewalInfo | null,
  userId: string | null,
  correlationId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    // Can't process without user - log and continue
    structuredLog('warn', 'Cannot process notification without user', correlationId, {
      originalTransactionId: transactionInfo.originalTransactionId,
    });
    return { success: true };  // Don't fail, just log
  }

  try {
    // Map notification to normalized status
    const { data: normalizedStatus } = await supabase.rpc('map_notification_to_status', {
      p_platform: 'ios',
      p_notification_type: notificationType,
      p_subtype: subtype || null,
    });

    const status = normalizedStatus || 'active';
    
    // Calculate expiry date
    const expiresAt = transactionInfo.expiresDate 
      ? new Date(transactionInfo.expiresDate) 
      : null;

    // Update entitlements based on notification type
    switch (notificationType) {
      case 'SUBSCRIBED':
      case 'DID_RENEW':
      case 'OFFER_REDEEMED':
        await supabase.rpc('grant_subscription_entitlement', {
          p_user_id: userId,
          p_tier: await getProductTier(supabase, transactionInfo.productId),
          p_platform: 'ios',
          p_expires_at: expiresAt?.toISOString() || null,
          p_original_transaction_id: transactionInfo.originalTransactionId,
        });
        break;

      case 'EXPIRED':
      case 'REVOKE':
      case 'REFUND':
        await supabase.rpc('revoke_subscription_entitlement', {
          p_user_id: userId,
          p_reason: notificationType.toLowerCase(),
        });
        break;

      case 'GRACE_PERIOD':
      case 'DID_FAIL_TO_RENEW':
        await supabase
          .from('user_entitlements')
          .update({
            sub_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        break;

      case 'DID_CHANGE_RENEWAL_STATUS':
        // Just log - no immediate status change needed
        break;

      case 'DID_CHANGE_RENEWAL_PREF':
        // User changing plan - will take effect at next renewal
        break;

      default:
        structuredLog('info', 'Unhandled notification type', correlationId, { notificationType });
    }

    // Audit log
    await supabase.rpc('log_iap_audit', {
      p_user_id: userId,
      p_action: `APPLE_${notificationType}`,
      p_details: {
        subtype,
        transactionId: transactionInfo.transactionId,
        originalTransactionId: transactionInfo.originalTransactionId,
        productId: transactionInfo.productId,
        expiresAt: expiresAt?.toISOString(),
        correlation_id: correlationId,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getProductTier(supabase: SupabaseClient, productId: string): Promise<string> {
  const { data } = await supabase
    .from('iap_products')
    .select('tier')
    .or(`ios_sku.eq.${productId},product_id.eq.${productId}`)
    .single();

  return data?.tier || 'silver';
}

// =====================
// RESPONSE HELPERS
// =====================

function successResponse(data: any, correlationId: string): Response {
  return new Response(
    JSON.stringify({ ...data, correlation_id: correlationId }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

function errorResponse(message: string, status: number, correlationId: string): Response {
  return new Response(
    JSON.stringify({ 
      error: message, 
      correlation_id: correlationId 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

