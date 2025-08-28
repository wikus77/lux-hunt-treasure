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
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
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
    return;
  }
  
  try {
    log('💾 Starting token save to Supabase...');
    
    // Check if we have access to Supabase client (would need auth)
    const hasSupabaseAuth = window.supabase && window.supabase.auth;
    if (!hasSupabaseAuth) {
      log('⚠️ Save skipped: Supabase auth not available (requires app integration)');
      log('📝 Token ready for save: ' + currentToken.substring(0, 20) + '...');
      return;
    }
    
    // Get current user session
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    if (sessionError || !session) {
      log('⚠️ Save skipped: User not authenticated');
      log('📝 Token ready for save: ' + currentToken.substring(0, 20) + '...');
      return;
    }
    
    log('🔐 User authenticated, proceeding with save...');
    
    // Generate a Firebase Installation ID (FID) - simplified version
    const fid = 'fid_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    
    // Call store-fcm-token edge function
    const { data, error } = await window.supabase.functions.invoke('store-fcm-token', {
      body: {
        fid: fid,
        token: currentToken
      }
    });
    
    if (error) {
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    if (data.success) {
      log('✅ Token saved successfully to Supabase!');
      log(`📝 Database record ID: ${data.data.id}`);
      log(`⏱️ Save duration: ${data.duration}`);
    } else {
      throw new Error(`Save failed: ${data.error || 'Unknown error'}`);
    }
    
  } catch (e) {
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
    
    const hasSupabase = window.supabase;
    if (!hasSupabase) {
      setStatus('supabase-auth', 'warning', 'Not Available');
      setStatus('token-storage', 'warning', 'Requires App Integration');
      log('⚠️ Supabase client not available (standalone diagnostics mode)');
      return;
    }
    
    setStatus('supabase-auth', 'ok', 'Available');
    log('✅ Supabase client available');
    
    // Check auth status
    const { data: { session }, error } = await window.supabase.auth.getSession();
    if (error) {
      setStatus('token-storage', 'error', 'Auth Error');
      log('❌ Supabase auth error: ' + error.message);
    } else if (session) {
      setStatus('token-storage', 'ok', 'Ready');
      log('✅ User authenticated, storage ready');
    } else {
      setStatus('token-storage', 'warning', 'Not Authenticated');
      log('⚠️ User not authenticated, storage requires login');
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