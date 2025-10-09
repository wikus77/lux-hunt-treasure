// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Comprehensive Firebase Cloud Messaging Test System

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFCMPushNotifications } from '@/hooks/useFCMPushNotifications';
import { getFCMToken, isFCMSupported, messaging } from '@/lib/firebase';
import { CheckCircle, XCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
  duration?: number;
}

interface FCMTestReport {
  overallStatus: 'success' | 'partial' | 'failed';
  testsRun: number;
  testsSucceeded: number;
  testsFailed: number;
  recommendations: string[];
  results: TestResult[];
}

export const FCMComprehensiveTest = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<FCMTestReport | null>(null);
  const [user, setUser] = useState<any>(null);

  const fcm = useFCMPushNotifications();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    const newResult = {
      ...result,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, newResult]);
    return newResult;
  };

  const updateTestResult = (id: string, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.id === id ? { ...result, ...updates } : result
    ));
  };

  const runTest = async (
    id: string, 
    name: string, 
    testFn: () => Promise<{ status: TestResult['status'], message: string, details?: any }>
  ) => {
    const startTime = Date.now();
    setCurrentTest(name);
    
    const testResult = addTestResult({
      id,
      name,
      status: 'running',
      message: 'Test in progress...'
    });

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      updateTestResult(id, {
        ...result,
        duration,
        timestamp: new Date().toISOString()
      });

      return result.status;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(id, {
        status: 'error',
        message: `Test failed: ${error.message}`,
        details: { error: error.message, stack: error.stack },
        duration,
        timestamp: new Date().toISOString()
      });
      return 'error';
    }
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);
    setCurrentTest('');
    
    const tests = [
      {
        id: 'auth_check',
        name: '🔐 User Authentication',
        test: async () => {
          if (!user) {
            return { status: 'error' as const, message: 'User not authenticated' };
          }
          return { 
            status: 'success' as const, 
            message: 'User authenticated successfully',
            details: { userId: user.id, email: user.email }
          };
        }
      },
      {
        id: 'fcm_support',
        name: '🌐 FCM Browser Support',
        test: async () => {
          const supported = isFCMSupported();
          const details = {
            serviceWorker: 'serviceWorker' in navigator,
            notification: 'Notification' in window,
            pushManager: 'PushManager' in window,
            userAgent: navigator.userAgent,
            isHttps: location.protocol === 'https:',
            isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
          };
          
          return {
            status: supported ? 'success' as const : 'error' as const,
            message: supported ? 'Browser fully supports FCM' : 'Browser does not support FCM',
            details
          };
        }
      },
      {
        id: 'service_worker',
        name: '⚙️ Service Worker Registration',
        test: async () => {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            
            if (!registration) {
              return { status: 'error' as const, message: 'Service Worker not registered' };
            }
            
            return {
              status: 'success' as const,
              message: 'Service Worker active and registered',
              details: {
                scope: registration.scope,
                active: !!registration.active,
                installing: !!registration.installing,
                waiting: !!registration.waiting,
                updatefound: !!registration.onupdatefound
              }
            };
          } catch (error: any) {
            return { status: 'error' as const, message: `Service Worker error: ${error.message}` };
          }
        }
      },
      {
        id: 'notification_permission',
        name: '🔔 Notification Permission',
        test: async () => {
          const permission = Notification.permission;
          
          if (permission === 'granted') {
            return { status: 'success' as const, message: 'Notification permission granted' };
          } else if (permission === 'denied') {
            return { status: 'error' as const, message: 'Notification permission denied' };
          } else {
            return { status: 'warning' as const, message: 'Notification permission not requested' };
          }
        }
      },
      {
        id: 'fcm_token',
        name: '🎫 FCM Token Generation',
        test: async () => {
          try {
            const token = await getFCMToken();
            
            if (!token) {
              return { status: 'error' as const, message: 'Failed to generate FCM token' };
            }
            
            return {
              status: 'success' as const,
              message: 'FCM token generated successfully',
              details: {
                tokenLength: token.length,
                tokenPreview: token.substring(0, 30) + '...',
                tokenSuffix: '...' + token.substring(token.length - 10)
              }
            };
          } catch (error: any) {
            return { status: 'error' as const, message: `FCM token error: ${error.message}` };
          }
        }
      },
      {
        id: 'token_database',
        name: '💾 Token Database Storage',
        test: async () => {
          const { data: tokens, error } = await supabase
            .from('user_push_tokens')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);
            
          if (error) {
            return { status: 'error' as const, message: `Database error: ${error.message}` };
          }
          
          if (!tokens || tokens.length === 0) {
            return { 
              status: 'warning' as const, 
              message: 'No FCM tokens stored in database',
              details: { suggestion: 'Activate push notifications to save token' }
            };
          }
          
          return {
            status: 'success' as const,
            message: `Found ${tokens.length} active token(s) in database`,
            details: {
              tokens: tokens.map(t => ({
                created: t.created_at,
                deviceInfo: t.device_info,
                tokenPreview: t.fcm_token?.substring(0, 20) + '...'
              }))
            }
          };
        }
      },
      {
        id: 'edge_function',
        name: '🚀 Edge Function Connectivity',
        test: async () => {
          try {
            const { data, error } = await supabase.functions.invoke('send-firebase-push', {
              body: { 
                test: true,
                title: 'Connectivity Test',
                body: 'Testing edge function availability'
              }
            });
            
            if (error) {
              return { status: 'error' as const, message: `Edge function error: ${error.message}` };
            }
            
            return {
              status: 'success' as const,
              message: 'Edge function accessible and responding',
              details: { response: data }
            };
          } catch (error: any) {
            return { status: 'error' as const, message: `Connection error: ${error.message}` };
          }
        }
      },
      {
        id: 'notification_send',
        name: '📨 Live Notification Test',
        test: async () => {
          if (!user) {
            return { status: 'error' as const, message: 'Cannot send: user not authenticated' };
          }
          
          const testId = Date.now();
          const { data, error } = await supabase.functions.invoke('send-firebase-push', {
            body: {
              user_id: user.id,
              title: `🔥 M1SSION™ Test ${testId}`,
              body: `Live test notification - ${new Date().toLocaleTimeString()}`,
              data: {
                test_id: testId.toString(),
                source: 'comprehensive_test',
                timestamp: new Date().toISOString()
              }
            }
          });
          
          if (error) {
            return { status: 'error' as const, message: `Send failed: ${error.message}` };
          }
          
          if (data?.success && data?.sent_count > 0) {
            return {
              status: 'success' as const,
              message: `Notification sent successfully (${data.sent_count} delivered)`,
              details: { response: data, testId }
            };
          } else if (data?.sent_count === 0) {
            return {
              status: 'warning' as const,
              message: 'Notification sent but no tokens found',
              details: { response: data }
            };
          } else {
            return {
              status: 'error' as const,
              message: 'Send operation failed',
              details: { response: data }
            };
          }
        }
      },
      {
        id: 'admin_logs',
        name: '📝 Admin Logs Verification',
        test: async () => {
          const { data: logs, error } = await supabase
            .from('admin_logs')
            .select('*')
            .or('event_type.ilike.%firebase%,note.ilike.%firebase%,note.ilike.%FCM%')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (error) {
            return { status: 'error' as const, message: `Log query error: ${error.message}` };
          }
          
          return {
            status: logs && logs.length > 0 ? 'success' as const : 'warning' as const,
            message: logs && logs.length > 0 ? 
              `Found ${logs.length} recent Firebase log entries` : 
              'No recent Firebase activity in logs',
            details: {
              recentLogs: logs?.map(l => ({
                event: l.event_type,
                note: l.note,
                timestamp: l.created_at
              })) || []
            }
          };
        }
      }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setProgress((i / tests.length) * 100);
      await runTest(test.id, test.name, test.test);
      
      // Small delay between tests for UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setProgress(100);
    setCurrentTest('');
    
    // Generate report
    const results = testResults;
    const succeeded = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    const recommendations: string[] = [];
    
    if (results.find(r => r.id === 'notification_permission' && r.status !== 'success')) {
      recommendations.push('Activate push notifications to grant permission');
    }
    if (results.find(r => r.id === 'token_database' && r.status !== 'success')) {
      recommendations.push('Save FCM token to database by enabling notifications');
    }
    if (results.find(r => r.id === 'fcm_token' && r.status !== 'success')) {
      recommendations.push('Check Firebase VAPID key configuration');
    }
    if (results.find(r => r.id === 'service_worker' && r.status !== 'success')) {
      recommendations.push('Ensure service worker is properly registered');
    }
    
    const overallStatus = failed > 0 ? 'failed' : warnings > 0 ? 'partial' : 'success';
    
    setReport({
      overallStatus,
      testsRun: tests.length,
      testsSucceeded: succeeded,
      testsFailed: failed,
      recommendations,
      results
    });
    
    setIsRunning(false);
    
    // Log comprehensive test completion
    await supabase
      .from('admin_logs')
      .insert({
        event_type: 'firebase_comprehensive_test_completed',
        user_id: user?.id,
        note: `FCM comprehensive test completed: ${succeeded}/${tests.length} tests passed`,
        context: 'firebase_testing'
      });
      
    toast.success(`FCM comprehensive test completed: ${succeeded}/${tests.length} tests passed`);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Zap className="h-5 w-5" />
            FCM Comprehensive Testing System
            <Badge variant="outline" className="bg-primary/10">
              Complete Pipeline Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runComprehensiveTest}
              disabled={isRunning || !user}
              className="flex-1"
              size="lg"
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run Complete FCM Test Suite'}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {report && (
            <Alert className={`border-2 ${
              report.overallStatus === 'success' ? 'border-green-200 bg-green-50' :
              report.overallStatus === 'partial' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    📊 Test Report: {report.overallStatus.toUpperCase()}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>✅ Passed: {report.testsSucceeded}</div>
                    <div>❌ Failed: {report.testsFailed}</div>
                    <div>⚠️ Warnings: {report.testsRun - report.testsSucceeded - report.testsFailed}</div>
                  </div>
                  {report.recommendations.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium">🎯 Recommendations:</div>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={result.id} className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.name}</span>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                        {result.duration && (
                          <Badge variant="outline" className="text-xs">
                            {result.duration}ms
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mb-2">
                            View Technical Details
                          </summary>
                          <pre className="p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};