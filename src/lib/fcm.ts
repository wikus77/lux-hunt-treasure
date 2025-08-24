// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// FCM Module with Firebase v8 compat and new VAPID key (August 22nd)

import { supabase } from '@/integrations/supabase/client';

// Firebase v8 configuration for M1SSION™
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCPlSY8Hzq_bvLoh72iTZSn8GETHILXM_fU",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.appspot.com",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95",
  measurementId: "G-749GSNL13V"
};

// NEW VAPID key from August 22nd
const VAPID_KEY = "BJMuwT6jqq_wAQlcqbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o";

// Cache to prevent multiple loads
let firebaseLoaded = false;
let messagingInstance: any = null;
let registrationInstance: ServiceWorkerRegistration | null = null;

declare global {
  interface Window {
    firebase?: any;
  }
}

/**
 * Ensures FCM is ready by loading Firebase v8 compat and registering SW
 */
export async function ensureFcmReady(): Promise<{ messaging: any, registration: ServiceWorkerRegistration }> {
  // Load Firebase scripts if not already loaded
  if (!firebaseLoaded && !window.firebase) {
    console.log('🔥 FCM: Loading Firebase v8 compat scripts...');
    
    await Promise.all([
      loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js'),
      loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js')
    ]);
    
    firebaseLoaded = true;
    console.log('✅ FCM: Firebase scripts loaded');
  }

  // Check if Firebase is available
  if (!window.firebase) {
    throw new Error('Firebase not available after loading scripts');
  }

  // Initialize Firebase if not already done
  if (!window.firebase.apps?.length) {
    console.log('🔥 FCM: Initializing Firebase app...');
    window.firebase.initializeApp(FIREBASE_CONFIG);
    console.log('✅ FCM: Firebase app initialized');
  }

  // Register Service Worker if needed
  if (!registrationInstance) {
    console.log('🔧 FCM: Registering Service Worker...');
    registrationInstance = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    console.log('✅ FCM: Service Worker registered at:', registrationInstance.active?.scriptURL);
  }

  // Get messaging instance if not cached
  if (!messagingInstance) {
    if (!window.firebase.messaging.isSupported()) {
      throw new Error('FCM not supported in this browser');
    }
    messagingInstance = window.firebase.messaging();
    console.log('✅ FCM: Messaging instance created');
  }

  return { messaging: messagingInstance, registration: registrationInstance };
}

/**
 * Generates FCM token and saves to Supabase
 */
export async function getAndSaveFcmToken(userId?: string): Promise<string> {
  console.log('🎯 FCM: Starting token generation for user:', userId || 'anonymous');
  
  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(`Notification permission denied: ${permission}`);
  }
  console.log('✅ FCM: Notification permission granted');

  // Ensure FCM is ready
  const { messaging, registration } = await ensureFcmReady();

  // Generate token with new VAPID key
  console.log('🔑 FCM: Generating token with VAPID key:', VAPID_KEY.substring(0, 24) + '...');
  const token = await messaging.getToken({
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error('Failed to generate FCM token');
  }

  console.log('✅ FCM: Token generated successfully:', token.substring(0, 20) + '...');

  // Generate device ID for anonymous users
  const finalUserId = userId || generateDeviceId();

  // Save token to Supabase
  console.log('💾 FCM: Saving token to Supabase for user:', finalUserId);
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ 
      user_id: finalUserId, 
      token, 
      platform: 'web' 
    }, { 
      onConflict: 'token',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('❌ FCM: Supabase save error:', error);
    throw new Error(`Failed to save token: ${error.message}`);
  }

  console.log('✅ FCM: Token saved successfully to Supabase');

  // Cache token in localStorage
  localStorage.setItem('fcm_token', token);
  localStorage.setItem('fcm_user_id', finalUserId);

  return token;
}

/**
 * Gets cached token from localStorage
 */
export function getCachedToken(): string | null {
  return localStorage.getItem('fcm_token');
}

/**
 * Gets cached user ID from localStorage
 */
export function getCachedUserId(): string | null {
  return localStorage.getItem('fcm_user_id');
}

/**
 * Generates a unique device ID for anonymous users
 */
function generateDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `anon:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

/**
 * Dynamically loads a script
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}