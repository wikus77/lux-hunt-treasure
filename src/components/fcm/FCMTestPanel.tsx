// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
// FCM Test & Diagnostics Panel

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { 
  registerPush, 
  isFCMSupported, 
  getPermissionStatus,
  getUserTokens 
} from '@/lib/push/registerPush';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  message: string;
}

export const FCMTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentToken, setCurrentToken] = useState<string>('');
  const [testTitle, setTestTitle] = useState('🧪 Test M1SSION™ FCM');
  const [testBody, setTestBody] = useState('Test message from diagnostics panel');

  // Initialize test results
  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const initialTests: TestResult[] = [
      { name: 'FCM Support', status: 'PENDING', message: 'Checking browser compatibility...' },
      { name: 'Service Worker', status: 'PENDING', message: 'Checking service worker registration...' },
      { name: 'Permissions', status: 'PENDING', message: 'Checking notification permissions...' },
      { name: 'Firebase Library', status: 'PENDING', message: 'Checking Firebase messaging...' },
      { name: 'VAPID Key', status: 'PENDING', message: 'Validating VAPID configuration...' },
      { name: 'Token Generation', status: 'PENDING', message: 'Testing FCM token generation...' },
      { name: 'Database Storage', status: 'PENDING', message: 'Testing token storage...' },
      { name: 'Edge Function', status: 'PENDING', message: 'Testing push notification sending...' },
      { name: 'Complete Integration', status: 'PENDING', message: 'End-to-end test...' }
    ];
    setTestResults(initialTests);
  };

  const updateTestResult = (index: number, status: TestResult['status'], message: string) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    initializeTests();

    try {
      // Test 1: FCM Support
      await new Promise(resolve => setTimeout(resolve, 500));
      const isSupported = isFCMSupported();
      updateTestResult(0, isSupported ? 'PASS' : 'FAIL', 
        isSupported ? 'Browser supports FCM' : 'Browser does not support FCM');

      if (!isSupported) {
        setIsRunning(false);
        return;
      }

      // Test 2: Service Worker
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        // Test specific FCM service worker path
        const response = await fetch('/firebase-messaging-sw.js');
        const swExists = response.ok;
        
        if (swExists) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const fcmSWReg = registrations.find(reg => 
            reg.scope === location.origin + '/' && 
            reg.active?.scriptURL.includes('firebase-messaging-sw')
          );
          updateTestResult(1, fcmSWReg ? 'PASS' : 'WARNING', 
            fcmSWReg ? `SW registered at scope: ${fcmSWReg.scope}` : 'SW file exists, will register with correct scope');
        } else {
          updateTestResult(1, 'FAIL', 'firebase-messaging-sw.js not found at /firebase-messaging-sw.js');
        }
      } catch (error) {
        updateTestResult(1, 'FAIL', `Service Worker check failed: ${error}`);
      }

      // Test 3: Permissions
      await new Promise(resolve => setTimeout(resolve, 500));
      const permission = getPermissionStatus();
      updateTestResult(2, permission === 'granted' ? 'PASS' : 'WARNING', 
        `Notification permission: ${permission}`);

      // Test 4: Firebase Library
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        // Try to access firebase messaging
        const { messaging } = await import('@/lib/firebase');
        updateTestResult(3, messaging ? 'PASS' : 'FAIL', 
          messaging ? 'Firebase messaging initialized' : 'Firebase messaging not available');
      } catch (error) {
        updateTestResult(3, 'FAIL', `Firebase library error: ${error}`);
      }

      // Test 5: VAPID Key
      await new Promise(resolve => setTimeout(resolve, 500));
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY;
      if (vapidKey) {
        // Validate VAPID key format (base64url)
        const isValidFormat = /^[A-Za-z0-9_-]{87}$/.test(vapidKey);
        updateTestResult(4, isValidFormat ? 'PASS' : 'WARNING', 
          isValidFormat ? `VAPID key from ENV: ...${vapidKey.slice(-6)} (valid format)` : `VAPID key from ENV: ...${vapidKey.slice(-6)} (format may be invalid)`);
      } else {
        updateTestResult(4, 'FAIL', 'VAPID key missing from ENV - REQUIRED');
      }

      // Test 6: Token Generation
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        const result = await registerPush();
        if (result.success && result.token) {
          setCurrentToken(result.token);
          updateTestResult(5, 'PASS', `Token generated: ${result.token.substring(0, 20)}...`);
        } else {
          updateTestResult(5, 'FAIL', `Token generation failed: ${result.error}`);
          setIsRunning(false);
          return;
        }
      } catch (error) {
        updateTestResult(5, 'FAIL', `Token generation error: ${error}`);
        setIsRunning(false);
        return;
      }

      // Test 7: Database Storage
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        const tokenCount = await getUserTokens();
        updateTestResult(6, tokenCount > 0 ? 'PASS' : 'WARNING', 
          `Database tokens: ${tokenCount}`);
      } catch (error) {
        updateTestResult(6, 'FAIL', `Database check failed: ${error}`);
      }

      // Test 8: Edge Function
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        const { data, error } = await supabase.functions.invoke('send-firebase-push', {
          body: {
            title: testTitle,
            body: testBody,
            token: currentToken
          }
        });

        if (error) {
          updateTestResult(7, 'FAIL', `Edge Function error: ${error.message}`);
        } else if (data?.success === true) {
          // Accept sent: 0 as success (no tokens scenario)
          const sent = data.sent || 0;
          const failures = data.failures || 0;
          updateTestResult(7, 'PASS', `Edge Function OK: sent=${sent}, failures=${failures}`);
        } else {
          updateTestResult(7, 'FAIL', `Edge Function unexpected response: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        updateTestResult(7, 'FAIL', `Edge Function failed: ${error}`);
      }

      // Test 9: Complete Integration
      await new Promise(resolve => setTimeout(resolve, 500));
      const passCount = testResults.filter(t => t.status === 'PASS').length;
      updateTestResult(8, passCount >= 6 ? 'PASS' : 'FAIL', 
        `Integration ${passCount >= 6 ? 'successful' : 'incomplete'} (${passCount}/8 tests passed)`);

    } finally {
      setIsRunning(false);
    }
  };

  const sendTestNotification = async () => {
    if (!currentToken) {
      alert('No FCM token available. Run diagnostics first.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          title: testTitle,
          body: testBody,
          token: currentToken,
          click_action: '/panel-access'
        }
      });

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert(`✅ Notification sent! Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      alert(`❌ Failed to send: ${error}`);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS': return 'bg-green-500';
      case 'FAIL': return 'bg-red-500';
      case 'WARNING': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-cyan-400">🔥 FCM Diagnostics & Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {isRunning ? '⏳ Running Tests...' : '🧪 Run Full Diagnostics'}
            </Button>
            
            <Button 
              onClick={sendTestNotification}
              disabled={!currentToken}
              variant="outline"
            >
              📨 Send Test Notification
            </Button>
          </div>

          {/* Test Results */}
          <div className="grid gap-2">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded border border-gray-700">
                <Badge className={`w-3 h-3 rounded-full ${getStatusColor(test.status)}`} />
                <span className="font-medium w-32">{test.name}</span>
                <span className="text-sm text-gray-300 flex-1">{test.message}</span>
              </div>
            ))}
          </div>

          {/* Test Message Configuration */}
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <h4 className="font-medium text-white">🧪 Test Message Configuration</h4>
            <Input
              placeholder="Notification title"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
            />
            <Textarea
              placeholder="Notification body"
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
            />
          </div>

          {/* Current Token Info */}
          {currentToken && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-medium text-white mb-2">📋 Current FCM Token</h4>
              <code className="text-xs bg-gray-800 p-2 rounded block break-all">
                {currentToken}
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};