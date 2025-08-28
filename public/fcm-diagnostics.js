/* M1SSION™ FCM Diagnostics - Advanced Testing Module */

let log = [];
let messaging = null;
let swRegistration = null;

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
        
        // Import Firebase config
        const module = await import('/firebase-init.js');
        const config = self.__FIREBASE_CFG__;
        
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
            
        } else {
            logMessage('❌ Firebase config not found in global scope');
            setStatus('config-loaded', 'error', 'Failed');
        }
    } catch (error) {
        logMessage(`❌ Error loading config: ${error.message}`);
        setStatus('config-loaded', 'error', 'Failed');
    }
}

async function registerServiceWorker() {
    try {
        logMessage('🔄 Registering Service Worker...');
        
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Worker not supported');
        }
        
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        logMessage('✅ Service Worker registered successfully');
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
        
        const permission = await Notification.requestPermission();
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
        logMessage('🔄 Generating FCM token...');
        
        // Load Firebase v9 modular SDK
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js');
        
        const config = self.__FIREBASE_CFG__;
        if (!config) {
            throw new Error('Firebase config not available');
        }
        
        // Initialize Firebase
        const app = initializeApp(config);
        messaging = getMessaging(app);
        
        // Register service worker if not already done
        if (!swRegistration) {
            swRegistration = await registerServiceWorker();
        }
        
        // Request permission if not granted
        if (Notification.permission !== 'granted') {
            await requestPermission();
        }
        
        if (Notification.permission !== 'granted') {
            throw new Error('Notification permission not granted');
        }
        
        // Generate token
        logMessage('🎯 Generating token with VAPID key...');
        const token = await getToken(messaging, {
            vapidKey: config.vapidKey,
            serviceWorkerRegistration: swRegistration
        });
        
        if (token) {
            logMessage('✅ FCM token generated successfully');
            logMessage(`📝 Token length: ${token.length} characters`);
            setStatus('token-status', 'ok', 'Generated');
            updateTokenDisplay(token);
            
            // Store in localStorage for debugging
            localStorage.setItem('fcm_token', token);
            return token;
        } else {
            throw new Error('No token received from Firebase');
        }
        
    } catch (error) {
        logMessage(`❌ Token generation failed: ${error.message}`);
        setStatus('token-status', 'error', 'Failed');
        throw error;
    }
}

async function saveToken() {
    try {
        const token = localStorage.getItem('fcm_token');
        if (!token) {
            throw new Error('No token to save. Generate token first.');
        }
        
        logMessage('💾 Saving token to Supabase...');
        
        // Create a fake FID for testing (in real app, this comes from Firebase Installations)
        const fid = 'fid_' + Math.random().toString(36).substring(2);
        
        const response = await fetch('https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/store-fcm-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token-for-demo' // In real app, use actual Supabase JWT
            },
            body: JSON.stringify({
                fid: fid,
                token: token
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            logMessage('✅ Token saved to Supabase successfully');
            logMessage(`📝 Response: ${JSON.stringify(result)}`);
        } else {
            const error = await response.text();
            logMessage(`❌ Failed to save token: ${error}`);
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
        
        new Notification('M1SSION™ Test', {
            body: 'Local notification test successful!',
            icon: '/icons/icon-192.png',
            tag: 'test-notification'
        });
        
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
        
        swRegistration.showNotification('M1SSION™ SW Test', {
            body: 'Service Worker notification test!',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'sw-test-notification'
        });
        
        logMessage('✅ Service Worker notification sent');
    } catch (error) {
        logMessage(`❌ Service Worker notification failed: ${error.message}`);
    }
}

function clearLog() {
    log = [];
    updateLogDisplay();
    logMessage('📋 Log cleared');
}

// Initialize diagnostics when page loads
document.addEventListener('DOMContentLoaded', async function() {
    logMessage('🚀 M1SSION™ FCM Diagnostics Started');
    
    // Set domain info
    const domainElement = document.getElementById('domain');
    if (domainElement) {
        domainElement.textContent = window.location.origin;
    }
    
    // Check FCM support
    const fcmSupported = 'serviceWorker' in navigator && 'Notification' in window && 'fetch' in window;
    setStatus('fcm-support', fcmSupported ? 'ok' : 'error', fcmSupported ? 'Supported' : 'Not Supported');
    
    // Check Notification API
    const notificationSupported = 'Notification' in window;
    setStatus('notification-api', notificationSupported ? 'ok' : 'error', notificationSupported ? 'Available' : 'Not Available');
    
    // Check current permission
    if (notificationSupported) {
        const permission = Notification.permission;
        setStatus('notification-permission', 
            permission === 'granted' ? 'ok' : permission === 'denied' ? 'error' : 'warning', 
            permission);
    }
    
    // Load config automatically
    await loadConfig();
    
    logMessage('✅ Diagnostics initialization complete');
});