/**
 * © 2025 Joseph MULÉ – M1SSION™ – Device Token Debug Component
 * Comprehensive testing and debugging for OneSignal push notifications
 */
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function DeviceTokenDebug() {
  const [deviceTokens, setDeviceTokens] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load device tokens
  const loadDeviceTokens = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error loading device tokens:', error);
        toast.error('Errore caricamento token');
      } else {
        setDeviceTokens(data || []);
        console.log('📱 Device tokens loaded:', data);
      }
    } catch (error) {
      console.error('❌ Error in loadDeviceTokens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Register OneSignal test token
  const registerTestToken = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Utente non autenticato');
        return;
      }
      
      const testPlayerId = `onesignal-test-${user.id}-${Date.now()}`;
      
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: user.id,
          token: testPlayerId,
          device_type: 'onesignal',
          device_info: { platform: 'web', source: 'debug_test', created: new Date().toISOString() },
          is_active: true,
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_type'
        });
      
      if (error) {
        console.error('❌ Error registering test token:', error);
        toast.error('Errore registrazione token test');
      } else {
        console.log('✅ Test token registered:', testPlayerId);
        toast.success('Token OneSignal test registrato!');
        loadDeviceTokens();
      }
    } catch (error) {
      console.error('❌ Error in registerTestToken:', error);
    }
  };

  // Test push notification
  const testPushNotification = async (testNumber: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || deviceTokens.length === 0) {
      toast.error('Nessun token device registrato');
      return;
    }

    setTesting(true);
    const testTitle = `🎯 M1SSION™ Test ${testNumber}`;
    const testBody = `Test push notification #${testNumber} - ${new Date().toLocaleTimeString()}`;

    try {
      console.log(`🚀 Starting push test #${testNumber}`);
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: testTitle,
          body: testBody,
          target_user_id: user.id
        }
      });

      const result = {
        testNumber,
        timestamp: new Date().toISOString(),
        success: !error && data?.success,
        data: data,
        error: error?.message,
        sent: data?.sent || 0,
        total: data?.total || 0
      };

      setTestResults(prev => [result, ...prev]);

      if (error) {
        console.error(`❌ Test #${testNumber} failed:`, error);
        toast.error(`Test #${testNumber} fallito: ${error.message}`);
      } else {
        console.log(`✅ Test #${testNumber} success:`, data);
        toast.success(`Test #${testNumber} inviato: ${data.sent}/${data.total} dispositivi`);
      }
    } catch (err) {
      console.error(`❌ Test #${testNumber} exception:`, err);
      toast.error(`Test #${testNumber} errore di sistema`);
    } finally {
      setTesting(false);
    }
  };

  // Run all 3 tests
  const runAllTests = async () => {
    if (testing) return;
    
    setTestResults([]);
    
    for (let i = 1; i <= 3; i++) {
      await testPushNotification(i);
      if (i < 3) {
        // Wait 2 seconds between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  // Check OneSignal status
  const checkOneSignalStatus = async () => {
    try {
      const utils = (window as any).OneSignalUtils;
      if (utils) {
        const playerId = await utils.getPlayerId();
        const isSubscribed = await utils.isSubscribed();
        
        console.log('🔔 OneSignal Status:', {
          playerId,
          isSubscribed,
          available: !!utils
        });
        
        toast.success(`OneSignal: ${isSubscribed ? 'Attivo' : 'Non attivo'} - ID: ${playerId}`);
      } else {
        console.log('⚠️ OneSignal Utils not available');
        toast.warning('OneSignal non disponibile (environment dev)');
      }
    } catch (error) {
      console.error('❌ Error checking OneSignal status:', error);
    }
  };

  useEffect(() => {
    loadDeviceTokens();
  }, []);

  return (
    <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-[#00D1FF] mb-4">
        🔧 Push Notifications Debug
      </h3>
      
      {/* Device Tokens Status */}
      <div className="mb-6">
        <h4 className="font-semibold text-white mb-2">📱 Device Tokens ({deviceTokens.length})</h4>
        {deviceTokens.length === 0 ? (
          <p className="text-yellow-400">⚠️ Nessun token registrato</p>
        ) : (
          deviceTokens.map((token, index) => (
            <div key={index} className="text-sm bg-gray-800 p-2 rounded mb-1">
              <span className="text-green-400">✅</span> {token.device_type}: {token.token.substring(0, 20)}...
              <span className="text-gray-400 ml-2">({new Date(token.created_at).toLocaleString()})</span>
            </div>
          ))
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={loadDeviceTokens}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
        >
          {loading ? '⏳' : '🔄'} Refresh Tokens
        </button>
        
        <button
          onClick={registerTestToken}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          🔧 Registra Token Test
        </button>
        
        <button
          onClick={checkOneSignalStatus}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
        >
          🔔 Check OneSignal
        </button>
        
        <button
          onClick={() => testPushNotification(1)}
          disabled={testing || deviceTokens.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
        >
          🚀 Test Push Singolo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <button
          onClick={runAllTests}
          disabled={testing || deviceTokens.length === 0}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
        >
          🎯 Run All Tests (3x Consecutive)
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h4 className="font-semibold text-white mb-2">📊 Test Results</h4>
          {testResults.map((result, index) => (
            <div key={index} className={`text-sm p-2 rounded mb-1 ${
              result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
            }`}>
              <div className="flex justify-between items-start">
                <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.success ? '✅' : '❌'} Test #{result.testNumber}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {result.success ? (
                <div className="text-gray-300 text-xs mt-1">
                  Sent: {result.sent}/{result.total} devices
                </div>
              ) : (
                <div className="text-red-300 text-xs mt-1">
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {testing && (
        <div className="text-center text-[#00D1FF] font-semibold mt-4">
          🔄 Testing in progress...
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 bg-gray-800 p-3 rounded">
        <p><strong>📍 Environment:</strong> {window.location.hostname}</p>
        <p><strong>🔔 OneSignal:</strong> {window.location.hostname === 'm1ssion.eu' ? 'Produzione' : 'Disabilitato (dev)'}</p>
        <p><strong>🎯 Status:</strong> PWA pronta al 99% - Deploy su https://m1ssion.eu per test finali</p>
      </div>
    </div>
  );
}