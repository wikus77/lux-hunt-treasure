/**
 * M1SSION™ In-App Purchase Products
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026):
 * - Maps product IDs for Apple App Store and Google Play
 * - Consumables: M1U packs
 * - Subscriptions: Silver/Gold/Black/Titanium plans
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type IAPProductType = 'consumable' | 'subscription';

export interface IAPProduct {
  /** Internal product code */
  code: string;
  /** Apple App Store product ID */
  appleProductId: string;
  /** Google Play product ID */
  googleProductId: string;
  /** Product type */
  type: IAPProductType;
  /** M1U amount for consumables */
  m1uAmount?: number;
  /** Subscription tier for subscriptions */
  subscriptionTier?: 'silver' | 'gold' | 'black' | 'titanium';
  /** Price in EUR (display only - actual price from store) */
  priceEur: number;
  /** Display name */
  displayName: string;
}

// ============================================================================
// M1U PACKS (Consumables)
// ============================================================================

export const M1U_PRODUCTS: IAPProduct[] = [
  {
    code: 'M1U_PACK_100',
    appleProductId: 'com.m1ssion.m1u.100',
    googleProductId: 'm1u_pack_100',
    type: 'consumable',
    m1uAmount: 100,
    priceEur: 0.99,
    displayName: '100 M1U',
  },
  {
    code: 'M1U_PACK_500',
    appleProductId: 'com.m1ssion.m1u.500',
    googleProductId: 'm1u_pack_500',
    type: 'consumable',
    m1uAmount: 500,
    priceEur: 3.99,
    displayName: '500 M1U',
  },
  {
    code: 'M1U_PACK_1000',
    appleProductId: 'com.m1ssion.m1u.1000',
    googleProductId: 'm1u_pack_1000',
    type: 'consumable',
    m1uAmount: 1000,
    priceEur: 6.99,
    displayName: '1000 M1U',
  },
  {
    code: 'M1U_PACK_2500',
    appleProductId: 'com.m1ssion.m1u.2500',
    googleProductId: 'm1u_pack_2500',
    type: 'consumable',
    m1uAmount: 2500,
    priceEur: 14.99,
    displayName: '2500 M1U',
  },
  {
    code: 'M1U_PACK_5000',
    appleProductId: 'com.m1ssion.m1u.5000',
    googleProductId: 'm1u_pack_5000',
    type: 'consumable',
    m1uAmount: 5000,
    priceEur: 24.99,
    displayName: '5000 M1U',
  },
];

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export const SUBSCRIPTION_PRODUCTS: IAPProduct[] = [
  {
    code: 'SUB_SILVER',
    appleProductId: 'com.m1ssion.sub.silver',
    googleProductId: 'sub_silver_monthly',
    type: 'subscription',
    subscriptionTier: 'silver',
    priceEur: 4.99,
    displayName: 'Silver Plan',
  },
  {
    code: 'SUB_GOLD',
    appleProductId: 'com.m1ssion.sub.gold',
    googleProductId: 'sub_gold_monthly',
    type: 'subscription',
    subscriptionTier: 'gold',
    priceEur: 9.99,
    displayName: 'Gold Plan',
  },
  {
    code: 'SUB_BLACK',
    appleProductId: 'com.m1ssion.sub.black',
    googleProductId: 'sub_black_monthly',
    type: 'subscription',
    subscriptionTier: 'black',
    priceEur: 19.99,
    displayName: 'Black Plan',
  },
  {
    code: 'SUB_TITANIUM',
    appleProductId: 'com.m1ssion.sub.titanium',
    googleProductId: 'sub_titanium_monthly',
    type: 'subscription',
    subscriptionTier: 'titanium',
    priceEur: 49.99,
    displayName: 'Titanium Plan',
  },
];

// ============================================================================
// ALL PRODUCTS
// ============================================================================

export const ALL_PRODUCTS: IAPProduct[] = [...M1U_PRODUCTS, ...SUBSCRIPTION_PRODUCTS];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get product by internal code
 */
export function getProductByCode(code: string): IAPProduct | undefined {
  return ALL_PRODUCTS.find(p => p.code === code);
}

/**
 * Get product by Apple product ID
 */
export function getProductByAppleId(appleId: string): IAPProduct | undefined {
  return ALL_PRODUCTS.find(p => p.appleProductId === appleId);
}

/**
 * Get product by Google product ID
 */
export function getProductByGoogleId(googleId: string): IAPProduct | undefined {
  return ALL_PRODUCTS.find(p => p.googleProductId === googleId);
}

/**
 * Get store-specific product ID
 */
export function getStoreProductId(product: IAPProduct, platform: 'ios' | 'android'): string {
  return platform === 'ios' ? product.appleProductId : product.googleProductId;
}

/**
 * Get all product IDs for a platform
 */
export function getAllProductIds(platform: 'ios' | 'android'): string[] {
  return ALL_PRODUCTS.map(p => getStoreProductId(p, platform));
}
