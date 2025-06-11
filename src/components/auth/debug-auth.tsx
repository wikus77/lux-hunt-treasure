
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

const DebugAuth = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const testImprovedLogin = async () => {
    setIsLoading(true);
    addLog('🔐 TESTING IMPROVED LOGIN BYPASS');
    
    try {
      const result = await login('wikus77@hotmail.it', 'mission-access-99');
      
      addLog('📤 IMPROVED LOGIN RESULT:');
      addLog(`✅ Success: ${result.success}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      addLog(`🔑 Session: ${result.session ? 'Present' : 'null'}`);
      
      if (result.success) {
        addLog('🎉 LOGIN SUCCESS - REDIRECTING TO HOME');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        addLog(`🚨 LOGIN FAILED: ${result.error?.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      addLog(`💥 LOGIN EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const forceDirectAccess = async () => {
    setIsLoading(true);
    addLog('🚨 FORCE DIRECT ACCESS ATTEMPT');
    
    try {
      // Tenta di impostare una sessione manualmente per accesso diretto
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        addLog('✅ EXISTING SESSION FOUND - REDIRECTING');
        navigate('/home');
        return;
      }
      
      addLog('🔄 NO SESSION FOUND - TRYING BYPASS LOGIN');
      
      const { data, error } = await supabase.functions.invoke('register-bypass', {
        body: {
          email: 'wikus77@hotmail.it',
          password: 'mission-access-99',
          action: 'login'
        }
      });
      
      if (error) {
        addLog(`❌ FORCE ACCESS FAILED: ${error.message}`);
        return;
      }
      
      if (data?.success && data?.magicLink) {
        addLog('🔗 MAGIC LINK RECEIVED - AUTO REDIRECTING');
        window.location.href = data.magicLink;
      } else {
        addLog('❌ NO MAGIC LINK RECEIVED');
      }
      
    } catch (error: any) {
      addLog(`💥 FORCE ACCESS EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSupabaseConfig = async () => {
    setIsLoading(true);
    addLog('🔧 CHECKING SUPABASE CONFIG');
    
    try {
      addLog('URL: https://vkjrqirvdvjbemsfzxof.supabase.co');
      addLog('Key: eyJhbGciOiJIUzI1NiIs... (truncated)');
      
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      addLog(`📋 Current Session: ${session.session ? 'Active' : 'None'}`);
      
      if (sessionError) {
        addLog(`❌ Session Error: ${sessionError.message}`);
      }
      
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4">
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
          onClick={testImprovedLogin} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
        >
          {isLoading ? '⏳' : '🔐'} IMPROVED LOGIN
        </Button>

        <Button 
          onClick={forceDirectAccess} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
        >
          {isLoading ? '⏳' : '🚨'} FORCE ACCESS
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
      
      <div className="mt-4 text-center">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
        <span className="text-white/70 text-sm">
          {isLoading ? 'Running diagnostics...' : 'Ready for testing - TRY IMPROVED LOGIN OR FORCE ACCESS!'}
        </span>
      </div>
      
      <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded">
        <h4 className="text-cyan-400 font-bold mb-2">🚀 ACCESSO IMMEDIATO</h4>
        <p className="text-cyan-300 text-sm">
          Clicca "IMPROVED LOGIN" per il nuovo sistema di autenticazione bypass oppure "FORCE ACCESS" per accesso immediato tramite magic link!
        </p>
      </div>
    </div>
  );
};

export default DebugAuth;
