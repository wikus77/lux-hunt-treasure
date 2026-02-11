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
import { supabase } from '@/integrations/supabase/client';
import { 
  IAPProduct, 
  ALL_PRODUCTS, 
  getStoreProductId, 
  getAllProductIds,
  getProductByAppleId,
  getProductByGoogleId
} from './products';
import { logComplianceEvent } from '@/utils/storeCompliance';

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
      originalTransactionId: purchaseResult.originalTransactionId,
    });

    if (!validationResult.success) {
      // ⚠️ Server validation failed - DO NOT finish transaction
      // User can retry, or transaction will be recoverable on next app launch
      console.error('[IAP] Server validation failed - transaction NOT finished', validationResult.error);
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
 */
async function validatePurchaseServerSide(params: {
  platform: 'ios' | 'android';
  productCode: string;
  storeProductId: string;
  transactionId: string;
  receipt?: string;
  originalTransactionId?: string;
}): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  try {
    console.log('[IAP] Sending to server for validation:', {
      platform: params.platform,
      productCode: params.productCode,
      transactionId: params.transactionId,
      hasReceipt: !!params.receipt,
    });

    // Use V2 endpoint (verify-iap-purchase) with better security
    const { data, error } = await supabase.functions.invoke('verify-iap-purchase', {
      body: {
        platform: params.platform,
        product_id: params.storeProductId,
        transaction_id: params.transactionId,
        original_transaction_id: params.originalTransactionId,
        purchase_token: params.platform === 'android' ? params.transactionId : undefined,
        receipt_data: params.receipt,
      },
    });

    if (error) {
      console.error('[IAP] Server validation error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      console.error('[IAP] Server returned failure:', data);
      return { success: false, error: data?.error || 'Validation failed' };
    }

    console.log('[IAP] Server validation successful:', {
      newBalance: data.new_balance,
      transactionId: data.transaction_id,
    });

    return { 
      success: true, 
      newBalance: data.new_balance,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Validation request failed';
    console.error('[IAP] Validation request exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
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

  useEffect(() => {
    return subscribeToIAP(setState);
  }, []);

  return {
    ...state,
    purchase,
    restorePurchases,
    initIAP,
    isNativeIAPAvailable,
    isIAPReady: state.initialized && state.status === 'ready',
  };
}
