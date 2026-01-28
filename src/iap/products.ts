/**
 * M1SSION™ In-App Purchase Products
 * 
 * 🏪 STORE COMPLIANCE (28/01/2026) — OPTION 2:
 * - Native IAP catalog aligned with UI shop (6 packs)
 * - Product IDs: iOS = com.m1ssion.m1u.pack.*, Android = m1u_pack_*
 * - Codes match UI: M1U_STARTER, M1U_AGENT, M1U_ELITE, M1U_COMMANDER, M1U_DIRECTOR, M1U_MASTER
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type IAPProductType = 'consumable' | 'subscription';

export interface IAPProduct {
  /** Internal product code (must match UI codes) */
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
// M1U PACKS (Consumables) — ALIGNED WITH UI SHOP (6 packs)
// ============================================================================

export const M1U_PRODUCTS: IAPProduct[] = [
  {
    code: 'M1U_STARTER',
    appleProductId: 'com.m1ssion.m1u.pack.starter',
    googleProductId: 'm1u_pack_starter',
    type: 'consumable',
    m1uAmount: 50,
    priceEur: 4.99,
    displayName: 'Starter Pack',
  },
  {
    code: 'M1U_AGENT',
    appleProductId: 'com.m1ssion.m1u.pack.agent',
    googleProductId: 'm1u_pack_agent',
    type: 'consumable',
    m1uAmount: 110,
    priceEur: 9.99,
    displayName: 'Agent Pack',
  },
  {
    code: 'M1U_ELITE',
    appleProductId: 'com.m1ssion.m1u.pack.elite',
    googleProductId: 'm1u_pack_elite',
    type: 'consumable',
    m1uAmount: 250,
    priceEur: 19.99,
    displayName: 'Elite Pack',
  },
  {
    code: 'M1U_COMMANDER',
    appleProductId: 'com.m1ssion.m1u.pack.commander',
    googleProductId: 'm1u_pack_commander',
    type: 'consumable',
    m1uAmount: 550,
    priceEur: 39.99,
    displayName: 'Commander Pack',
  },
  {
    code: 'M1U_DIRECTOR',
    appleProductId: 'com.m1ssion.m1u.pack.director',
    googleProductId: 'm1u_pack_director',
    type: 'consumable',
    m1uAmount: 1200,
    priceEur: 79.99,
    displayName: 'Director Pack',
  },
  {
    code: 'M1U_MASTER',
    appleProductId: 'com.m1ssion.m1u.pack.master',
    googleProductId: 'm1u_pack_master',
    type: 'consumable',
    m1uAmount: 3000,
    priceEur: 199.99,
    displayName: 'Master Control',
  },
];

// ============================================================================
// SUBSCRIPTIONS (unchanged)
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

/**
 * Get M1U amount by code (for backend validation)
 */
export function getM1UAmountByCode(code: string): number | undefined {
  const product = M1U_PRODUCTS.find(p => p.code === code);
  return product?.m1uAmount;
}
