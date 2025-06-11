
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const DebugAuth = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testDirectSignUp = async () => {
    setIsLoading(true);
    addLog('🔍 STARTING DIRECT SUPABASE TEST');
    
    try {
      const result = await supabase.auth.signUp({
        email: 'wikus77@hotmail.it',
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: window.location.origin + '/auth',
        }
      });
      
      addLog('📤 DIRECT SUPABASE RESULT:');
      addLog(`✅ Data: ${JSON.stringify(result.data, null, 2)}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      addLog(`👤 User: ${result.data.user ? 'Present' : 'null'}`);
      addLog(`🔑 Session: ${result.data.session ? 'Present' : 'null'}`);
      
      if (result.error) {
        addLog(`🚨 ERROR CODE: ${result.error.message}`);
        addLog(`🚨 ERROR STATUS: ${result.error.status}`);
        
        // Check if it's a CAPTCHA error
        if (result.error.message.includes('captcha')) {
          addLog('🛡️ CAPTCHA VERIFICATION REQUIRED - SUPABASE SERVER-SIDE ENABLED');
        }
      } else {
        addLog('🎉 SIGNUP SUCCESS - NO CAPTCHA BLOCKING');
      }
      
    } catch (error: any) {
      addLog(`💥 EXCEPTION: ${error.message || error}`);
      addLog(`📊 FULL ERROR: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSupabaseConfig = async () => {
    setIsLoading(true);
    addLog('🔧 CHECKING SUPABASE CONFIG');
    
    try {
      // Test basic connection
      addLog('URL: https://vkjrqirvdvjbemsfzxof.supabase.co');
      addLog('Key: eyJhbGciOiJIUzI1NiIs... (truncated)');
      
      // Test auth session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      addLog(`📋 Current Session: ${session.session ? 'Active' : 'None'}`);
      
      if (sessionError) {
        addLog(`❌ Session Error: ${sessionError.message}`);
      }
      
      // Test a simple query to verify connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        addLog(`🔴 CONNECTION TEST FAILED: ${error.message}`);
        if (error.message.includes('relation') || error.message.includes('table')) {
          addLog('⚠️ Table not found - normal for new project');
        }
      } else {
        addLog('🟢 CONNECTION TEST PASSED');
      }
      
    } catch (error: any) {
      addLog(`💥 CONFIG CHECK EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCaptchaStatus = async () => {
    setIsLoading(true);
    addLog('🛡️ TESTING CAPTCHA STATUS');
    
    try {
      // Try to sign up with a test email to see if CAPTCHA is required
      const testResult = await supabase.auth.signUp({
        email: 'test-captcha-check@example.com',
        password: 'TestPassword123!'
      });
      
      if (testResult.error) {
        if (testResult.error.message.includes('captcha')) {
          addLog('🔴 CAPTCHA IS ENABLED ON SUPABASE SERVER');
          addLog('🛠️ SOLUTION: Disable CAPTCHA in Supabase Dashboard > Auth > Settings');
        } else {
          addLog(`⚠️ OTHER AUTH ERROR: ${testResult.error.message}`);
        }
      } else {
        addLog('🟢 CAPTCHA NOT BLOCKING - SIGNUP WORKS');
      }
      
    } catch (error: any) {
      addLog(`💥 CAPTCHA TEST EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6">
      <h3 className="text-red-400 font-bold mb-4">🔧 DEBUG AUTH CONSOLE</h3>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <Button 
          onClick={checkSupabaseConfig} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
        >
          {isLoading ? '⏳' : '🔧'} Check Config
        </Button>
        
        <Button 
          onClick={testDirectSignUp} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
        >
          {isLoading ? '⏳' : '🧪'} Test SignUp
        </Button>
        
        <Button 
          onClick={testCaptchaStatus} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
        >
          {isLoading ? '⏳' : '🛡️'} Test CAPTCHA
        </Button>
      </div>

      {/* Clear Logs Button */}
      <div className="mb-4">
        <Button 
          onClick={clearLogs} 
          variant="outline" 
          size="sm"
          className="text-gray-400 border-gray-400 hover:bg-gray-400/10"
        >
          🗑️ Clear Logs
        </Button>
      </div>

      {/* Live Logs Display */}
      {logs.length > 0 && (
        <div className="bg-black/50 p-3 rounded border max-h-64 overflow-y-auto">
          <div className="text-green-400 font-mono text-xs space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="break-words">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
        <span className="text-white/70 text-sm">
          {isLoading ? 'Running diagnostics...' : 'Ready for testing'}
        </span>
      </div>
    </div>
  );
};

export default DebugAuth;
