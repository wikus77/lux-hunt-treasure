/**
 * M1SSION™ Native In-App Purchase Service
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - Unified interface for Apple IAP and Google Play Billing
 * - Uses Capacitor plugins for native store access
 * - Validates purchases server-side via Supabase
 * 
 * NOTE: This service requires the following Capacitor plugins:
 * - @capawesome-team/capacitor-purchases (or similar)
 * - Fallback to cordova-plugin-purchase if needed
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { isCapacitorNative, getCapacitorPlatform } from '@/utils/capacitor';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/integrations/supabase/client';
import { 
  IAPProduct, 
  ALL_PRODUCTS, 
  getStoreProductId, 
  getAllProductIds,
  getProductByAppleId,
  getProductByGoogleId
} from './products';
import { logComplianceEvent } from '@/utils/storeCompliance';
import {
  addPendingValidation,
  updatePendingValidation,
  removePendingValidation,
  getPendingValidations,
  getPendingCount,
  getRetryDelay,
  shouldRetry,
  scheduleRetry,
  isRetriableError,
  markAsBlocked,
  type PendingValidation,
} from './iapRetryQueue';

// 🚨 STATIC IMPORT: Ensures @capgo/native-purchases is bundled
// This import uses registerPlugin internally, which works on native platforms
import { NativePurchases as CapgoNativePurchases } from '@capgo/native-purchases';

// ============================================================================
// TYPES
// ============================================================================

export type IAPStatus = 'idle' | 'initializing' | 'ready' | 'purchasing' | 'validating' | 'error';

export interface IAPPurchaseResult {
  success: boolean;
  transactionId?: string;
  productCode?: string;
  error?: string;
  cancelled?: boolean; // 🔍 [IAP_FIX_V4] User cancelled - not an error
  pendingValidation?: boolean; // 🔍 [IAP_FIX_V7] Validation in retry queue
}

export interface IAPStoreProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  localizedPrice: string;
}

interface IAPState {
  status: IAPStatus;
  products: IAPStoreProduct[];
  error: string | null;
  initialized: boolean;
}

// ============================================================================
// STATE
// ============================================================================

let iapState: IAPState = {
  status: 'idle',
  products: [],
  error: null,
  initialized: false,
};

const listeners: Set<(state: IAPState) => void> = new Set();

function notifyListeners(): void {
  listeners.forEach(listener => listener(iapState));
}

function updateState(partial: Partial<IAPState>): void {
  iapState = { ...iapState, ...partial };
  notifyListeners();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Check if native IAP is available on current platform
 */
export function isNativeIAPAvailable(): boolean {
  if (!isCapacitorNative()) {
    return false;
  }
  
  const platform = getCapacitorPlatform();
  return platform === 'ios' || platform === 'android';
}

/**
 * Initialize the IAP service
 * Must be called once at app startup
 */
export async function initIAP(): Promise<boolean> {
  // 🚨 FORENSIC DIAGNOSTIC — REMOVE AFTER DEBUG
  console.log('🚨🚨🚨 IAP_DIAG_INITIAP_CALLED 🚨🚨🚨');
  console.log('🚨 [IAP DIAG] initIAP() CALLED', {
    alreadyInitialized: iapState.initialized,
    isNativeIAPAvailable: isNativeIAPAvailable(),
    isCapacitorNative: isCapacitorNative(),
    platform: getCapacitorPlatform(),
  });
  
  if (iapState.initialized) {
    console.log('[IAP] Already initialized');
    return true;
  }

  if (!isNativeIAPAvailable()) {
    console.log('[IAP] Native IAP not available on this platform');
    return false;
  }

  updateState({ status: 'initializing' });
  logComplianceEvent('iap_init_started');

  try {
    const platform = getCapacitorPlatform() as 'ios' | 'android';
    
    // Try to load Capacitor Purchases plugin
    const purchasesPlugin = await loadPurchasesPlugin();
    
    if (!purchasesPlugin) {
      throw new Error('Purchases plugin not available');
    }

    // Initialize the store
    await purchasesPlugin.setup({
      platform,
      products: getAllProductIds(platform),
    });

    // Load products from the store
    const storeProducts = await purchasesPlugin.getProducts({
      productIdentifiers: getAllProductIds(platform),
    });

    const mappedProducts: IAPStoreProduct[] = (storeProducts?.products || []).map((p: any) => ({
      productId: p.productId || p.id,
      title: p.title || p.localizedTitle || '',
      description: p.description || p.localizedDescription || '',
      price: p.price || p.localizedPrice || '',
      priceAmount: p.priceAmount || p.priceMicros / 1000000 || 0,
      currency: p.currency || p.priceCurrencyCode || 'EUR',
      localizedPrice: p.localizedPrice || p.price || '',
    }));

    updateState({ 
      status: 'ready', 
      products: mappedProducts,
      initialized: true,
      error: null 
    });

    logComplianceEvent('iap_init_success', { productCount: mappedProducts.length });
    console.log('[IAP] ✅ Initialized with', mappedProducts.length, 'products');
    
    // 🔧 [IAP_FIX_V7] Process any pending validations from previous sessions
    const pendingCount = await getPendingCount();
    if (pendingCount > 0) {
      console.log('[IAP_FIX_V7] 📦 Found', pendingCount, 'pending validations - processing...');
      // Process in background, don't block init
      setTimeout(() => processPendingValidations(), 2000);
    }
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    updateState({ 
      status: 'error', 
      error: errorMessage,
      initialized: false 
    });
    logComplianceEvent('iap_init_error', { error: errorMessage });
    console.error('[IAP] ❌ Initialization failed:', errorMessage);
    return false;
  }
}

/**
 * Dynamically load the Capacitor Purchases plugin
 * 
 * NOTE: This uses dynamic import with try/catch to avoid build errors
 * when native plugins are not installed. The plugins are only available
 * in Capacitor native builds.
 * 
 * Plugin options (in order of preference):
 * 1. @capgo/native-purchases - Free, StoreKit 2, Google Play Billing 7.x
 * 2. cordova-plugin-purchase - Fallback for older setups
 */
async function loadPurchasesPlugin(): Promise<any> {
  // 🚨 FORENSIC: Check what's in Capacitor.Plugins
  const cap = (window as any).Capacitor;
  console.log('🚨 [IAP FORENSIC] Capacitor Bridge Check:', {
    hasCapacitor: !!cap,
    platform: cap?.getPlatform?.() || 'unknown',
    pluginKeys: Object.keys(cap?.Plugins || {}),
    hasNativePurchases: !!cap?.Plugins?.NativePurchases,
    hasPurchases: !!cap?.Plugins?.Purchases,
  });
  
  // 🚨 FIX: Use STATIC imported plugin (CapgoNativePurchases from top of file)
  // This ensures the plugin is bundled and the registerPlugin call happens
  console.log('🚨 [IAP FORENSIC] Static import check:', {
    hasCapgoNativePurchases: !!CapgoNativePurchases,
    typeofCapgoNativePurchases: typeof CapgoNativePurchases,
    methods: CapgoNativePurchases ? Object.keys(CapgoNativePurchases) : [],
  });
  
  if (CapgoNativePurchases) {
    console.log('[IAP] ✅ Using @capgo/native-purchases (static import)');
    return wrapCapgoPlugin(CapgoNativePurchases);
  }

  console.warn('[IAP] ⚠️ No IAP plugin available - CapgoNativePurchases is null/undefined');
  return null;
}

/**
 * Wrap @capgo/native-purchases to match our interface
 */
function wrapCapgoPlugin(NativePurchases: any): any {
  const pendingTransactions: Map<string, any> = new Map();
  
  return {
    setup: async ({ platform, products }: any) => {
      // @capgo/native-purchases auto-initializes, just need to register products
      console.log('[IAP Capgo] Setting up with products:', products);
    },
    getProducts: async ({ productIdentifiers }: any) => {
      // 🔍 FORENSIC DIAGNOSTIC — REMOVE AFTER DEBUG
      console.log('🔍 [IAP DIAG] wrapCapgoPlugin.getProducts() CALLED', {
        productIdentifiers,
        count: productIdentifiers?.length,
      });
      try {
        console.log('🔍 [IAP DIAG] Calling CapgoNativePurchases.getProducts()...');
        const result = await CapgoNativePurchases.getProducts({ productIdentifiers });
        console.log('🔍 [IAP DIAG] CapgoNativePurchases.getProducts() RESULT', {
          hasProducts: !!result?.products,
          count: result?.products?.length,
        });
        return {
          products: (result?.products || []).map((p: any) => ({
            productId: p.productId || p.identifier,
            title: p.title || p.localizedTitle || '',
            description: p.description || p.localizedDescription || '',
            price: p.price || p.localizedPrice || '',
            priceAmount: p.priceValue || p.price || 0,
            currency: p.currency || p.currencyCode || 'EUR',
            localizedPrice: p.localizedPrice || p.priceString || '',
          })),
        };
      } catch (error) {
        console.error('[IAP Capgo] getProducts error:', error);
        return { products: [] };
      }
    },
    purchase: async ({ productId }: any) => {
      // 🔍 [IAP_FIX_V4] HARD GUARD: productId MUST be valid SKU string
      console.log('[IAP_FIX_V4] wrapCapgoPlugin.purchase() received', { 
        productId, 
        type: typeof productId,
        isEmpty: !productId || productId.trim?.() === '',
      });
      
      if (!productId || typeof productId !== 'string' || productId.trim() === '') {
        console.error('[IAP_FIX_V4] ❌ CRITICAL: purchase() called with empty/invalid productId!', productId);
        throw new Error('productIdentifier is Empty - SKU mancante');
      }
      
      try {
        // 🔍 [IAP_FIX_V5] Call plugin with validated identifier
        console.log('[IAP_FIX_V5] ✅ Calling CapgoNativePurchases.purchaseProduct with:', { productIdentifier: productId });
        const result = await CapgoNativePurchases.purchaseProduct({ productIdentifier: productId });
        
        // 🔧 [IAP_FIX_V5] Plugin returns Transaction FLAT at root level (not nested under .transaction)
        // Support both formats for backwards compatibility:
        // - FLAT (current): result.transactionId
        // - NESTED (legacy fallback): result.transaction.transactionId
        console.log('[IAP_FIX_V5] purchaseProduct result:', {
          hasResult: !!result,
          keys: result ? Object.keys(result) : [],
          flatTxnId: result?.transactionId,
          nestedTxnId: result?.transaction?.transactionId,
        });
        
        const flatTxnId = result?.transactionId;
        const nestedTxnId = result?.transaction?.transactionId || result?.transaction?.transactionIdentifier;
        const txnId = flatTxnId || nestedTxnId;
        
        if (!txnId) {
          console.error('[IAP_FIX_V5] ❌ No transactionId found in result:', result);
          throw new Error('No transaction returned');
        }
        
        // Store for later finishing (use result as source, it IS the transaction)
        pendingTransactions.set(txnId, result);
        
        console.log('[IAP_FIX_V5] ✅ Purchase approved:', txnId);
        
        // Map fields with FLAT-first, NESTED fallback
        return {
          transactionId: txnId,
          productId: result?.productIdentifier || result?.transaction?.productIdentifier || productId,
          receipt: result?.receipt || result?.transaction?.receipt || result?.transaction?.appStoreReceipt,
          originalTransactionId: result?.originalTransactionId || result?.transaction?.originalTransactionId,
          jwsRepresentation: result?.jwsRepresentation || result?.transaction?.jwsRepresentation,
        };
      } catch (error: any) {
        // Handle user cancellation - check multiple patterns
        const msg = error?.message?.toLowerCase() || '';
        const isCancel = error?.code === 'USER_CANCELLED' || 
                         msg.includes('cancel') || 
                         msg.includes('user cancelled');
        if (isCancel) {
          console.log('[IAP_FIX_V5] User cancelled purchase');
          throw new Error('Purchase cancelled by user');
        }
        throw error;
      }
    },
    finishTransaction: async (transactionId: string) => {
      try {
        // @capgo/native-purchases uses acknowledgePurchase with purchaseToken (= transactionId on iOS)
        console.log('[IAP Capgo] Acknowledging transaction:', transactionId);
        await CapgoNativePurchases.acknowledgePurchase({ purchaseToken: String(transactionId) });
        pendingTransactions.delete(transactionId);
        console.log('[IAP Capgo] ✅ Transaction acknowledged:', transactionId);
        return true;
      } catch (error) {
        console.error('[IAP Capgo] acknowledgePurchase error:', error);
        return false;
      }
    },
    restore: async () => {
      try {
        await CapgoNativePurchases.restorePurchases();
        return { restored: true };
      } catch (error) {
        console.error('[IAP Capgo] restore error:', error);
        return { restored: false };
      }
    },
  };
}

/**
 * Wrap cordova-plugin-purchase to match our interface
 * 
 * ⚠️ CRITICAL: DO NOT call transaction.finish() until server validation is complete!
 * The purchase flow is:
 * 1. Client initiates purchase
 * 2. Store returns transaction (NOT yet finished)
 * 3. Client sends to server for validation
 * 4. Server validates receipt and credits M1U
 * 5. ONLY THEN client calls finishTransaction()
 */
function wrapCordovaPlugin(store: any): any {
  // Store pending transactions for later finish
  const pendingTransactions: Map<string, any> = new Map();
  
  return {
    setup: async ({ platform, products }: any) => {
      // Cordova plugin setup
      store.verbosity = store.DEBUG;
      products.forEach((productId: string) => {
        store.register({
          id: productId,
          type: productId.includes('sub_') ? store.PAID_SUBSCRIPTION : store.CONSUMABLE,
        });
      });
      store.refresh();
    },
    getProducts: async ({ productIds }: any) => {
      return {
        products: productIds.map((id: string) => {
          const product = store.get(id);
          return product ? {
            productId: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            localizedPrice: product.price,
          } : null;
        }).filter(Boolean),
      };
    },
    purchase: async ({ productId }: any) => {
      return new Promise((resolve, reject) => {
        const product = store.get(productId);
        if (!product) {
          reject(new Error('Product not found'));
          return;
        }
        
        product.once('approved', (transaction: any) => {
          // ⚠️ CRITICAL: DO NOT finish() here! Wait for server validation.
          // Store transaction for later finishing
          const txnId = transaction.id || transaction.transactionId;
          pendingTransactions.set(txnId, transaction);
          
          console.log('[IAP Cordova] Transaction approved (NOT finished yet):', txnId);
          
          resolve({
            transactionId: txnId,
            productId: transaction.productId || productId,
            receipt: transaction.appStoreReceipt || transaction.receipt,
            // Keep reference to finish later
            _pendingTransaction: transaction,
          });
          // ❌ REMOVED: transaction.finish() - now called after server validation
        });
        
        product.once('error', (err: any) => {
          reject(new Error(err.message || 'Purchase failed'));
        });
        
        store.order(product);
      });
    },
    // New method to finish transaction after server validation
    finishTransaction: async (transactionId: string) => {
      const transaction = pendingTransactions.get(transactionId);
      if (transaction) {
        console.log('[IAP Cordova] ✅ Finishing transaction:', transactionId);
        transaction.finish();
        pendingTransactions.delete(transactionId);
        return true;
      }
      console.warn('[IAP Cordova] ⚠️ Transaction not found for finish:', transactionId);
      return false;
    },
    restore: async () => {
      return new Promise((resolve) => {
        store.refresh();
        setTimeout(resolve, 2000); // Give time for restore
      });
    },
  };
}

// ============================================================================
// PURCHASE FLOW
// ============================================================================

/**
 * Purchase a product
 * 
 * ⚠️ CRITICAL FLOW:
 * 1. Execute purchase with store
 * 2. Store returns transaction (NOT finished yet)
 * 3. Send receipt to server for validation
 * 4. Server validates and credits M1U
 * 5. ONLY THEN call finishTransaction()
 * 
 * This prevents:
 * - Double charging (purchase finished but server failed)
 * - Ghost purchases (transaction lost without credit)
 */
export async function purchase(productCode: string): Promise<IAPPurchaseResult> {
  // 🔍 [IAP_FIX_V4] Trace entry
  console.log('[IAP_FIX_V4] purchase() called', { productCode });
  
  if (!iapState.initialized) {
    console.log('[IAP_FIX_V4] ❌ IAP not initialized');
    return { success: false, error: 'IAP not initialized' };
  }

  const product = ALL_PRODUCTS.find(p => p.code === productCode);
  if (!product) {
    console.log('[IAP_FIX_V4] ❌ Product not found for code:', productCode);
    return { success: false, error: 'Product not found' };
  }

  const platform = getCapacitorPlatform() as 'ios' | 'android';
  const storeProductId = getStoreProductId(product, platform);
  
  // 🔍 [IAP_FIX_V4] HARD GUARD: storeProductId MUST be non-empty string
  if (!storeProductId || typeof storeProductId !== 'string' || storeProductId.trim() === '') {
    console.error('[IAP_FIX_V4] ❌ CRITICAL: storeProductId is empty/invalid!', {
      productCode,
      product,
      platform,
      storeProductId,
    });
    return { success: false, error: 'SKU mancante - prodotto non configurato' };
  }
  
  console.log('[IAP_FIX_V4] ✅ storeProductId resolved', { 
    productCode, 
    storeProductId,
    appleProductId: product.appleProductId,
    googleProductId: product.googleProductId,
  });

  updateState({ status: 'purchasing' });
  logComplianceEvent('iap_purchase_started', { productCode, storeProductId, platform });

  let purchasesPlugin: any = null;
  let purchaseResult: any = null;

  try {
    purchasesPlugin = await loadPurchasesPlugin();
    if (!purchasesPlugin) {
      throw new Error('Purchases plugin not available');
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: Execute purchase with store (transaction NOT finished yet)
    // ═══════════════════════════════════════════════════════════════════
    console.log('[IAP] Step 1: Executing purchase...', { productCode, storeProductId });
    purchaseResult = await purchasesPlugin.purchase({ productId: storeProductId });
    
    if (!purchaseResult || !purchaseResult.transactionId) {
      throw new Error('Purchase did not complete - no transaction ID');
    }

    console.log('[IAP] Step 1 complete: Purchase approved by store', {
      transactionId: purchaseResult.transactionId,
      hasReceipt: !!purchaseResult.receipt,
    });

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: Validate with server (DO NOT finish transaction yet!)
    // ═══════════════════════════════════════════════════════════════════
    updateState({ status: 'validating' });
    console.log('[IAP] Step 2: Validating with server...');
    
    const validationResult = await validatePurchaseServerSide({
      platform,
      productCode,
      storeProductId,
      transactionId: purchaseResult.transactionId,
      receipt: purchaseResult.receipt || purchaseResult.appStoreReceipt,
      jws: purchaseResult.jwsRepresentation,
      originalTransactionId: purchaseResult.originalTransactionId,
    });

    if (!validationResult.success) {
      // 🔧 [IAP_FIX_V7] Check if this is a retriable network error
      if (validationResult.isNetworkError) {
        // Add to retry queue - purchase is valid, just server unreachable
        console.log('[IAP_FIX_V7] 📥 Adding to retry queue (network error)');
        
        await addPendingValidation({
          transactionId: purchaseResult.transactionId,
          productId: storeProductId,
          productCode,
          platform,
          jws: purchaseResult.jwsRepresentation,
          receipt: purchaseResult.receipt || purchaseResult.appStoreReceipt,
          originalTransactionId: purchaseResult.originalTransactionId,
        });
        
        // Schedule first retry
        const delay = getRetryDelay(0);
        scheduleRetry(purchaseResult.transactionId, delay, async () => {
          await processPendingValidations();
        });
        
        // Return special "pending" status to UI
        updateState({ status: 'ready', error: undefined });
        return { 
          success: false, 
          error: 'PENDING_VALIDATION',
          transactionId: purchaseResult.transactionId,
          productCode,
          pendingValidation: true,
        };
      }
      
      // Hard error - DO NOT add to queue
      console.error('[IAP] Server validation failed (hard error) - transaction NOT finished', validationResult.error);
      throw new Error(validationResult.error || 'Server validation failed');
    }

    console.log('[IAP] Step 2 complete: Server validated and credited', {
      newBalance: validationResult.newBalance,
    });

    // ═══════════════════════════════════════════════════════════════════
    // STEP 3: ONLY NOW finish the transaction with the store
    // ═══════════════════════════════════════════════════════════════════
    console.log('[IAP] Step 3: Finishing transaction with store...');
    
    if (purchasesPlugin.finishTransaction) {
      await purchasesPlugin.finishTransaction(purchaseResult.transactionId);
      console.log('[IAP] Step 3 complete: Transaction finished');
    } else {
      // Some plugins auto-finish, log warning
      console.warn('[IAP] Plugin does not support finishTransaction - may auto-finish');
    }

    // ═══════════════════════════════════════════════════════════════════
    // SUCCESS
    // ═══════════════════════════════════════════════════════════════════
    updateState({ status: 'ready' });
    logComplianceEvent('iap_purchase_success', { 
      productCode, 
      transactionId: purchaseResult.transactionId,
      platform,
      newBalance: validationResult.newBalance,
    });

    return {
      success: true,
      transactionId: purchaseResult.transactionId,
      productCode,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
    
    // 🔍 [IAP_FIX_V4] Check for user cancellation
    const isUserCancelled = errorMessage.toLowerCase().includes('cancel') || 
                            errorMessage.includes('userCancelled') ||
                            (error as any)?.code === 'USER_CANCELLED';
    
    console.log('[IAP_FIX_V4] purchase() error', { 
      errorMessage, 
      isUserCancelled,
      hasTransaction: !!purchaseResult?.transactionId,
    });
    
    // 🔍 [IAP_FIX_V4] Don't treat cancellation as error
    if (isUserCancelled) {
      updateState({ status: 'ready', error: undefined });
      return { success: false, error: 'USER_CANCELLED', cancelled: true };
    }
    
    // Log whether we have an unfinished transaction
    if (purchaseResult?.transactionId) {
      console.error('[IAP] ❌ Error after purchase - transaction NOT finished:', {
        transactionId: purchaseResult.transactionId,
        error: errorMessage,
        canRetry: true,
      });
      logComplianceEvent('iap_purchase_error_unfinished', { 
        productCode, 
        transactionId: purchaseResult.transactionId,
        error: errorMessage 
      });
    } else {
      logComplianceEvent('iap_purchase_error', { productCode, error: errorMessage });
    }
    
    updateState({ status: 'ready', error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Validate purchase with Supabase backend (V2 - with rate limiting & idempotency)
 * 
 * This calls the secure `verify-iap-purchase` edge function which:
 * - Validates receipt with Apple/Google
 * - Checks for replay attacks
 * - Enforces idempotency (no double credits)
 * - Credits M1U atomically
 * - Returns new balance
 * 
 * 🔧 [IAP_FIX_V8] Enhanced with:
 * - Primary: supabase.functions.invoke() (handles WKWebView better)
 * - Fallback: Direct fetch with XMLHttpRequest
 * - JWS truncation to avoid body size issues
 * - Detailed network diagnostics
 * - Retry queue support for network failures
 * - Balance lock during pending validation
 */

// Track pending validations to prevent balance rollback
const pendingValidationTransactions = new Set<string>();

export function isValidationPending(transactionId: string): boolean {
  return pendingValidationTransactions.has(transactionId);
}

export function hasPendingValidations(): boolean {
  return pendingValidationTransactions.size > 0;
}

async function validatePurchaseServerSide(params: {
  platform: 'ios' | 'android';
  productCode: string;
  storeProductId: string;
  transactionId: string;
  receipt?: string;
  jws?: string;
  originalTransactionId?: string;
}): Promise<{ success: boolean; error?: string; newBalance?: number; isNetworkError?: boolean }> {
  const functionName = 'verify-iap-purchase';
  
  // Mark as pending to prevent balance rollback
  pendingValidationTransactions.add(params.transactionId);
  
  try {
    // 🔍 [IAP_FIX_V8] Pre-call diagnostics
    console.log('[IAP_FIX_V8] 📤 Pre-validation diagnostics:', {
      functionName,
      platform: params.platform,
      productCode: params.productCode,
      transactionId: params.transactionId,
      hasReceipt: !!params.receipt,
      hasJws: !!params.jws,
      receiptLength: params.receipt?.length || 0,
      jwsLength: params.jws?.length || 0,
      navigatorOnline: typeof navigator !== 'undefined' ? navigator.onLine : 'N/A',
    });

    // 🔍 [IAP_FIX_V8] Check session state
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    console.log('[IAP_FIX_V8] 🔐 Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userId: session?.user?.id || 'NO_USER',
      sessionError: sessionError?.message || null,
    });

    if (!session?.access_token) {
      console.error('[IAP_FIX_V8] ❌ No valid session');
      pendingValidationTransactions.delete(params.transactionId);
      return { 
        success: false, 
        error: 'Sessione scaduta - effettua nuovamente il login',
        isNetworkError: false,
      };
    }

    // 🔍 [IAP_FIX_V8] Prepare request body (truncate JWS if too large)
    const requestBody = {
      platform: params.platform,
      product_id: params.storeProductId,
      transaction_id: params.transactionId,
      original_transaction_id: params.originalTransactionId,
      purchase_token: params.platform === 'android' ? params.transactionId : undefined,
      // Truncate receipt if too large (server can verify via transaction_id)
      receipt_data: params.receipt && params.receipt.length > 50000 ? undefined : params.receipt,
      // JWS can be very large - only send first part for logging, full validation via transaction_id
      jws_representation: params.jws && params.jws.length > 50000 
        ? params.jws.slice(0, 10000) 
        : params.jws,
    };

    console.log('[IAP_FIX_V8] 📦 Request body size:', JSON.stringify(requestBody).length, 'chars');

    // ═══════════════════════════════════════════════════════════════════
    // METHOD 1: Try supabase.functions.invoke() first (handles WKWebView better)
    // ═══════════════════════════════════════════════════════════════════
    console.log('[IAP_FIX_V8] 🚀 Trying supabase.functions.invoke()...');
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody,
      });
      
      const elapsed = Date.now() - startTime;
      console.log('[IAP_FIX_V8] ⏱️ supabase.functions.invoke response:', {
        elapsed: elapsed + 'ms',
        hasData: !!data,
        hasError: !!error,
        errorName: error?.name,
        errorMessage: error?.message?.slice(0, 200),
      });
      
      if (error) {
        // Check if it's a network error vs server error
        const isNetworkError = 
          error.message?.includes('Load failed') ||
          error.message?.includes('Failed to send') ||
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.name === 'FunctionsFetchError';
        
        if (isNetworkError) {
          console.log('[IAP_FIX_V8] ⚠️ Network error, will try XMLHttpRequest fallback...');
          // Continue to fallback below
          throw new Error('FALLBACK_REQUIRED');
        }
        
        // Server error - don't retry
        console.error('[IAP_FIX_V8] ❌ Server error:', error);
        pendingValidationTransactions.delete(params.transactionId);
        return {
          success: false,
          error: error.message || 'Verifica acquisto fallita',
          isNetworkError: false,
        };
      }
      
      if (!data?.success) {
        console.error('[IAP_FIX_V8] ❌ Server returned failure:', data);
        pendingValidationTransactions.delete(params.transactionId);
        return { 
          success: false, 
          error: data?.error || 'Verifica acquisto fallita',
          isNetworkError: false,
        };
      }

      console.log('[IAP_FIX_V8] ✅ Validation successful via supabase.functions.invoke:', {
        newBalance: data.new_balance,
        transactionId: data.transaction_id,
      });
      
      pendingValidationTransactions.delete(params.transactionId);
      return { 
        success: true, 
        newBalance: data.new_balance,
        isNetworkError: false,
      };
      
    } catch (invokeError: any) {
      if (invokeError?.message !== 'FALLBACK_REQUIRED') {
        console.error('[IAP_FIX_V8] 💥 Invoke exception:', invokeError);
      }
      // Continue to XMLHttpRequest fallback
    }

    // ═══════════════════════════════════════════════════════════════════
    // METHOD 2: XMLHttpRequest fallback (different WKWebView code path)
    // ═══════════════════════════════════════════════════════════════════
    console.log('[IAP_FIX_V8] 🔄 Trying XMLHttpRequest fallback...');
    const functionUrl = `${SUPABASE_URL}/functions/v1/${functionName}`;
    
    const xhrResult = await new Promise<{ success: boolean; data?: any; error?: string; isNetworkError?: boolean }>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = 20000; // 20 second timeout
      
      xhr.onload = () => {
        console.log('[IAP_FIX_V8] 📥 XHR response:', {
          status: xhr.status,
          responseLength: xhr.responseText?.length || 0,
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              resolve({ success: true, data });
            } else {
              resolve({ success: false, error: data.error || 'Server error' });
            }
          } catch {
            resolve({ success: false, error: 'Invalid response' });
          }
        } else if (xhr.status === 401) {
          resolve({ success: false, error: 'Sessione scaduta - effettua nuovamente il login' });
        } else {
          resolve({ success: false, error: `Server error (${xhr.status})`, isNetworkError: xhr.status >= 500 });
        }
      };
      
      xhr.onerror = () => {
        console.error('[IAP_FIX_V8] 💥 XHR error');
        resolve({ success: false, error: 'Errore di connessione', isNetworkError: true });
      };
      
      xhr.ontimeout = () => {
        console.error('[IAP_FIX_V8] ⏰ XHR timeout');
        resolve({ success: false, error: 'Timeout - server non risponde', isNetworkError: true });
      };
      
      xhr.open('POST', functionUrl);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
      xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
      
      try {
        xhr.send(JSON.stringify(requestBody));
      } catch (sendError) {
        console.error('[IAP_FIX_V8] 💥 XHR send error:', sendError);
        resolve({ success: false, error: 'Errore invio richiesta', isNetworkError: true });
      }
    });

    pendingValidationTransactions.delete(params.transactionId);
    
    if (xhrResult.success) {
      console.log('[IAP_FIX_V8] ✅ Validation successful via XMLHttpRequest:', {
        newBalance: xhrResult.data?.new_balance,
      });
      return { 
        success: true, 
        newBalance: xhrResult.data?.new_balance,
        isNetworkError: false,
      };
    }
    
    console.error('[IAP_FIX_V8] ❌ Both methods failed:', xhrResult.error);
    return {
      success: false,
      error: xhrResult.error || 'Verifica acquisto fallita',
      isNetworkError: xhrResult.isNetworkError ?? true,
    };
    
  } catch (err: any) {
    console.error('[IAP_FIX_V8] 💥 Validation exception:', {
      name: err?.name,
      message: err?.message,
    });
    
    pendingValidationTransactions.delete(params.transactionId);
    return { 
      success: false, 
      error: 'Errore imprevisto nella verifica',
      isNetworkError: true,
    };
  }
}

/**
 * Process pending validations from the retry queue
 */
export async function processPendingValidations(): Promise<void> {
  const pending = await getPendingValidations();
  const activePending = pending.filter(p => p.status === 'pending' || p.status === 'retrying');
  
  if (activePending.length === 0) {
    console.log('[IAP_QUEUE] 📭 No pending validations to process');
    return;
  }
  
  console.log('[IAP_QUEUE] 🔄 Processing', activePending.length, 'pending validations');
  
  for (const item of activePending) {
    await retryValidation(item);
  }
}

/**
 * Retry a single pending validation
 */
async function retryValidation(item: PendingValidation): Promise<boolean> {
  console.log('[IAP_QUEUE] 🔄 Retrying validation:', {
    transactionId: item.transactionId,
    productId: item.productId,
    attempts: item.attempts,
  });
  
  // Update status
  await updatePendingValidation(item.transactionId, {
    status: 'retrying',
    attempts: item.attempts + 1,
    lastAttempt: new Date().toISOString(),
  });
  
  // Attempt validation
  const result = await validatePurchaseServerSide({
    platform: item.platform,
    productCode: item.productCode,
    storeProductId: item.productId,
    transactionId: item.transactionId,
    receipt: item.receipt,
    jws: item.jws,
    originalTransactionId: item.originalTransactionId,
  });
  
  if (result.success) {
    // Success! Remove from queue
    await removePendingValidation(item.transactionId);
    console.log('[IAP_QUEUE] ✅ Validation succeeded on retry:', item.transactionId);
    
    // Notify UI of success (if possible)
    notifyListeners();
    return true;
  }
  
  // Failed - check if retriable
  const newAttempts = item.attempts + 1;
  
  if (!result.isNetworkError || !isRetriableError(result.error)) {
    // Hard error - mark as blocked
    await markAsBlocked(item.transactionId, result.error || 'Unknown error');
    console.log('[IAP_QUEUE] 🚫 Hard error, marked as blocked:', item.transactionId);
    return false;
  }
  
  if (!shouldRetry(newAttempts)) {
    // Max retries reached
    await markAsBlocked(item.transactionId, 'Numero massimo di tentativi raggiunto');
    console.log('[IAP_QUEUE] 🚫 Max retries reached:', item.transactionId);
    return false;
  }
  
  // Schedule next retry
  await updatePendingValidation(item.transactionId, {
    status: 'pending',
    lastError: result.error,
  });
  
  const delay = getRetryDelay(newAttempts);
  scheduleRetry(item.transactionId, delay, async () => {
    const updatedItem = (await getPendingValidations()).find(p => p.transactionId === item.transactionId);
    if (updatedItem && updatedItem.status !== 'blocked' && updatedItem.status !== 'completed') {
      await retryValidation(updatedItem);
    }
  });
  
  return false;
}

// ============================================================================
// RESTORE PURCHASES
// ============================================================================

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<IAPPurchaseResult> {
  if (!iapState.initialized) {
    return { success: false, error: 'IAP not initialized' };
  }

  updateState({ status: 'validating' });
  logComplianceEvent('iap_restore_started');

  try {
    const purchasesPlugin = await loadPurchasesPlugin();
    if (!purchasesPlugin) {
      throw new Error('Purchases plugin not available');
    }

    await purchasesPlugin.restore();

    // Sync with server
    const { data, error } = await supabase.functions.invoke('restore-iap', {
      body: { platform: getCapacitorPlatform() },
    });

    if (error) {
      throw new Error(error.message);
    }

    updateState({ status: 'ready' });
    logComplianceEvent('iap_restore_success');

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Restore failed';
    updateState({ status: 'ready', error: errorMessage });
    logComplianceEvent('iap_restore_error', { error: errorMessage });
    
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// GETTERS
// ============================================================================

/**
 * Get current IAP status
 */
export function getIAPStatus(): IAPStatus {
  return iapState.status;
}

/**
 * Get available products from store
 */
export function getStoreProducts(): IAPStoreProduct[] {
  return iapState.products;
}

/**
 * Get last error
 */
export function getIAPError(): string | null {
  return iapState.error;
}

/**
 * Check if IAP is ready
 */
export function isIAPReady(): boolean {
  return iapState.initialized && iapState.status === 'ready';
}

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to IAP state changes
 */
export function subscribeToIAP(listener: (state: IAPState) => void): () => void {
  listeners.add(listener);
  // Immediately call with current state
  listener(iapState);
  
  return () => {
    listeners.delete(listener);
  };
}

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect } from 'react';

/**
 * React hook for IAP state
 */
export function useIAP() {
  const [state, setState] = useState<IAPState>(iapState);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    return subscribeToIAP(setState);
  }, []);

  // Check pending validations count
  useEffect(() => {
    const checkPending = async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    };
    checkPending();
    // Recheck every 30 seconds
    const interval = setInterval(checkPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    purchase,
    restorePurchases,
    initIAP,
    isNativeIAPAvailable,
    isIAPReady: state.initialized && state.status === 'ready',
    pendingValidations: pendingCount,
    retryPendingValidations: processPendingValidations,
    getPendingValidations,
  };
}

// Re-export queue utilities for external use
export {
  getPendingValidations,
  getPendingCount,
  // processPendingValidations already exported above
};
