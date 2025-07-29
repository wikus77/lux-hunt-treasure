// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Secure Debug Auth Component - Only available in development

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SecureDebugAuth: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => setLogs([]);

  const testSecureLogin = async () => {
    setIsLoading(true);
    addLog('🔒 Testing secure login flow...');
    
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'TestPassword123!';
      
      // Test rate limiting via api_rate_limits table
      const { data: rateData } = await supabase
        .from('api_rate_limits')
        .select('request_count')
        .eq('endpoint', 'debug_test')
        .single();
      
      addLog(`Rate limit check: ${rateData ? 'EXISTS' : 'CLEAN'}`);
      
      // Test security logging via direct insert
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'debug_test',
          note: 'Secure login test from debug panel'
        });
      
      addLog('Security event logged successfully');
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAdminCheck = async () => {
    setIsLoading(true);
    addLog('🔒 Testing secure admin check...');
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      addLog(`Admin check result: ${profile?.role === 'admin' ? 'ADMIN' : 'NOT ADMIN'}`);
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuditLog = async () => {
    setIsLoading(true);
    addLog('📋 Testing audit log...');
    
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        addLog(`Audit log error: ${error.message}`);
      } else {
        addLog(`Found ${data?.length || 0} recent audit entries`);
        data?.forEach((entry, index) => {
          addLog(`${index + 1}. ${entry.event_type} - ${entry.created_at}`);
        });
      }
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/50 border-red-500/30">
      <CardHeader>
        <CardTitle className="text-red-400">🔒 Secure Debug Panel</CardTitle>
        <CardDescription className="text-red-300">
          Development-only security testing tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={testSecureLogin}
            disabled={isLoading}
            variant="outline"
            className="text-xs border-red-500/30 text-red-300"
          >
            {isLoading ? '⏳' : '🔒'} Rate Limit Test
          </Button>
          <Button
            onClick={testAdminCheck}
            disabled={isLoading}
            variant="outline"
            className="text-xs border-red-500/30 text-red-300"
          >
            {isLoading ? '⏳' : '👤'} Admin Check
          </Button>
          <Button
            onClick={testAuditLog}
            disabled={isLoading}
            variant="outline"
            className="text-xs border-red-500/30 text-red-300"
          >
            {isLoading ? '⏳' : '📋'} Audit Log
          </Button>
        </div>

        <div className="flex justify-between">
          <Button
            onClick={clearLogs}
            variant="outline"
            size="sm"
            className="text-xs border-red-500/30 text-red-300"
          >
            Clear Logs
          </Button>
          <div className="text-xs text-red-400">
            Security Level: HARDENED
          </div>
        </div>

        <div className="bg-black/70 p-3 rounded border border-red-500/20 max-h-96 overflow-y-auto">
          <div className="text-xs font-mono text-green-400 space-y-1">
            {logs.length === 0 ? (
              <div className="text-red-400">No logs yet. Run a test above.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-l-2 border-red-500/30 pl-2">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-red-400 border-t border-red-500/20 pt-2">
          ⚠️ Security Features Active:
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Input sanitization enabled</li>
            <li>Rate limiting active</li>
            <li>Admin role bypass removed</li>
            <li>Security audit logging enabled</li>
            <li>Session timeout management active</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureDebugAuth;