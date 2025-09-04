/* vSW-20250904-1 */
/*
 * M1SSION™ Service Worker - Unified PWA & Push Handler
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 * Simplified for unified push notification handling
 */

// Import push notification handler
importScripts('/sw-push.js');

// Essential PWA lifecycle
self.skipWaiting?.(); 
self.addEventListener?.('activate', () => self.clients?.claim?.());

console.log('🚀 M1SSION™ Unified Service Worker loaded');