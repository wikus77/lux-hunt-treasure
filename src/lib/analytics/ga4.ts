/**
 * © 2025 Joseph MULÉ – M1SSION™ – GA4 INTEGRATION
 * Google Analytics 4 with GDPR consent
 */

import { getStoredConsent } from '@/features/consent/consentStorage';

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';

let gaInitialized = false;

/**
 * Initialize GA4 if consent is granted
 */
export function initGA4(): void {
  if (gaInitialized || typeof window === 'undefined') return;

  const consent = getStoredConsent();
  const hasConsent = 
    consent?.status === 'accepted' || 
    (consent?.status === 'granular' && consent?.preferences?.analytics);

  if (!hasConsent) {
    console.log('[GA4] Analytics disabled - no consent');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  gtag('js', new Date());
  gtag('config', GA4_ID, {
    anonymize_ip: true,
    allow_ad_personalization_signals: false
  });

  (window as any).gtag = gtag;
  gaInitialized = true;

  console.log('[GA4] Initialized:', GA4_ID);
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (!gaInitialized || typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', eventName, params);
    console.log('[GA4] Event tracked:', eventName, params);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  if (!gaInitialized) return;

  trackEvent('page_view', {
    page_path: path,
    page_title: title || document.title
  });
}

/**
 * Track buzz clue unlocked
 */
export function trackBuzzClueUnlocked(clueId: string, cost: number): void {
  trackEvent('buzz_clue_unlocked', {
    clue_id: clueId,
    cost_m1u: cost,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track marker reward claimed
 */
export function trackMarkerRewardClaimed(markerId: string, rewardType: string): void {
  trackEvent('marker_reward_claimed', {
    marker_id: markerId,
    reward_type: rewardType,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track M1U transaction
 */
export function trackM1UTransaction(type: 'spend' | 'purchase' | 'reward', amount: number, source: string): void {
  trackEvent('m1u_transaction', {
    transaction_type: type,
    amount,
    source,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track mission enrollment
 */
export function trackMissionEnrollment(missionId: string): void {
  trackEvent('mission_enrolled', {
    mission_id: missionId,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track battle action
 */
export function trackBattleAction(action: 'create' | 'join' | 'complete' | 'abandon', battleId: string, result?: string): void {
  trackEvent('battle_action', {
    action,
    battle_id: battleId,
    result,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track authentication event
 */
export function trackAuth(action: 'login' | 'logout' | 'signup' | 'anonymous', method?: string): void {
  trackEvent(`auth_${action}`, {
    method: method || 'unknown',
    timestamp: new Date().toISOString()
  });
}

/**
 * Track error for monitoring (non-PII)
 */
export function trackError(errorId: string, errorType: string, componentName?: string): void {
  trackEvent('app_error', {
    error_id: errorId,
    error_type: errorType,
    component: componentName || 'unknown',
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track push notification interaction
 */
export function trackPushInteraction(action: 'received' | 'clicked' | 'dismissed', notificationId?: string): void {
  trackEvent('push_notification', {
    action,
    notification_id: notificationId || 'unknown',
    timestamp: new Date().toISOString()
  });
}

/**
 * Track subscription change
 */
export function trackSubscription(action: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel', plan: string): void {
  trackEvent('subscription_change', {
    action,
    plan,
    timestamp: new Date().toISOString()
  });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
