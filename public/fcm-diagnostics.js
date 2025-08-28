/* M1SSION™ FCM Diagnostics - COMPLETE REWRITE */

let log = [];
let messaging = null;
let swRegistration = null;
let currentToken = null;

function logMessage(msg) {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    const logEntry = `[${timestamp}] ${msg}`;
    log.push(logEntry);
    console.log(logEntry);
    updateLogDisplay();
}

function updateLogDisplay() {
    const logElement = document.getElementById('debug-log');
    if (logElement) {
        logElement.textContent = log.join('\n');
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

function updateConfigDisplay(config) {
    const display = document.getElementById('config-display');
    if (display) {
        display.textContent = JSON.stringify(config, null, 2);
    }
}

function updateTokenDisplay(token) {
    const display = document.getElementById('token-display');
    if (display) {
        if (token) {
            display.textContent = token.substring(0, 50) + '...' + token.substring(token.length - 10);
        } else {
            display.textContent = 'No token generated';
        }
    }
}

async function loadConfig() {
    try {
        logMessage('🔄 Loading Firebase config...');
        
        // Try importing config as ESM module first
        let config;
        try {
            const module = await import('/firebase-init.js');
            config = module.default;
            logMessage('✅ Config loaded via ESM import');
        } catch (e) {
            // Fallback to global variable
            config = window.__FIREBASE_CFG__ || self.__FIREBASE_CFG__;
            logMessage('✅ Config loaded from global variable');
        }
        
        
        if (config) {
            logMessage('✅ Firebase config loaded successfully');
            setStatus('config-loaded', 'ok', 'Loaded');
            updateConfigDisplay(config);
            
            // Verify it's the correct config
            if (config.appId === '1:21417361168:web:58841299455ee4bcc7af95') {
                logMessage('✅ CORRECT appId detected for production');
            } else {
                logMessage(`❌ WRONG appId: ${config.appId}`);
            }
            
            if (config.apiKey === 'AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs') {
                logMessage('✅ CORRECT apiKey detected for production');
            } else {
                logMessage(`❌ WRONG apiKey: ${config.apiKey}`);
            }
            
            return config;
        } else {
            throw new Error('Firebase config not found');
        }
    } catch (error) {
        logMessage(`❌ Error loading config: ${error.message}`);
        setStatus('config-loaded', 'error', 'Failed');
        throw error;
    }
}

async function registerServiceWorker() {
    try {
        logMessage('🔄 Registering Service Worker...');
        
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker not supported');
        }
        
        // Unregister existing workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            if (registration.scope.includes('firebase-messaging')) {
                await registration.unregister();
                logMessage('🗑️ Unregistered old SW');
            }
        }
        
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
        });
        
        await navigator.serviceWorker.ready;
        logMessage('✅ Service Worker registered and ready');
        setStatus('sw-active', 'ok', 'Active');
        
        const swUrl = document.getElementById('sw-url');
        if (swUrl) {
            swUrl.textContent = swRegistration.scope;
        }
        
        return swRegistration;
    } catch (error) {
        logMessage(`❌ Service Worker registration failed: ${error.message}`);
        setStatus('sw-active', 'error', 'Failed');
        throw error;
    }
}

async function requestPermission() {
    try {
        logMessage('🔄 Requesting notification permission...');
        
        if (!('Notification' in window)) {
            throw new Error('Notifications not supported');
        }
        
        let permission = Notification.permission;
        
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        
        logMessage(`📋 Permission result: ${permission}`);
        
        if (permission === 'granted') {
            setStatus('notification-permission', 'ok', 'Granted');
        } else {
            setStatus('notification-permission', 'error', permission);
        }
        
        return permission;
    } catch (error) {
        logMessage(`❌ Permission request failed: ${error.message}`);
        setStatus('notification-permission', 'error', 'Failed');
        throw error;
    }
}

async function generateToken() {
    try {
        logMessage('🔄 Starting FCM token generation...');
        
        // Step 1: Load config
        const config = await loadConfig();
        if (!config) {
            throw new Error('Firebase config not available');
        }
        
        // Step 2: Register Service Worker
        if (!swRegistration) {
            swRegistration = await registerServiceWorker();
        }
        
        // Step 3: Request permission
        const permission = await requestPermission();
        if (permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }
        
        // Step 4: Load Firebase v9 modular SDK
        logMessage('📦 Loading Firebase v9 SDK...');
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js');
        
        // Step 5: Initialize Firebase
        logMessage('🔥 Initializing Firebase app...');
        const app = initializeApp(config);
        messaging = getMessaging(app);
        
        // Step 6: Generate token with proper error handling
        logMessage('🎯 Generating FCM token with VAPID key...');
        logMessage(`🔑 Using VAPID: ${config.vapidKey.substring(0, 20)}...`);
        
        const token = await getToken(messaging, {
            vapidKey: config.vapidKey,
            serviceWorkerRegistration: swRegistration
        });
        
        if (token) {
            currentToken = token;
            logMessage('✅ FCM token generated successfully!');
            logMessage(`📝 Token length: ${token.length} characters`);
            logMessage(`🔍 Token prefix: ${token.substring(0, 20)}...`);
            setStatus('token-status', 'ok', 'Generated');
            updateTokenDisplay(token);
            
            // Store in localStorage for debugging
            localStorage.setItem('fcm_token', token);
            localStorage.setItem('fcm_token_timestamp', Date.now().toString());
            
            return token;
        } else {
            throw new Error('No token received from Firebase');
        }
        
    } catch (error) {
        logMessage(`❌ Token generation failed: ${error.message}`);
        if (error.code) {
            logMessage(`🔍 Error code: ${error.code}`);
        }
        setStatus('token-status', 'error', 'Failed');
        throw error;
    }
}

async function saveToken() {
    try {
        const token = currentToken || localStorage.getItem('fcm_token');
        if (!token) {
            throw new Error('No token to save. Generate token first.');
        }
        
        logMessage('💾 Saving token to Supabase...');
        
        // Create a proper FID for testing
        const fid = 'fid_' + Math.random().toString(36).substring(2, 15);
        
        // Use proper Supabase function URL
        const functionUrl = 'https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/store-fcm-token';
        
        logMessage(`🌐 Calling: ${functionUrl}`);
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
            },
            body: JSON.stringify({
                fid: fid,
                token: token
            })
        });
        
        logMessage(`📡 Response status: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            logMessage('✅ Token saved to Supabase successfully');
            logMessage(`📝 Response: ${JSON.stringify(result)}`);
        } else {
            const errorText = await response.text();
            logMessage(`❌ Failed to save token: ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        logMessage(`❌ Save token failed: ${error.message}`);
    }
}

async function sendLocalNotification() {
    try {
        logMessage('📱 Sending local notification...');
        
        if (Notification.permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }
        
        const notification = new Notification('M1SSION™ Local Test', {
            body: 'Local notification test successful! 🎉',
            icon: '/favicon.ico',
            tag: 'test-notification',
            requireInteraction: false
        });
        
        notification.onclick = () => {
            logMessage('📱 Local notification clicked');
            notification.close();
        };
        
        logMessage('✅ Local notification sent');
    } catch (error) {
        logMessage(`❌ Local notification failed: ${error.message}`);
    }
}

async function testServiceWorkerNotification() {
    try {
        logMessage('🔧 Testing Service Worker notification...');
        
        if (!swRegistration) {
            throw new Error('Service Worker not registered');
        }
        
        await swRegistration.showNotification('M1SSION™ SW Test', {
            body: 'Service Worker notification test successful! 🚀',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'sw-test-notification',
            requireInteraction: false,
            data: {
                link: 'https://m1ssion.eu'
            }
        });
        
        logMessage('✅ Service Worker notification sent');
    } catch (error) {
        logMessage(`❌ Service Worker notification failed: ${error.message}`);
    }
}

function clearLog() {
    log = [];
    updateLogDisplay();
    logMessage('📋 Log cleared - ready for new tests');
}

// Auto-run diagnostics when page loads
document.addEventListener('DOMContentLoaded', async function() {
    logMessage('🚀 M1SSION™ FCM Diagnostics - COMPLETE SYSTEM');
    logMessage(`🌐 Testing on domain: ${window.location.origin}`);
    
    // Set domain info
    const domainElement = document.getElementById('domain');
    if (domainElement) {
        domainElement.textContent = window.location.origin;
    }
    
    // Check browser support
    const fcmSupported = 'serviceWorker' in navigator && 'Notification' in window && 'fetch' in window && 'PushManager' in window;
    setStatus('fcm-support', fcmSupported ? 'ok' : 'error', fcmSupported ? 'Fully Supported' : 'Not Supported');
    logMessage(`🔍 FCM Support: ${fcmSupported ? 'YES' : 'NO'}`);
    
    // Check Notification API
    const notificationSupported = 'Notification' in window;
    setStatus('notification-api', notificationSupported ? 'ok' : 'error', notificationSupported ? 'Available' : 'Not Available');
    
    // Check current permission
    if (notificationSupported) {
        const permission = Notification.permission;
        setStatus('notification-permission', 
            permission === 'granted' ? 'ok' : permission === 'denied' ? 'error' : 'warning', 
            permission);
        logMessage(`🔔 Initial permission: ${permission}`);
    }
    
    // Load and verify config automatically
    try {
        await loadConfig();
        logMessage('✅ Auto-diagnostics complete');
    } catch (error) {
        logMessage(`❌ Auto-diagnostics failed: ${error.message}`);
    }
    
    // Add automatic token generation button enhancement
    const generateBtn = document.querySelector('button[onclick="generateToken()"]');
    if (generateBtn) {
        generateBtn.textContent = '🎯 Generate FCM Token (FIXED)';
    }
    
    // Check if we have a previous token
    const savedToken = localStorage.getItem('fcm_token');
    const savedTimestamp = localStorage.getItem('fcm_token_timestamp');
    if (savedToken && savedTimestamp) {
        const age = Math.round((Date.now() - parseInt(savedTimestamp)) / 1000 / 60);
        logMessage(`🔍 Found cached token (${age} min old)`);
        updateTokenDisplay(savedToken);
        currentToken = savedToken;
    }
    
    logMessage('✅ Diagnostics initialization complete - ready for testing!');
});