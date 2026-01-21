/* M1SSION™ FCM Diagnostics - Advanced Implementation */

let fcmApp = null;
let fcmMessaging = null;
let currentToken = null;
let debugLog = [];

function log(msg) {
  const timestamp = new Date().toLocaleTimeString();
  const logMsg = `[${timestamp}] ${msg}`;
  debugLog.push(logMsg);
  console.log(logMsg);
  updateLogDisplay();
}

function updateLogDisplay() {
  const logElement = document.getElementById('debug-log');
  if (logElement) {
    logElement.textContent = debugLog.slice(-50).join('\n');
    logElement.scrollTop = logElement.scrollHeight;
  }
}

function setStatus(elementId, status, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.className = `status ${status}`;
    element.textContent = text;
  }
}

async function initializePage() {
  log('🚀 M1SSION™ FCM Diagnostics Starting...');
  
  // Domain info
  document.getElementById('domain').textContent = window.location.hostname;
  
  // Check basic support
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasNotification = 'Notification' in window;
  const hasPushManager = 'PushManager' in window;
  
  setStatus('notification-api', hasNotification ? 'ok' : 'error', hasNotification ? 'Available' : 'Not Available');
  
  // FCM Support check
  try {
    const { isSupported } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');
    const supported = await isSupported();
    setStatus('fcm-support', supported ? 'ok' : 'error', supported ? 'Supported' : 'Not Supported');
  } catch (e) {
    setStatus('fcm-support', 'error', 'Check Failed');
    log('❌ FCM support check failed: ' + e.message);
  }
  
  // Permission status
  updatePermissionStatus();
  
  // Config check
  checkConfig();
  
  // Service Worker check
  await checkServiceWorker();
  
  log('✅ Page initialization complete');
}

function updatePermissionStatus() {
  const permission = Notification.permission;
  const statusMap = {
    'granted': { status: 'ok', text: 'Granted' },
    'denied': { status: 'error', text: 'Denied' },
    'default': { status: 'warning', text: 'Not Requested' }
  };
  const { status, text } = statusMap[permission] || { status: 'error', text: 'Unknown' };
  setStatus('notification-permission', status, text);
}

function checkConfig() {
  const config = self.__FIREBASE_CFG__;
  if (config) {
    setStatus('config-loaded', 'ok', 'Loaded');
    document.getElementById('config-display').textContent = JSON.stringify(config, null, 2);
    log('✅ Firebase config loaded');
  } else {
    setStatus('config-loaded', 'error', 'Missing');
    document.getElementById('config-display').textContent = 'Config not found in self.__FIREBASE_CFG__';
    log('❌ Firebase config missing');
  }
}

async function checkServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    setStatus('sw-active', 'error', 'Not Supported');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      setStatus('sw-active', 'ok', 'Active');
      document.getElementById('sw-url').textContent = registration.active.scriptURL;
      log('✅ Service Worker active: ' + registration.active.scriptURL);
    } else {
      setStatus('sw-active', 'warning', 'Not Active');
      document.getElementById('sw-url').textContent = 'None';
      log('⚠️ No active Service Worker');
    }
  } catch (e) {
    setStatus('sw-active', 'error', 'Check Failed');
    log('❌ Service Worker check failed: ' + e.message);
  }
}

async function requestPermission() {
  try {
    log('🔐 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    log(`🔐 Permission result: ${permission}`);
    updatePermissionStatus();
    return permission === 'granted';
  } catch (e) {
    log('❌ Permission request failed: ' + e.message);
    return false;
  }
}

async function loadConfig() {
  log('⚙️ Reloading config...');
  checkConfig();
}

async function generateToken() {
  try {
    log('🎯 Starting FCM token generation...');
    
    const cfg = self.__FIREBASE_CFG__;
    if (!cfg) {
      throw new Error("Missing Firebase config");
    }
    
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getMessaging, getToken, onMessage, isSupported } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');
    
    // Check support
    const supported = await isSupported();
    if (!supported) {
      throw new Error("FCM not supported in this browser");
    }
    
    // Initialize app
    if (!fcmApp) {
      fcmApp = initializeApp(cfg);
      log('✅ Firebase app initialized');
    }
    
    // Request permission if needed
    if (Notification.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        throw new Error("Notification permission denied");
      }
    }
    
    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    log('✅ Service Worker registered');
    
    // Get messaging instance
    fcmMessaging = getMessaging(fcmApp);
    
    // Generate token
    const token = await getToken(fcmMessaging, { 
      vapidKey: cfg.vapidKey, 
      serviceWorkerRegistration: reg 
    });
    
    if (token) {
      currentToken = token;
      setStatus('token-status', 'ok', 'Generated');
      document.getElementById('token-display').textContent = token;
      log('✅ FCM TOKEN: ' + token.substring(0, 20) + '...');
      
      // Setup foreground message handler
      onMessage(fcmMessaging, async (payload) => {
        log('📨 Foreground message received: ' + JSON.stringify(payload));
        const title = payload?.notification?.title || payload?.data?.title || 'M1SSION';
        const body = payload?.notification?.body || payload?.data?.body || '';
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(title, {
            body, 
            icon: '/icons/icon-192.png', 
            badge: '/icons/badge-72.png', 
            data: payload?.data || {}
          });
        }
      });
      
      log('✅ Foreground message handler setup');
    } else {
      throw new Error("Failed to generate token");
    }
    
  } catch (e) {
    setStatus('token-status', 'error', 'Failed');
    document.getElementById('token-display').textContent = 'Error: ' + e.message;
    log('❌ Token generation failed: ' + e.message);
  }
}

async function saveToken() {
  if (!currentToken) {
    log('❌ No token to save. Generate token first.');
    setStatus('token-storage', 'error', 'No Token');
    return;
  }
  
  try {
    log('💾 Starting token save to Supabase...');
    
    // Generate a Firebase Installation ID (FID) for testing
    const fid = 'fid_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    
    // Try direct API call to Supabase Edge Function
    const response = await fetch('https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/store-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        // Note: In production this would be a real JWT from authenticated user
        'Authorization': 'Bearer demo-jwt-token'
      },
      body: JSON.stringify({
        fid: fid,
        token: currentToken
      })
    });
    
    const result = await response.json();
    log(`📡 Response status: ${response.status}`);
    
    if (response.status === 401) {
      setStatus('token-storage', 'warning', 'Auth Required');
      log('🔐 Token save requires authentication - would work with real JWT');
      log('📝 Token ready for authenticated save: ' + currentToken.substring(0, 20) + '...');
      log('📝 FID for save: ' + fid);
      return;
    }
    
    if (response.ok && result.success) {
      setStatus('token-storage', 'ok', 'Saved');
      log('✅ Token saved successfully to Supabase!');
      log(`📝 Database record ID: ${result.data?.id || 'N/A'}`);
      log(`⏱️ Save duration: ${result.duration || 'N/A'}`);
      log(`🆔 Request ID: ${result.reqId || 'N/A'}`);
    } else {
      throw new Error(`Save failed: ${result.error || 'Unknown error'}`);
    }
    
  } catch (e) {
    setStatus('token-storage', 'error', 'Failed');
    log('❌ Save failed: ' + e.message);
    log('📝 Token available for manual save: ' + currentToken.substring(0, 20) + '...');
  }
}

async function sendLocalNotification() {
  try {
    log('📱 Sending local test notification...');
    
    if (Notification.permission !== 'granted') {
      throw new Error("Notification permission not granted");
    }
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification('M1SSION™ Test', {
        body: 'Local notification test successful! 🚀',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        data: { link: 'https://m1ssion.eu/' }
      });
      log('✅ Local notification sent');
    } else {
      throw new Error("No service worker registration");
    }
    
  } catch (e) {
    log('❌ Local notification failed: ' + e.message);
  }
}

async function testServiceWorkerNotification() {
  try {
    log('🔧 Testing Service Worker notification...');
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error("No service worker registration");
    }
    
    // Simulate background message
    const testPayload = {
      notification: {
        title: 'M1SSION™ SW Test',
        body: 'Service Worker notification test! 🎯'
      },
      data: {
        link: 'https://m1ssion.eu/'
      }
    };
    
    await registration.showNotification(testPayload.notification.title, {
      body: testPayload.notification.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: testPayload.data
    });
    
    log('✅ Service Worker notification sent');
    
  } catch (e) {
    log('❌ SW notification failed: ' + e.message);
  }
}

async function checkSupabaseStatus() {
  try {
    log('🗄️ Checking Supabase connection...');
    
    // Test direct connection to Supabase
    const healthResponse = await fetch('https://vkjrqirvdvjbemsfzxof.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
      }
    });
    
    if (healthResponse.ok) {
      setStatus('supabase-auth', 'ok', 'Connected');
      log('✅ Supabase connection successful');
      
      // Test the edge function endpoint
      const funcResponse = await fetch('https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/store-fcm-token', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin
        }
      });
      
      if (funcResponse.ok) {
        setStatus('token-storage', 'ok', 'Available');
        log('✅ store-fcm-token function available');
      } else {
        setStatus('token-storage', 'warning', 'Function Issue');
        log(`⚠️ store-fcm-token function response: ${funcResponse.status}`);
      }
    } else {
      setStatus('supabase-auth', 'error', 'Connection Failed');
      setStatus('token-storage', 'error', 'Unavailable');
      log(`❌ Supabase connection failed: ${healthResponse.status}`);
    }
    
  } catch (e) {
    setStatus('supabase-auth', 'error', 'Check Failed');
    setStatus('token-storage', 'error', 'Unavailable');
    log('❌ Supabase check failed: ' + e.message);
  }
}

function clearLog() {
  debugLog = [];
  updateLogDisplay();
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}