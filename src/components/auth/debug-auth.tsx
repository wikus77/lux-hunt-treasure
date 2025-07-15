
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

  const testEnhancedSessionDiagnostic = async () => {
    setIsLoading(true);
    addLog('🔍 ENHANCED SESSION DIAGNOSTIC STARTING');
    
    try {
      // Check current session state
      const { data: { session } } = await supabase.auth.getSession();
      addLog('📊 CURRENT SESSION STATE:');
      addLog(`✅ Session: ${session ? 'Present' : 'null'}`);
      addLog(`✅ User: ${session?.user?.email || 'null'}`);
      addLog(`✅ Access Token: ${session?.access_token ? 'Present' : 'null'}`);
      addLog(`✅ Refresh Token: ${session?.refresh_token ? 'Present' : 'null'}`);
      
      // Check localStorage
      const tokenStorage = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
      addLog(`📦 LOCAL STORAGE TOKEN: ${tokenStorage ? 'Present' : 'Missing'}`);
      
      if (tokenStorage) {
        try {
          const parsedToken = JSON.parse(tokenStorage);
          addLog(`🔍 TOKEN DETAILS: ${JSON.stringify({
            access_token: parsedToken.access_token ? 'Present' : 'Missing',
            refresh_token: parsedToken.refresh_token ? 'Present' : 'Missing',
            expires_at: parsedToken.expires_at || 'Missing'
          })}`);
        } catch (e) {
          addLog(`❌ TOKEN PARSE ERROR: ${e}`);
        }
      }
      
    } catch (error: any) {
      addLog(`💥 DIAGNOSTIC EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testStandardLogin = async () => {
    setIsLoading(true);
    addLog('🔐 TESTING STANDARD LOGIN - wikus77@hotmail.it');
    
    try {
      // Test with new strong password
      const result = await login('wikus77@hotmail.it', 'Wikus190877!@#');
      
      addLog('📤 STANDARD LOGIN RESULT:');
      addLog(`✅ Success: ${result.success}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      addLog(`🔑 Session: ${result.session ? 'Present' : 'null'}`);
      
      if (result.success) {
        addLog('🎉 LOGIN SUCCESS - CHECKING PERSISTENCE...');
        
        // Enhanced verification with multiple checks
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          const tokenStorage = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
          
          addLog(`🔍 POST-LOGIN SESSION: ${session?.user?.email || 'Missing'}`);
          addLog(`📦 POST-LOGIN TOKEN: ${tokenStorage ? 'Present' : 'Missing'}`);
          
          if (session) {
            addLog('✅ SESSION PERSISTED - NAVIGATING TO /home');
            navigate('/home');
          } else {
            addLog('❌ SESSION NOT PERSISTED - PERSISTENCE FAILURE');
          }
        }, 1500);
      } else {
        addLog(`🚨 LOGIN FAILED: ${result.error?.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      addLog(`💥 LOGIN EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordReset = async () => {
    setIsLoading(true);
    addLog('🔄 TESTING PASSWORD RESET FOR DEVELOPER');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail('wikus77@hotmail.it', {
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) {
        addLog(`❌ PASSWORD RESET FAILED: ${error.message}`);
      } else {
        addLog('✅ PASSWORD RESET EMAIL SENT');
      }
      
    } catch (error: any) {
      addLog(`💥 PASSWORD RESET EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectSignUp = async () => {
    setIsLoading(true);
    addLog('🔍 TESTING DIRECT DEVELOPER SIGNUP WITH STRONG PASSWORD');
    
    try {
      const result = await supabase.auth.signUp({
        email: 'wikus77@hotmail.it',
        password: 'Wikus190877!@#',
        options: {
          emailRedirectTo: window.location.origin + '/auth',
        }
      });
      
      addLog('📤 DEVELOPER SIGNUP RESULT:');
      addLog(`✅ Data: ${JSON.stringify(result.data, null, 2)}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      addLog(`👤 User: ${result.data.user ? 'Present' : 'null'}`);
      addLog(`🔑 Session: ${result.data.session ? 'Present' : 'null'}`);
      
      if (result.error) {
        addLog(`🚨 ERROR CODE: ${result.error.message}`);
        addLog(`🚨 ERROR STATUS: ${result.error.status}`);
        
        if (result.error.message.includes('already registered')) {
          addLog('✅ USER ALREADY EXISTS - THIS IS EXPECTED');
        }
      } else {
        addLog('🎉 SIGNUP SUCCESS');
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
      addLog('URL: https://vkjrqirvdvjbemsfzxof.supabase.co');
      addLog('Key: eyJhbGciOiJIUzI1NiIs... (truncated)');
      addLog(`Current Origin: ${window.location.origin}`);
      
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
      <h3 className="text-red-400 font-bold mb-4">🔧 ENHANCED AUTH DEBUG CONSOLE</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <Button 
          onClick={checkSupabaseConfig} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
        >
          {isLoading ? '⏳' : '🔧'} Config
        </Button>
        
        <Button 
          onClick={testDirectSignUp} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-orange-400 border-orange-400 hover:bg-orange-400/10"
        >
          {isLoading ? '⏳' : '🧪'} SignUp Test
        </Button>
        
        <Button 
          onClick={testEnhancedSessionDiagnostic} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-purple-400 border-purple-400 hover:bg-purple-400/10"
        >
          {isLoading ? '⏳' : '🔍'} SESSION CHECK
        </Button>

        <Button 
          onClick={testStandardLogin} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
        >
          {isLoading ? '⏳' : '🔐'} STANDARD LOGIN
        </Button>

        <Button 
          onClick={testPasswordReset} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
        >
          {isLoading ? '⏳' : '🔄'} PWD RESET
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
          {isLoading ? 'Running enhanced auth tests...' : 'Ready - Enhanced debugging active!'}
        </span>
      </div>
      
      <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded">
        <h4 className="text-cyan-400 font-bold mb-2">🔧 ENHANCED LOGIN SYSTEM</h4>
        <p className="text-cyan-300 text-sm">
          ✅ AUTHENTICATION: Enhanced Supabase email/password<br/>
          ✅ DEVELOPER ACCESS: Strong password with special characters<br/>
          ✅ SESSION HANDLING: Enhanced session management<br/>
          ✅ ROLE SYSTEM: Developer role integration<br/>
          ✅ COMPATIBILITY: Cross-platform support<br/>
          ✅ DEBUGGING: Enhanced logging and diagnostics<br/>
          ➡️ New password: Wikus190877!@# (with special characters)
        </p>
      </div>
    </div>
  );
};

export default DebugAuth;
