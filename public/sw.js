/*
 * M1SSION™ Service Worker - PWA Enhanced - P0 OPERA FIX
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 * Fixed: Opera loading freeze + always return Response
 */

// Import push notification handler
importScripts('/sw-push.js');
self.skipWaiting?.(); 
self.addEventListener?.('activate', () => self.clients?.claim?.());

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Version bump for cache invalidation - P0 Fix
const SW_VERSION = "v2025-09-02-01";
console.log(`🔄 M1SSION™ SW ${SW_VERSION} starting...`);

// Precache Workbox-generated assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache Supabase API calls with network-first strategy
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 10,
  })
);

// Cache images with cache-first strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
  })
);

// Cache CSS and JS files
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new CacheFirst({
    cacheName: 'static-resources',
  })
);

// Handle navigation requests with fallback
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
  })
);

// CRITICAL P0 FIX: Enhanced install/activate for Opera compatibility
self.addEventListener('install', (event) => {
  console.log(`🚀 SW ${SW_VERSION} installing...`);
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', (event) => {
  console.log(`✅ SW ${SW_VERSION} activated`);
  event.waitUntil(clients.claim()); // Take control immediately
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// CRITICAL P0 FIX: Opera loading freeze - ALWAYS return Response
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Navigation requests - prevent Opera loading freeze
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const response = await fetch(request);
          return response;
        } catch (error) {
          // Fallback to cached index.html for SPA routing
          console.log(`🔄 SW navigation fallback for: ${request.url}`);
          const cachedResponse = await caches.match('/index.html');
          return cachedResponse || new Response('<!doctype html><title>Offline</title>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })()
    );
    return;
  }
  
  // P0 FIX: All other requests must ALWAYS return Response
  event.respondWith(fetch(request));
});

// Push notification handler with iOS compatibility
self.addEventListener('push', (event) => {
  console.log('🔔 Push received:', event);
  
  if (!event.data) {
    console.warn('Push event has no data');
    return;
  }
  
  try {
    let notificationData;
    
    // Try parsing as JSON first
    try {
      notificationData = event.data.json();
    } catch {
      // Fallback for text data
      notificationData = {
        title: 'M1SSION™',
        body: event.data.text() || 'Nuova notifica',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: { url: 'https://m1ssion.eu' }
      };
    }
    
    // Handle nested data structure
    if (notificationData.data && typeof notificationData.data === 'string') {
      try {
        const nestedData = JSON.parse(notificationData.data);
        notificationData = { ...notificationData, ...nestedData };
      } catch {
        // Keep original if parsing fails
      }
    }
    
    const notificationOptions = {
      body: notificationData.body || 'Nuova notifica',
      icon: notificationData.icon || '/icon-192x192.png',
      badge: notificationData.badge || '/icon-192x192.png',
      data: notificationData.data || { url: 'https://m1ssion.eu' },
      tag: notificationData.tag || 'mission-notification',
      requireInteraction: false,
      silent: false
    };
    
    event.waitUntil(
      self.registration.showNotification(
        notificationData.title || 'M1SSION™',
        notificationOptions
      ).then(() => {
        console.log('✅ Notification displayed successfully');
        // Send message back to clients
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PUSH_RECEIVED',
              notification: notificationData
            });
          });
        });
      })
    );
    
  } catch (error) {
    console.error('❌ Push notification error:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('M1SSION™', {
        body: 'Errore nella notifica',
        icon: '/icon-192x192.png',
        data: { url: 'https://m1ssion.eu' }
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🎯 Notification click:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || 'https://m1ssion.eu';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes('m1ssion.eu') && 'focus' in client) {
            return client.focus().then(() => {
              // Navigate to specific URL if provided
              if (urlToOpen !== client.url) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }
        // Open new window if app not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log(`🎯 M1SSION™ SW ${SW_VERSION} ready`);
