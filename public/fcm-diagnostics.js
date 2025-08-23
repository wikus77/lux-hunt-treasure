// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ - FCM Diagnostics
let currentConfig = null;
let currentToken = null;

// Debug logging
function log(message) {
    const timestamp = new Date().toISOString().substr(11, 8);
    const logElement = document.getElementById('debug-log');
    logElement.innerHTML += `[${timestamp}] ${message}\n`;
    logElement.scrollTop = logElement.scrollHeight;
    console.log(`[FCM-DIAG] ${message}`);
}

function clearLog() {
    document.getElementById('debug-log').innerHTML = '';
}

function setStatus(elementId, status, text) {
    const element = document.getElementById(elementId);
    element.className = `status ${status}`;
    element.textContent = text || status.toUpperCase();
}

// Initialize diagnostics
async function initDiagnostics() {
    log('🚀 Initializing FCM Diagnostics...');
    
    // Domain check
    document.getElementById('domain').textContent = window.location.origin;
    
    // Check basic support
    if ('serviceWorker' in navigator) {
        setStatus('fcm-support', 'ok', 'Supported');
    } else {
        setStatus('fcm-support', 'error', 'Not Supported');
        log('❌ Service Worker not supported');
        return;
    }
    
    if ('Notification' in window) {
        setStatus('notification-api', 'ok', 'Available');
    } else {
        setStatus('notification-api', 'error', 'Not Available');
        log('❌ Notification API not available');
        return;
    }
    
    // Check service worker
    await checkServiceWorker();
    
    // Check permissions
    checkPermissions();
    
    // Load config
    await loadConfig();
    
    log('✅ Diagnostics initialization complete');
}

async function checkServiceWorker() {
    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        log(`📡 Found ${registrations.length} service worker(s)`);
        
        const swReg = registrations.find(reg => 
            reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );
        
        if (swReg && swReg.active) {
            setStatus('sw-active', 'ok', 'Active');
            document.getElementById('sw-url').textContent = swReg.active.scriptURL;
            
            if (swReg.active.scriptURL === 'https://m1ssion.eu/firebase-messaging-sw.js') {
                log('✅ Correct SW URL detected');
            } else {
                log(`⚠️ SW URL mismatch: ${swReg.active.scriptURL}`);
            }
        } else {
            setStatus('sw-active', 'error', 'Not Found');
            document.getElementById('sw-url').textContent = 'No firebase-messaging-sw.js found';
            log('❌ Firebase messaging service worker not found');
        }
    } catch (error) {
        setStatus('sw-active', 'error', 'Error');
        log(`❌ SW check error: ${error.message}`);
    }
}

function checkPermissions() {
    const permission = Notification.permission;
    document.getElementById('notification-permission').textContent = permission;
    
    if (permission === 'granted') {
        setStatus('notification-permission', 'ok');
        log('✅ Notification permission granted');
    } else if (permission === 'denied') {
        setStatus('notification-permission', 'error');
        log('❌ Notification permission denied');
    } else {
        setStatus('notification-permission', 'warning', 'Default');
        log('⚠️ Notification permission not requested');
    }
}

async function requestPermission() {
    try {
        log('🔐 Requesting notification permission...');
        const permission = await Notification.requestPermission();
        log(`🔐 Permission result: ${permission}`);
        checkPermissions();
    } catch (error) {
        log(`❌ Permission request error: ${error.message}`);
    }
}

async function loadConfig() {
    try {
        log('⚙️ Loading Firebase config from Supabase...');
        const response = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/fcm-config', { 
            cache: 'no-store' 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        currentConfig = await response.json();
        setStatus('config-loaded', 'ok', 'Loaded');
        
        // Display config (truncated sensitive data)
        const displayConfig = {
            projectId: currentConfig.projectId,
            messagingSenderId: currentConfig.messagingSenderId,
            vapidKey: currentConfig.vapidPublicKey ? 
                currentConfig.vapidPublicKey.substring(0, 24) + '...' : 'Missing',
            apiKey: currentConfig.apiKey ? 
                currentConfig.apiKey.substring(0, 10) + '...' : 'Missing'
        };
        
        document.getElementById('config-display').textContent = JSON.stringify(displayConfig, null, 2);
        
        log(`✅ Config loaded - ProjectID: ${currentConfig.projectId}, SenderID: ${currentConfig.messagingSenderId}`);
        log(`✅ VAPID key: ${currentConfig.vapidPublicKey ? currentConfig.vapidPublicKey.substring(0, 24) + '...' : 'Missing'}`);
        
    } catch (error) {
        setStatus('config-loaded', 'error', 'Failed');
        document.getElementById('config-display').textContent = `Error: ${error.message}`;
        log(`❌ Config loading error: ${error.message}`);
    }
}

async function generateToken() {
    if (!currentConfig) {
        log('❌ No config loaded. Please load config first.');
        return;
    }
    
    if (Notification.permission !== 'granted') {
        log('❌ Notification permission required. Please grant permission first.');
        return;
    }
    
    try {
        log('🎯 Generating FCM token...');
        setStatus('token-status', 'warning', 'Generating...');
        
        // Load Firebase compat SDK
        await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
        await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
        
        if (!window.firebase || !firebase.messaging.isSupported()) {
            throw new Error('Firebase messaging not supported');
        }
        
        // Get service worker registration
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
        log('✅ Service worker registered and ready');
        
        // Initialize Firebase
        const app = firebase.initializeApp({
            apiKey: currentConfig.apiKey,
            authDomain: currentConfig.authDomain,
            projectId: currentConfig.projectId,
            storageBucket: currentConfig.storageBucket,
            messagingSenderId: currentConfig.messagingSenderId,
            appId: currentConfig.appId,
        });
        
        log('✅ Firebase initialized');
        
        // Get messaging and token
        const messaging = firebase.messaging();
        const token = await messaging.getToken({
            vapidKey: currentConfig.vapidPublicKey,
            serviceWorkerRegistration: registration
        });
        
        if (token) {
            currentToken = token;
            setStatus('token-status', 'ok', 'Generated');
            document.getElementById('token-display').textContent = token;
            log(`✅ FCM Token generated: ${token.substring(0, 20)}...`);
        } else {
            throw new Error('No token received');
        }
        
    } catch (error) {
        setStatus('token-status', 'error', 'Failed');
        document.getElementById('token-display').textContent = `Error: ${error.message}`;
        log(`❌ Token generation error: ${error.message}`);
    }
}

async function saveToken() {
    if (!currentToken) {
        log('❌ No token to save. Please generate a token first.');
        return;
    }
    
    try {
        log('💾 Saving token to Supabase...');
        
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(
            'https://vkjrqirvdvjbemsfzxof.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
        );
        
        const { error } = await supabase
            .from('push_tokens')
            .upsert({ 
                user_id: 'fcm-diagnostics', 
                token: currentToken, 
                platform: 'web' 
            }, { 
                onConflict: 'token' 
            });
        
        if (error) {
            throw error;
        }
        
        log('✅ Token saved to Supabase successfully');
        
    } catch (error) {
        log(`❌ Token save error: ${error.message}`);
    }
}

function sendLocalNotification() {
    try {
        log('📱 Sending local notification...');
        
        if (Notification.permission !== 'granted') {
            log('❌ Notification permission required');
            return;
        }
        
        new Notification('M1SSION™ - Local Test', {
            body: 'This is a local test notification from FCM Diagnostics',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'fcm-diagnostics-local',
            data: { source: 'diagnostics', type: 'local' }
        });
        
        log('✅ Local notification sent');
        
    } catch (error) {
        log(`❌ Local notification error: ${error.message}`);
    }
}

async function testServiceWorkerNotification() {
    try {
        log('📱 Testing service worker notification...');
        
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (!registration) {
            log('❌ Service worker not found');
            return;
        }
        
        await registration.showNotification('M1SSION™ - SW Test', {
            body: 'This is a service worker test notification',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'fcm-diagnostics-sw',
            data: { source: 'diagnostics', type: 'sw' }
        });
        
        log('✅ Service worker notification sent');
        
    } catch (error) {
        log(`❌ SW notification error: ${error.message}`);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initDiagnostics);