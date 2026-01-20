/**
 * M1SSION™ Google Real-Time Developer Notifications (RTDN)
 * Handles Google Play subscription lifecycle events via Pub/Sub
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
const GOOGLE_PACKAGE_NAME = Deno.env.get('GOOGLE_PACKAGE_NAME') || 'eu.m1ssion.app';
const GOOGLE_SERVICE_ACCOUNT_KEY = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '';
const PUBSUB_VERIFICATION_TOKEN = Deno.env.get('PUBSUB_VERIFICATION_TOKEN') || '';

// Google notification types
const NOTIFICATION_TYPES: Record<number, string> = {
  1: 'SUBSCRIPTION_RECOVERED',
  2: 'SUBSCRIPTION_RENEWED',
  3: 'SUBSCRIPTION_CANCELED',
  4: 'SUBSCRIPTION_PURCHASED',
  5: 'SUBSCRIPTION_ON_HOLD',
  6: 'SUBSCRIPTION_IN_GRACE_PERIOD',
  7: 'SUBSCRIPTION_RESTARTED',
  8: 'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED',
  9: 'SUBSCRIPTION_DEFERRED',
  10: 'SUBSCRIPTION_PAUSED',
  11: 'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED',
  12: 'SUBSCRIPTION_REVOKED',
  13: 'SUBSCRIPTION_EXPIRED',
  20: 'ONE_TIME_PRODUCT_PURCHASED',
  21: 'ONE_TIME_PRODUCT_CANCELED',
};

interface PubSubMessage {
  message: {
    data: string;  // Base64 encoded
    messageId: string;
    publishTime: string;
    attributes?: Record<string, string>;
  };
  subscription: string;
}

interface GoogleNotification {
  version: string;
  packageName: string;
  eventTimeMillis: string;
  subscriptionNotification?: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    subscriptionId: string;
  };
  oneTimeProductNotification?: {
    version: string;
    notificationType: number;
    purchaseToken: string;
    sku: string;
  };
  testNotification?: {
    version: string;
  };
}

interface SubscriptionPurchase {
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: string;
  countryCode: string;
  paymentState: number;  // 0=pending, 1=received, 2=free trial, 3=pending deferred upgrade/downgrade
  cancelReason?: number;  // 0=user, 1=system, 2=replaced, 3=developer
  userCancellationTimeMillis?: string;
  orderId: string;
  linkedPurchaseToken?: string;
  purchaseType?: number;
  acknowledgementState: number;  // 0=not acknowledged, 1=acknowledged
  kind: string;
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
      'iap-google-rtdn'
    );

    if (!rateLimitResult.allowed) {
      structuredLog('warn', 'Rate limit exceeded for Google RTDN', correlationId, { ip: clientIp });
      return rateLimitResponse(rateLimitResult, correlationId);
    }

    // Verify Pub/Sub token if configured
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (PUBSUB_VERIFICATION_TOKEN && token !== PUBSUB_VERIFICATION_TOKEN) {
      structuredLog('error', 'Invalid Pub/Sub verification token', correlationId, {});
      return errorResponse('Invalid token', 401, correlationId);
    }

    // Parse Pub/Sub message
    const pubsubMessage: PubSubMessage = await req.json();
    
    if (!pubsubMessage.message?.data) {
      structuredLog('error', 'Missing message data', correlationId, {});
      return errorResponse('Missing message data', 400, correlationId);
    }

    // Decode base64 data
    const decodedData = atob(pubsubMessage.message.data);
    const notification: GoogleNotification = JSON.parse(decodedData);

    structuredLog('info', 'Google RTDN received', correlationId, {
      messageId: pubsubMessage.message.messageId,
      packageName: notification.packageName,
      isTest: !!notification.testNotification,
    });

    // Verify package name
    if (notification.packageName !== GOOGLE_PACKAGE_NAME) {
      structuredLog('warn', 'Package name mismatch', correlationId, {
        expected: GOOGLE_PACKAGE_NAME,
        received: notification.packageName,
      });
      return errorResponse('Invalid package name', 400, correlationId);
    }

    // Handle test notification
    if (notification.testNotification) {
      structuredLog('info', 'Test notification received', correlationId, {});
      return successResponse({ status: 'test_ok' }, correlationId);
    }

    // Process subscription notification
    if (notification.subscriptionNotification) {
      const subNotif = notification.subscriptionNotification;
      const notificationType = NOTIFICATION_TYPES[subNotif.notificationType] || `UNKNOWN_${subNotif.notificationType}`;

      structuredLog('info', 'Processing subscription notification', correlationId, {
        type: notificationType,
        subscriptionId: subNotif.subscriptionId,
      });

      // Log notification (with idempotency)
      const notificationId = await logNotification(supabaseAdmin, {
        platform: 'android',
        notificationId: pubsubMessage.message.messageId,
        notificationType,
        purchaseToken: subNotif.purchaseToken,
        productId: subNotif.subscriptionId,
        payload: {
          messageId: pubsubMessage.message.messageId,
          publishTime: pubsubMessage.message.publishTime,
          notificationType,
          subscriptionId: subNotif.subscriptionId,
          eventTimeMillis: notification.eventTimeMillis,
        },
        environment: 'production',  // Google doesn't send sandbox notifications to RTDN
        eventTimestamp: new Date(parseInt(notification.eventTimeMillis)),
        correlationId,
      });

      if (!notificationId) {
        structuredLog('info', 'Duplicate notification ignored', correlationId, {
          messageId: pubsubMessage.message.messageId,
        });
        return successResponse({ status: 'duplicate' }, correlationId);
      }

      // Fetch subscription status from Google Play API
      const subscriptionPurchase = await fetchSubscriptionStatus(
        subNotif.subscriptionId,
        subNotif.purchaseToken,
        correlationId
      );

      if (!subscriptionPurchase) {
        structuredLog('warn', 'Could not fetch subscription status', correlationId, {});
        await supabaseAdmin.rpc('update_notification_status', {
          p_notification_id: notificationId,
          p_status: 'failed',
          p_error: 'Could not fetch subscription status from Google',
        });
        // Return success to Pub/Sub (don't retry)
        return successResponse({ status: 'processed_with_warning' }, correlationId);
      }

      // Find user by purchase token
      const userId = await findUserByPurchaseToken(supabaseAdmin, subNotif.purchaseToken);

      if (userId) {
        await supabaseAdmin
          .from('iap_notifications')
          .update({ user_id: userId })
          .eq('id', notificationId);
      }

      // Process the notification
      const processResult = await processSubscriptionNotification(
        supabaseAdmin,
        notificationType,
        subNotif.subscriptionId,
        subNotif.purchaseToken,
        subscriptionPurchase,
        userId,
        correlationId
      );

      // Update notification status
      await supabaseAdmin.rpc('update_notification_status', {
        p_notification_id: notificationId,
        p_status: processResult.success ? 'processed' : 'failed',
        p_error: processResult.error || null,
      });

      structuredLog('info', 'Google RTDN processed', correlationId, {
        type: notificationType,
        userId,
        result: processResult.success ? 'success' : 'failed',
      });
    }

    // Process one-time product notification
    if (notification.oneTimeProductNotification) {
      const otpNotif = notification.oneTimeProductNotification;
      const notificationType = NOTIFICATION_TYPES[otpNotif.notificationType] || `UNKNOWN_${otpNotif.notificationType}`;

      structuredLog('info', 'One-time product notification (ignored for now)', correlationId, {
        type: notificationType,
        sku: otpNotif.sku,
      });

      // Log but don't process (consumables don't need lifecycle management)
      await logNotification(supabaseAdmin, {
        platform: 'android',
        notificationId: pubsubMessage.message.messageId,
        notificationType,
        purchaseToken: otpNotif.purchaseToken,
        productId: otpNotif.sku,
        payload: {
          messageId: pubsubMessage.message.messageId,
          notificationType,
          sku: otpNotif.sku,
        },
        eventTimestamp: new Date(parseInt(notification.eventTimeMillis)),
        correlationId,
      });
    }

    // Acknowledge to Pub/Sub
    return successResponse({ status: 'ok' }, correlationId);

  } catch (error) {
    structuredLog('error', 'Unexpected error', correlationId, { error: error.message });
    return errorResponse('Internal server error', 500, correlationId);
  }
});

// =====================
// GOOGLE PLAY API
// =====================

async function fetchSubscriptionStatus(
  subscriptionId: string,
  purchaseToken: string,
  correlationId: string
): Promise<SubscriptionPurchase | null> {
  if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
    structuredLog('warn', 'No Google service account key configured', correlationId, {});
    return null;
  }

  try {
    const accessToken = await getGoogleAccessToken(correlationId);
    if (!accessToken) {
      return null;
    }

    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      structuredLog('error', 'Google API error', correlationId, { 
        status: response.status, 
        error 
      });
      return null;
    }

    return await response.json();
  } catch (error) {
    structuredLog('error', 'Error fetching subscription status', correlationId, { 
      error: error.message 
    });
    return null;
  }
}

async function getGoogleAccessToken(correlationId: string): Promise<string | null> {
  try {
    const keyData = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);
    
    // Create JWT for service account
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: keyData.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // For full implementation, use a JWT library to sign with private key
    // This is a placeholder - implement proper signing in production
    
    structuredLog('warn', 'JWT signing not fully implemented', correlationId, {});
    return null;
    
  } catch (error) {
    structuredLog('error', 'Error getting Google access token', correlationId, { 
      error: error.message 
    });
    return null;
  }
}

// =====================
// DATABASE OPERATIONS
// =====================

async function logNotification(
  supabase: SupabaseClient,
  params: {
    platform: 'ios' | 'android';
    notificationId: string;
    notificationType: string;
    purchaseToken?: string;
    productId?: string;
    payload: any;
    environment?: 'sandbox' | 'production';
    eventTimestamp?: Date;
    correlationId: string;
  }
): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_iap_notification', {
    p_platform: params.platform,
    p_notification_id: params.notificationId,
    p_notification_type: params.notificationType,
    p_notification_subtype: null,
    p_original_transaction_id: null,
    p_transaction_id: null,
    p_purchase_token: params.purchaseToken || null,
    p_product_id: params.productId || null,
    p_user_id: null,
    p_payload: params.payload,
    p_signature_valid: true,  // Pub/Sub messages are verified by Google
    p_environment: params.environment || null,
    p_event_timestamp: params.eventTimestamp?.toISOString() || null,
    p_correlation_id: params.correlationId,
  });

  if (error) {
    console.error('[Google RTDN] Error logging notification:', error);
    return null;
  }

  return data;
}

async function findUserByPurchaseToken(
  supabase: SupabaseClient,
  purchaseToken: string
): Promise<string | null> {
  // Find in transactions
  const { data: txn } = await supabase
    .from('iap_transactions')
    .select('user_id')
    .eq('purchase_token', purchaseToken)
    .eq('platform', 'android')
    .limit(1)
    .single();

  if (txn) return txn.user_id;

  // Find in entitlements
  const { data: ent } = await supabase
    .from('user_entitlements')
    .select('user_id')
    .eq('original_transaction_id', purchaseToken)
    .eq('sub_platform', 'android')
    .limit(1)
    .single();

  return ent?.user_id || null;
}

async function processSubscriptionNotification(
  supabase: SupabaseClient,
  notificationType: string,
  subscriptionId: string,
  purchaseToken: string,
  subscriptionPurchase: SubscriptionPurchase,
  userId: string | null,
  correlationId: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    structuredLog('warn', 'Cannot process without user', correlationId, { purchaseToken });
    return { success: true };  // Don't fail
  }

  try {
    // Map to normalized status
    const { data: normalizedStatus } = await supabase.rpc('map_notification_to_status', {
      p_platform: 'android',
      p_notification_type: notificationType,
      p_subtype: null,
    });

    const status = normalizedStatus || 'active';
    const expiresAt = new Date(parseInt(subscriptionPurchase.expiryTimeMillis));

    // Get product tier
    const tier = await getProductTier(supabase, subscriptionId);

    switch (notificationType) {
      case 'SUBSCRIPTION_PURCHASED':
      case 'SUBSCRIPTION_RENEWED':
      case 'SUBSCRIPTION_RECOVERED':
      case 'SUBSCRIPTION_RESTARTED':
        await supabase.rpc('grant_subscription_entitlement', {
          p_user_id: userId,
          p_tier: tier,
          p_platform: 'android',
          p_expires_at: expiresAt.toISOString(),
          p_original_transaction_id: purchaseToken,
        });
        break;

      case 'SUBSCRIPTION_CANCELED':
        // User canceled but still has access until expiry
        await supabase
          .from('user_entitlements')
          .update({
            sub_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        break;

      case 'SUBSCRIPTION_EXPIRED':
      case 'SUBSCRIPTION_REVOKED':
        await supabase.rpc('revoke_subscription_entitlement', {
          p_user_id: userId,
          p_reason: notificationType.toLowerCase().replace('subscription_', ''),
        });
        break;

      case 'SUBSCRIPTION_IN_GRACE_PERIOD':
        await supabase
          .from('user_entitlements')
          .update({
            sub_status: 'grace',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        break;

      case 'SUBSCRIPTION_ON_HOLD':
      case 'SUBSCRIPTION_PAUSED':
        await supabase
          .from('user_entitlements')
          .update({
            sub_status: 'billing_retry',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        break;

      default:
        structuredLog('info', 'Unhandled notification type', correlationId, { notificationType });
    }

    // Handle linked purchase token (upgrade/downgrade)
    if (subscriptionPurchase.linkedPurchaseToken) {
      // Find old user entitlement with linked token and update
      await supabase
        .from('user_entitlements')
        .update({
          original_transaction_id: purchaseToken,
          sub_tier: tier,
          sub_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('original_transaction_id', subscriptionPurchase.linkedPurchaseToken)
        .eq('user_id', userId);
    }

    // Audit log
    await supabase.rpc('log_iap_audit', {
      p_user_id: userId,
      p_action: `GOOGLE_${notificationType}`,
      p_details: {
        subscriptionId,
        purchaseToken,
        expiresAt: expiresAt.toISOString(),
        paymentState: subscriptionPurchase.paymentState,
        autoRenewing: subscriptionPurchase.autoRenewing,
        cancelReason: subscriptionPurchase.cancelReason,
        correlation_id: correlationId,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getProductTier(supabase: SupabaseClient, subscriptionId: string): Promise<string> {
  const { data } = await supabase
    .from('iap_products')
    .select('tier')
    .or(`android_sku.eq.${subscriptionId},product_id.eq.${subscriptionId}`)
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
    JSON.stringify({ error: message, correlation_id: correlationId }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

