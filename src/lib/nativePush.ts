// © 2025 Joseph MULÉ – M1SSION™ - REAL Native Push Notifications
// This module uses the REAL @capacitor/push-notifications plugin, NOT the stub
// SAFE: Uses dynamic import to avoid crash on web/PWA

import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES (defined locally to avoid import errors on web)
// ============================================================================

export interface NativePushState {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
  token: string | null;
  tokenSaved: boolean;
  lastError: string | null;
  lastReceived: Date | null;
  initialized: boolean;
  // 🛡️ HARDENING: Track last push result
  lastPushResult?: {
    success: boolean;
    apns_id?: string;
    apns_env?: string;
    status?: number;
    error?: string;
    timestamp: Date;
  };
}

// Re-define types locally to avoid importing from @capacitor/push-notifications on web
export interface PushNotificationSchema {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  tag?: string;
  badge?: number;
  data: any;
}

export interface ActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: PushNotificationSchema;
}

export interface Token {
  value: string;
}

type PushEventListener = {
  registration: (token: string) => void;
  registrationError: (error: string) => void;
  received: (notification: PushNotificationSchema) => void;
  actionPerformed: (action: ActionPerformed) => void;
};

// ============================================================================
// STATE (singleton)
// ============================================================================

let _state: NativePushState = {
  isNative: false,
  platform: 'web',
  permission: 'unknown',
  token: null,
  tokenSaved: false,
  lastError: null,
  lastReceived: null,
  initialized: false,
};

let _listeners: Partial<PushEventListener> = {};
let _initPromise: Promise<NativePushState> | null = null;
let _pushModule: any = null; // Will hold dynamically imported module
let _listenersRegistered = false; // Singleton guard for listeners

// ============================================================================
// DEBUG LOGGING
// ============================================================================

const DEBUG_PUSH = import.meta.env.DEV;

function logPush(emoji: string, message: string, data?: any) {
  if (DEBUG_PUSH) {
    console.log(`${emoji} [NativePush] ${message}`, data || '');
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Check if we're running in a native Capacitor environment
 */
export function isCapacitorNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Get current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  try {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  } catch {
    return 'web';
  }
}

/**
 * Get current push state (readonly)
 */
export function getPushState(): Readonly<NativePushState> {
  return { ..._state };
}

/**
 * Initialize native push notifications (CALL ONCE at app startup)
 * Safe to call multiple times - only initializes once
 */
export async function initNativePush(): Promise<NativePushState> {
  // Singleton - return existing promise if already initializing
  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = _initNativePushInternal();
  return _initPromise;
}

async function _initNativePushInternal(): Promise<NativePushState> {
  _state.platform = getPlatform();
  _state.isNative = isCapacitorNative();

  logPush('🚀', `Initializing push for platform: ${_state.platform}, native: ${_state.isNative}`);

  // Web/PWA - don't use Capacitor push
  if (!_state.isNative) {
    _state.initialized = true;
    logPush('ℹ️', 'Not native platform, skipping Capacitor push init');
    return _state;
  }

  try {
    // DYNAMIC IMPORT: Only load @capacitor/push-notifications on native platforms
    logPush('📦', 'Dynamically importing @capacitor/push-notifications...');
    _pushModule = await import('@capacitor/push-notifications');
    logPush('✅', 'Push module loaded successfully');

    // Check current permission
    const permStatus = await _pushModule.PushNotifications.checkPermissions();
    _state.permission = permStatus.receive;
    logPush('🔐', `Current permission: ${_state.permission}`);

    // Setup listeners BEFORE registering (critical!)
    await setupListeners();

    _state.initialized = true;
    logPush('✅', 'Native push initialized successfully');

    // 🔧 FIX: If permission is already granted, AUTO-REGISTER immediately!
    // This handles the case where user granted permission previously but register() was never called
    if (_state.permission === 'granted') {
      logPush('🔄', 'Permission already granted — auto-registering with APNs...');
      try {
        await _pushModule.PushNotifications.register();
        logPush('📤', 'Auto-register called successfully - waiting for registration event...');
        
        // Give APNs time to respond (up to 10 seconds)
        // The registration listener will update _state.token when it fires
        await new Promise<void>((resolve) => {
          let attempts = 0;
          const checkToken = setInterval(() => {
            attempts++;
            logPush('⏳', `Waiting for token... attempt ${attempts}/20, current token: ${_state.token ? 'YES' : 'NO'}`);
            
            if (_state.token) {
              logPush('🎉', 'Token received via listener!');
              clearInterval(checkToken);
              resolve();
            } else if (_state.lastError) {
              logPush('❌', `Registration error detected: ${_state.lastError}`);
              clearInterval(checkToken);
              resolve();
            } else if (attempts >= 20) {
              logPush('⚠️', 'Timeout waiting for token (10s) - registration may have failed silently');
              clearInterval(checkToken);
              resolve();
            }
          }, 500);
        });
        
      } catch (regErr: any) {
        _state.lastError = regErr.message || 'Auto-register failed';
        logPush('❌', 'Auto-register exception:', regErr.message);
      }
    }

    return _state;

  } catch (error: any) {
    _state.lastError = error.message || 'Init failed';
    _state.initialized = true; // Mark as initialized even on error
    logPush('❌', 'Native push init error:', error);
    return _state;
  }
}

/**
 * Request permission and register for push notifications
 */
export async function requestPushPermission(): Promise<{ success: boolean; error?: string; token?: string }> {
  if (!_state.isNative) {
    return { success: false, error: 'Not running in native app' };
  }

  if (!_state.initialized) {
    await initNativePush();
  }

  if (!_pushModule) {
    return { success: false, error: 'Push module not loaded' };
  }

  try {
    logPush('🔔', 'Requesting push permission...');

    // Request permission from user (will show prompt if not already granted)
    const permResult = await _pushModule.PushNotifications.requestPermissions();
    _state.permission = permResult.receive;

    logPush('📱', `Permission result: ${_state.permission}`);

    if (_state.permission !== 'granted') {
      return { success: false, error: `Permission ${_state.permission}` };
    }

    // Register with APNs/FCM
    logPush('📤', 'Calling PushNotifications.register()...');
    
    // Reset error before registering
    _state.lastError = null;
    
    await _pushModule.PushNotifications.register();
    logPush('✅', 'register() called - now waiting for token callback...');

    // Wait for the registration listener to fire (up to 10 seconds)
    const tokenReceived = await new Promise<boolean>((resolve) => {
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds total
      
      const checkToken = setInterval(() => {
        attempts++;
        
        if (_state.token) {
          logPush('🎉', `Token received! ${_state.token.substring(0, 20)}...`);
          clearInterval(checkToken);
          resolve(true);
        } else if (_state.lastError) {
          logPush('❌', `Registration error: ${_state.lastError}`);
          clearInterval(checkToken);
          resolve(false);
        } else if (attempts >= maxAttempts) {
          logPush('⚠️', 'Timeout waiting for APNs token (10s)');
          _state.lastError = 'Timeout: APNs did not return a token. Check: 1) Bundle ID matches 2) Push entitlement enabled 3) Real device (not simulator)';
          clearInterval(checkToken);
          resolve(false);
        } else {
          logPush('⏳', `Waiting for token... ${attempts}/${maxAttempts}`);
        }
      }, 500);
    });

    if (tokenReceived && _state.token) {
      return { success: true, token: _state.token };
    } else {
      return { success: false, error: _state.lastError || 'Token not received' };
    }

  } catch (error: any) {
    _state.lastError = error.message || 'Permission request failed';
    logPush('❌', 'Permission request exception:', error);
    return { success: false, error: _state.lastError };
  }
}

/**
 * Set custom event listeners
 */
export function setPushListeners(listeners: Partial<PushEventListener>) {
  _listeners = { ..._listeners, ...listeners };
}

// ============================================================================
// INTERNAL
// ============================================================================

async function setupListeners() {
  if (!_pushModule) {
    logPush('⚠️', 'Cannot setup listeners - push module not loaded');
    return;
  }

  // SINGLETON GUARD: Only register listeners once!
  if (_listenersRegistered) {
    logPush('ℹ️', 'Listeners already registered, skipping duplicate setup');
    return;
  }
  _listenersRegistered = true;

  logPush('👂', 'Setting up push listeners (FIRST TIME)...');
  const PushNotifications = _pushModule.PushNotifications;

  // TOKEN REGISTRATION SUCCESS
  await PushNotifications.addListener('registration', async (token: Token) => {
    logPush('🎉', `Received push token: ${token.value.substring(0, 20)}...`);
    _state.token = token.value;
    _state.lastError = null;

    // Save to backend
    await saveTokenToBackend(token.value);

    // Call custom listener
    _listeners.registration?.(token.value);
  });

  // TOKEN REGISTRATION ERROR
  await PushNotifications.addListener('registrationError', (error: any) => {
    logPush('❌', 'Registration error:', error);
    _state.lastError = error.error || 'Registration failed';
    _state.token = null;

    // Call custom listener
    _listeners.registrationError?.(error.error || 'Unknown error');
  });

  // PUSH RECEIVED (foreground)
  await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    logPush('📬', 'Push received in foreground:', notification);
    _state.lastReceived = new Date();

    // Call custom listener
    _listeners.received?.(notification);
  });

  // PUSH ACTION (user tapped notification)
  await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    logPush('👆', 'Push action performed:', action);

    // Handle deep linking based on notification data
    handlePushAction(action);

    // Call custom listener
    _listeners.actionPerformed?.(action);
  });

  logPush('✅', 'All push listeners registered');
}

async function saveTokenToBackend(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logPush('⚠️', 'No authenticated user, cannot save token');
      return;
    }

    logPush('💾', 'Saving token to Supabase...', { 
      user_id: user.id, 
      platform: _state.platform,
      token_preview: token.substring(0, 10) + '...'
    });

    // Full token data with all native push columns
    const fullTokenData = {
      user_id: user.id,
      token: token,
      platform: _state.platform,
      endpoint_type: _state.platform === 'ios' ? 'apns' : 'fcm',
      device_info: {
        capacitor: Capacitor.isNativePlatform(),
        platform: _state.platform,
        registered_at: new Date().toISOString(),
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    };

    // Strategy 1: Delete existing tokens for this user+platform, then insert
    // This avoids unique constraint issues
    const { error: deleteError } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', _state.platform);

    if (deleteError) {
      logPush('⚠️', 'Delete existing token failed (may not exist):', deleteError.message);
    }

    // Try full insert with all columns
    const { error: insertError } = await supabase
      .from('push_tokens')
      .insert(fullTokenData);

    if (insertError) {
      logPush('⚠️', 'Full insert failed, trying minimal:', insertError.message);
      
      // Fallback: Try minimal insert (old schema without new columns)
      const minimalTokenData = {
        user_id: user.id,
        token: token,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Delete by token (old unique constraint)
      await supabase
        .from('push_tokens')
        .delete()
        .eq('token', token);

      const { error: minimalError } = await supabase
        .from('push_tokens')
        .insert(minimalTokenData);

      if (minimalError) {
        logPush('❌', 'Token save completely failed:', minimalError.message);
        _state.tokenSaved = false;
        _state.lastError = `Token save failed: ${minimalError.message}`;
        return;
      }
      
      logPush('⚠️', 'Token saved with MINIMAL schema (run migration!)');
      _state.tokenSaved = true;
      _state.lastError = 'Token saved but DB missing platform/endpoint_type columns - run migration';
      return;
    }

    _state.tokenSaved = true;
    _state.lastError = null;
    logPush('✅', 'Push token saved to backend with full schema!');

  } catch (error: any) {
    logPush('❌', 'Error saving token:', error);
    _state.tokenSaved = false;
    _state.lastError = error.message || 'Unknown error saving token';
  }
}

function handlePushAction(action: ActionPerformed) {
  const data = action.notification.data;
  
  logPush('🔗', 'Handling push action with data:', data);

  // Deep link routing based on notification data
  if (data?.route) {
    // Navigate to specified route
    window.location.href = data.route;
  } else if (data?.type === 'chat') {
    window.location.href = '/chat';
  } else if (data?.type === 'leaderboard') {
    window.location.href = '/leaderboard';
  } else {
    // Default: go to notifications
    window.location.href = '/notifications';
  }
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Send a test push notification to the current user
 */
export async function sendTestPush(): Promise<{ success: boolean; error?: string; result?: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    logPush('🧪', 'Sending test push...');

    const { data, error } = await supabase.functions.invoke('send-native-push', {
      body: {
        title: '🎯 M1SSION Test',
        body: `Push funzionante! ${new Date().toLocaleTimeString()}`,
        data: {
          type: 'test',
          timestamp: new Date().toISOString(),
        },
        targetUserId: user.id,
      },
    });

    // 🛡️ HARDENING: Store last push result for diagnostics
    if (data?.results?.[0]) {
      const result = data.results[0];
      _state.lastPushResult = {
        success: result.success,
        apns_id: result.apns_id,
        apns_env: result.apns_env,
        status: result.status,
        error: result.error,
        timestamp: new Date(),
      };
      logPush('📊', 'Push result stored:', _state.lastPushResult);
    }

    if (error) {
      logPush('❌', 'Test push failed:', error);
      return { success: false, error: error.message };
    }

    logPush('✅', 'Test push sent:', data);
    return { success: true, result: data };

  } catch (error: any) {
    logPush('❌', 'Test push exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if token exists in database
 */
export async function checkTokenInDatabase(): Promise<{ exists: boolean; token?: any; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { exists: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', _state.platform)
      .maybeSingle();

    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: !!data, token: data };

  } catch (error: any) {
    return { exists: false, error: error.message };
  }
}

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).__nativePush = {
    getState: getPushState,
    init: initNativePush,
    requestPermission: requestPushPermission,
    sendTestPush,
    checkToken: checkTokenInDatabase,
  };
}
