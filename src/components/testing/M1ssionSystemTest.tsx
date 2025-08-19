// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const M1ssionSystemTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const updateTest = (name: string, update: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...update } : test
    ));
  };

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const runSystemTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTests([]);

    // Test 1: Geolocation
    addTest({ name: 'Geolocation', status: 'pending', message: 'Testing geolocation services...' });
    try {
      if (!navigator.geolocation) {
        updateTest('Geolocation', { 
          status: 'error', 
          message: 'Geolocation not supported',
          details: 'Browser does not support geolocation API'
        });
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          });
        });
        
        updateTest('Geolocation', { 
          status: 'success', 
          message: `Location acquired (±${Math.round(position.coords.accuracy)}m)`,
          details: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        });
      }
    } catch (error: any) {
      updateTest('Geolocation', { 
        status: 'warning', 
        message: 'Using fallback location',
        details: { error: error.message, code: error.code }
      });
    }

    // Test 2: Database Connection
    addTest({ name: 'Database', status: 'pending', message: 'Testing Supabase connection...' });
    try {
      const { data, error } = await supabase.from('app_config').select('key').limit(1);
      if (error) throw error;
      
      updateTest('Database', { 
        status: 'success', 
        message: 'Database connection successful',
        details: { recordsFound: data?.length || 0 }
      });
    } catch (error: any) {
      updateTest('Database', { 
        status: 'error', 
        message: 'Database connection failed',
        details: { error: error.message }
      });
    }

    // Test 3: QR Markers
    addTest({ name: 'QR Markers', status: 'pending', message: 'Loading QR markers...' });
    try {
      const { data: buzzMarkers } = await supabase
        .from('buzz_map_markers')
        .select('id, title, latitude, longitude, active')
        .eq('active', true);
      
      const { data: qrCodes } = await supabase
        .from('qr_codes')
        .select('id, code, lat, lng, is_active')
        .eq('is_active', true);

      const totalMarkers = (buzzMarkers?.length || 0) + (qrCodes?.length || 0);
      
      updateTest('QR Markers', { 
        status: totalMarkers > 0 ? 'success' : 'warning', 
        message: `Found ${totalMarkers} active markers`,
        details: { 
          buzzMarkers: buzzMarkers?.length || 0,
          qrCodes: qrCodes?.length || 0,
          total: totalMarkers
        }
      });
    } catch (error: any) {
      updateTest('QR Markers', { 
        status: 'error', 
        message: 'Failed to load markers',
        details: { error: error.message }
      });
    }

    // Test 4: Push Notifications
    addTest({ name: 'Push Notifications', status: 'pending', message: 'Testing push notification setup...' });
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'M1SSION™ System Test',
          body: 'This is a test notification to verify the system is working correctly.'
        }
      });

      if (error) {
        updateTest('Push Notifications', { 
          status: 'error', 
          message: 'Push notification test failed',
          details: { error: error.message }
        });
      } else {
        updateTest('Push Notifications', { 
          status: 'success', 
          message: `Notification sent to ${data.sent}/${data.total} devices`,
          details: data
        });
      }
    } catch (error: any) {
      updateTest('Push Notifications', { 
        status: 'error', 
        message: 'Push notification system error',
        details: { error: error.message }
      });
    }

    // Test 5: OneSignal Configuration
    addTest({ name: 'OneSignal Config', status: 'pending', message: 'Checking OneSignal setup...' });
    try {
      const { data: devices } = await supabase
        .from('device_tokens')
        .select('token, device_type')
        .eq('device_type', 'onesignal');

      const deviceCount = devices?.length || 0;
      
      updateTest('OneSignal Config', { 
        status: deviceCount > 0 ? 'success' : 'warning', 
        message: `${deviceCount} devices registered`,
        details: { 
          registeredDevices: deviceCount,
          appId: '50cb75f7-f065-4626-9a63-ce5692fa7e70'
        }
      });
    } catch (error: any) {
      updateTest('OneSignal Config', { 
        status: 'error', 
        message: 'OneSignal check failed',
        details: { error: error.message }
      });
    }

    // Test 6: Claim Reward Flow
    addTest({ name: 'Claim Flow', status: 'pending', message: 'Testing claim reward flow...' });
    try {
      // Test with a mock marker ID to check edge function availability
      const { error } = await supabase.functions.invoke('claim-marker-reward', {
        body: { markerId: 'test-marker-system-check' }
      });

      // If we get a specific error about the marker not existing, that's good - the function is working
      if (error?.message?.includes('not found') || error?.message?.includes('not exist')) {
        updateTest('Claim Flow', { 
          status: 'success', 
          message: 'Claim reward system operational',
          details: { endpoint: 'claim-marker-reward', status: 'available' }
        });
      } else if (error) {
        updateTest('Claim Flow', { 
          status: 'warning', 
          message: 'Claim system available but returned error',
          details: { error: error.message }
        });
      } else {
        updateTest('Claim Flow', { 
          status: 'success', 
          message: 'Claim reward system fully operational'
        });
      }
    } catch (error: any) {
      updateTest('Claim Flow', { 
        status: 'error', 
        message: 'Claim reward system unavailable',
        details: { error: error.message }
      });
    }

    setIsRunning(false);
    setOverallStatus('completed');
    
    // Show completion toast
    const successCount = tests.filter(t => t.status === 'success').length;
    const totalTests = tests.length;
    
    if (successCount === totalTests) {
      toast.success(`All ${totalTests} system tests passed! 🎉`);
    } else {
      toast.warning(`${successCount}/${totalTests} tests passed. Check results below.`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const calculateOverallHealth = () => {
    if (tests.length === 0) return 0;
    const successCount = tests.filter(t => t.status === 'success').length;
    const warningCount = tests.filter(t => t.status === 'warning').length;
    return Math.round(((successCount + warningCount * 0.5) / tests.length) * 100);
  };

  // Show only when explicitly requested via URL parameter
  const shouldShow = new URLSearchParams(window.location.search).get('test') === '1' ||
                    localStorage.getItem('m1ssion_system_test') === '1';

  if (!shouldShow) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/95 text-white p-6 rounded-lg border border-gray-700 shadow-xl z-[99999] max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-blue-400">M1SSION™ System Test</h2>
        {overallStatus === 'completed' && (
          <Badge variant={calculateOverallHealth() >= 80 ? 'default' : 'destructive'}>
            {calculateOverallHealth()}% Health
          </Badge>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {tests.map((test, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded">
            {getStatusIcon(test.status)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{test.name}</span>
                {getStatusBadge(test.status)}
              </div>
              <p className="text-xs text-gray-300">{test.message}</p>
              {test.details && (
                <details className="text-xs text-gray-400 mt-1">
                  <summary className="cursor-pointer">Details</summary>
                  <pre className="mt-1 p-1 bg-black/30 rounded text-xs overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={runSystemTests}
          disabled={isRunning}
          className="flex-1"
          variant={overallStatus === 'completed' ? 'outline' : 'default'}
        >
          {isRunning ? 'Testing...' : overallStatus === 'completed' ? 'Re-test' : 'Run Tests'}
        </Button>
        <Button 
          onClick={() => {
            localStorage.removeItem('m1ssion_system_test');
            window.location.reload();
          }}
          variant="outline"
          size="sm"
        >
          Close
        </Button>
      </div>

      <div className="text-xs text-gray-400 mt-3 text-center">
        ?test=1 to access system diagnostics
      </div>
    </div>
  );
};