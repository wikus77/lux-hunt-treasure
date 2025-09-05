/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Push Notification Types - Unified System
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type UnifiedSubscription =
  | { 
      kind: 'WEBPUSH'
      endpoint: string
      keys: { p256dh: string; auth: string }
      platform: 'ios' | 'android' | 'desktop' | 'web'
    }
  | { 
      kind: 'FCM'
      token: string
      platform: 'android' | 'web'
    }

export interface PlatformDetection {
  isIOS: boolean
  isPWA: boolean
  isSafari: boolean
  isDesktop: boolean
  platform: 'ios' | 'android' | 'desktop' | 'web'
}

/**
 * Detect current platform and PWA status
 */
export function detectPlatform(): PlatformDetection {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /ipad|iphone|ipod/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://')
  
  let platform: 'ios' | 'android' | 'desktop' | 'web' = 'web'
  
  if (isIOS) {
    platform = 'ios'
  } else if (/android/.test(userAgent)) {
    platform = 'android'
  } else if (window.innerWidth > 1024) {
    platform = 'desktop'
  }
  
  return {
    isIOS,
    isPWA,
    isSafari,
    isDesktop: platform === 'desktop',
    platform
  }
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */