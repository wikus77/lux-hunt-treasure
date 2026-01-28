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

// ============================================================================
// TYPES
// ============================================================================

export type IAPStatus = 'idle' | 'initializing' | 'ready' | 'purchasing' | 'validating' | 'error';

export interface IAPPurchaseResult {
  success: boolean;
  transactionId?: string;
  productCode?: string;
  error?: string;
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
      productIds: getAllProductIds(platform),
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
 */
async function loadPurchasesPlugin(): Promise<any> {
  try {
    // Try to load native IAP plugin dynamically
    // This will only succeed in native Capacitor builds with the plugin installed
    const moduleName = '@capawesome-team/capacitor-purchases';
    const module = await import(/* @vite-ignore */ moduleName);
    if (module?.Purchases) {
      console.log('[IAP] ✅ Loaded capacitor-purchases plugin');
      return module.Purchases;
    }
  } catch (error) {
    console.log('[IAP] capacitor-purchases not available, trying alternatives');
  }

  try {
    // Fallback: try cordova-plugin-purchase
    const moduleName = 'cordova-plugin-purchase';
    const module = await import(/* @vite-ignore */ moduleName);
    if (module?.InAppPurchase2) {
      console.log('[IAP] ✅ Loaded cordova-plugin-purchase');
      return wrapCordovaPlugin(module.InAppPurchase2);
    }
  } catch (error) {
    console.log('[IAP] cordova-plugin-purchase not available');
  }

  console.warn('[IAP] ⚠️ No IAP plugin available - native purchases will not work');
  return null;
}

/**
 * Wrap cordova-plugin-purchase to match our interface
 */
function wrapCordovaPlugin(store: any): any {
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
          resolve({
            transactionId: transaction.id,
            productId: transaction.productId,
            receipt: transaction.receipt,
          });
          transaction.finish();
        });
        
        product.once('error', (err: any) => {
          reject(new Error(err.message || 'Purchase failed'));
        });
        
        store.order(product);
      });
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
 */
export async function purchase(productCode: string): Promise<IAPPurchaseResult> {
  if (!iapState.initialized) {
    return { success: false, error: 'IAP not initialized' };
  }

  const product = ALL_PRODUCTS.find(p => p.code === productCode);
  if (!product) {
    return { success: false, error: 'Product not found' };
  }

  const platform = getCapacitorPlatform() as 'ios' | 'android';
  const storeProductId = getStoreProductId(product, platform);

  updateState({ status: 'purchasing' });
  logComplianceEvent('iap_purchase_started', { productCode, storeProductId });

  try {
    const purchasesPlugin = await loadPurchasesPlugin();
    if (!purchasesPlugin) {
      throw new Error('Purchases plugin not available');
    }

    // Execute purchase
    const result = await purchasesPlugin.purchase({ productId: storeProductId });
    
    if (!result || !result.transactionId) {
      throw new Error('Purchase did not complete');
    }

    // Validate purchase server-side
    updateState({ status: 'validating' });
    
    const validationResult = await validatePurchase({
      platform,
      productCode,
      storeProductId,
      transactionId: result.transactionId,
      receipt: result.receipt,
    });

    if (!validationResult.success) {
      throw new Error(validationResult.error || 'Validation failed');
    }

    updateState({ status: 'ready' });
    logComplianceEvent('iap_purchase_success', { productCode, transactionId: result.transactionId });

    return {
      success: true,
      transactionId: result.transactionId,
      productCode,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
    updateState({ status: 'ready', error: errorMessage });
    logComplianceEvent('iap_purchase_error', { productCode, error: errorMessage });
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Validate purchase with Supabase backend
 */
async function validatePurchase(params: {
  platform: 'ios' | 'android';
  productCode: string;
  storeProductId: string;
  transactionId: string;
  receipt?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('validate-iap', {
      body: params,
    });

    if (error) {
      console.error('[IAP] Validation error:', error);
      return { success: false, error: error.message };
    }

    return { success: data?.success === true, error: data?.error };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Validation request failed';
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
