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
        email: 'test-captcha-check@example.com',
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

  const testBypassRegistration = async () => {
    setIsLoading(true);
    addLog('🚀 TESTING BYPASS REGISTRATION');
    
    try {
      const { data, error } = await supabase.functions.invoke('register-bypass', {
        body: {
          email: 'wikus77@hotmail.it',
          password: 'TestPassword123!',
          fullName: 'Test User',
          missionPreference: 'uomo'
        }
      });
      
      addLog('📤 BYPASS RESULT:');
      addLog(`✅ Data: ${JSON.stringify(data, null, 2)}`);
      addLog(`❌ Error: ${JSON.stringify(error, null, 2)}`);
      
      if (error) {
        addLog(`🚨 BYPASS FAILED: ${error.message}`);
      } else if (data?.success) {
        addLog('🎉 BYPASS REGISTRATION SUCCESS');
        if (data.requireManualLogin) {
          addLog('ℹ️ Manual login required after bypass');
        }
      }
      
    } catch (error: any) {
      addLog(`💥 BYPASS EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLoginBypass = async () => {
    setIsLoading(true);
    addLog('🔐 TESTING LOGIN BYPASS');
    
    try {
      const { data, error } = await supabase.functions.invoke('register-bypass', {
        body: {
          email: 'wikus77@hotmail.it',
          password: 'mission-access-99', // o la password corretta
          action: 'login'
        }
      });
      
      addLog('📤 LOGIN BYPASS RESULT:');
      addLog(`✅ Data: ${JSON.stringify(data, null, 2)}`);
      addLog(`❌ Error: ${JSON.stringify(error, null, 2)}`);
      
      if (error) {
        addLog(`🚨 LOGIN BYPASS FAILED: ${error.message}`);
      } else if (data?.success) {
        addLog('🎉 LOGIN BYPASS SUCCESS');
        if (data.magicLink) {
          addLog('🔗 Magic Link provided - redirecting...');
          addLog(`Magic Link: ${data.magicLink}`);
          
          // Opzione per reindirizzare automaticamente
          const shouldRedirect = confirm('Vuoi essere reindirizzato automaticamente al magic link?');
          if (shouldRedirect) {
            window.location.href = data.magicLink;
          }
        }
      }
      
    } catch (error: any) {
      addLog(`💥 LOGIN BYPASS EXCEPTION: ${error.message || error}`);
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

  return (
    <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6">
      <h3 className="text-red-400 font-bold mb-4">🔧 DEBUG AUTH CONSOLE + BYPASS LOGIN</h3>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
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
          onClick={testBypassRegistration} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-green-400 border-green-400 hover:bg-green-400/10"
        >
          {isLoading ? '⏳' : '🚀'} Test Bypass Reg
        </Button>

        <Button 
          onClick={testLoginBypass} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
        >
          {isLoading ? '⏳' : '🔐'} BYPASS LOGIN
        </Button>

        <Button 
          onClick={clearLogs} 
          variant="outline" 
          size="sm"
          className="text-gray-400 border-gray-400 hover:bg-gray-400/10"
        >
          🗑️ Clear
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
          {isLoading ? 'Running diagnostics...' : 'Ready for testing - USE BYPASS LOGIN!'}
        </span>
      </div>
      
      <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded">
        <h4 className="text-cyan-400 font-bold mb-2">🚀 ACCESSO IMMEDIATO</h4>
        <p className="text-cyan-300 text-sm">
          Clicca "BYPASS LOGIN" per accedere direttamente tramite magic link senza CAPTCHA!
        </p>
      </div>
    </div>
  );
};

export default DebugAuth;
