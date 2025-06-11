import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

const DebugAuth = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { login, forceDirectAccess } = useAuth();
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

  const testEnhancedLogin = async () => {
    setIsLoading(true);
    addLog('🔐 ENHANCED LOGIN TEST STARTING');
    
    try {
      const result = await login('wikus77@hotmail.it', 'mission-access-99');
      
      addLog('📤 ENHANCED LOGIN RESULT:');
      addLog(`✅ Success: ${result.success}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      addLog(`🔑 Session: ${result.session ? 'Present' : 'null'}`);
      
      if (result.success) {
        addLog('🎉 ENHANCED LOGIN SUCCESS - CHECKING PERSISTENCE...');
        
        // Enhanced verification with multiple checks
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          const tokenStorage = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
          
          addLog(`🔍 POST-LOGIN SESSION: ${session?.user?.email || 'Missing'}`);
          addLog(`📦 POST-LOGIN TOKEN: ${tokenStorage ? 'Present' : 'Missing'}`);
          
          if (session) {
            addLog('✅ ENHANCED SESSION PERSISTED - NAVIGATING TO /home');
            navigate('/home');
          } else {
            addLog('❌ ENHANCED SESSION NOT PERSISTED - PERSISTENCE FAILURE');
          }
        }, 1500);
      } else {
        addLog(`🚨 ENHANCED LOGIN FAILED: ${result.error?.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      addLog(`💥 ENHANCED LOGIN EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEnhancedForceAccess = async () => {
    setIsLoading(true);
    addLog('🚨 ENHANCED FORCE ACCESS TEST STARTING');
    
    try {
      const result = await forceDirectAccess('wikus77@hotmail.it', 'mission-access-99');
      
      addLog('📤 ENHANCED FORCE ACCESS RESULT:');
      addLog(`✅ Success: ${result.success}`);
      addLog(`🔗 Redirect URL: ${result.redirectUrl || 'None'}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      
      if (result.success) {
        addLog(`🚀 ENHANCED FORCE ACCESS SUCCESS`);
        
        if (result.redirectUrl === '/home') {
          addLog('🔄 ENHANCED PROGRAMMATIC NAVIGATION TO /home');
          
          // Enhanced verification before redirect
          setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const tokenStorage = localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token');
            
            addLog(`🔍 PRE-REDIRECT SESSION: ${session?.user?.email || 'Missing'}`);
            addLog(`📦 PRE-REDIRECT TOKEN: ${tokenStorage ? 'Present' : 'Missing'}`);
            
            if (session) {
              addLog('✅ ENHANCED SESSION CONFIRMED - SAFE TO NAVIGATE');
              navigate('/home');
            } else {
              addLog('⚠️ ENHANCED SESSION MISSING - WILL USE MAGIC LINK');
            }
          }, 750);
        } else {
          addLog(`🔗 ENHANCED MAGIC LINK REDIRECT TO: ${result.redirectUrl}`);
        }
      } else {
        addLog(`🚨 ENHANCED FORCE ACCESS FAILED: ${result.error?.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      addLog(`💥 ENHANCED FORCE ACCESS EXCEPTION: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
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
        addLog('🎉 LOGIN SUCCESS - CHECKING SESSION PERSISTENCE...');
        
        // CRITICAL: Wait and verify session persistence
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          addLog(`🔍 SESSION AFTER LOGIN: ${session?.user?.email || 'Missing'}`);
          addLog(`📦 LOCAL STORAGE TOKEN: ${localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token') ? 'Present' : 'Missing'}`);
          
          if (session) {
            addLog('✅ Session persisted - navigating to /home');
            navigate('/home');
          } else {
            addLog('❌ Session not persisted - potential race condition');
          }
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

  const testForceDirectAccess = async () => {
    setIsLoading(true);
    addLog('🚨 TESTING FORCE DIRECT ACCESS - IMPROVED PERSISTENCE');
    
    try {
      const result = await forceDirectAccess('wikus77@hotmail.it', 'mission-access-99');
      
      addLog('📤 FORCE ACCESS RESULT:');
      addLog(`✅ Success: ${result.success}`);
      addLog(`🔗 Redirect URL: ${result.redirectUrl || 'None'}`);
      addLog(`❌ Error: ${JSON.stringify(result.error, null, 2)}`);
      
      if (result.success) {
        addLog(`🚀 FORCE ACCESS SUCCESS`);
        
        // CRITICAL: If we have a programmatic redirect (not magic link), use navigate
        if (result.redirectUrl === '/home') {
          addLog('🔄 Using programmatic navigation to /home');
          
          // Additional verification before redirect
          setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            addLog(`🔍 PRE-REDIRECT SESSION CHECK: ${session?.user?.email || 'Missing'}`);
            addLog(`📦 PRE-REDIRECT TOKEN CHECK: ${localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token') ? 'Present' : 'Missing'}`);
            
            if (session) {
              addLog('✅ Session confirmed - safe to navigate');
              navigate('/home');
            } else {
              addLog('⚠️ Session missing - will redirect via magic link');
            }
          }, 500);
        } else {
          addLog(`🔗 MAGIC LINK REDIRECT TO: ${result.redirectUrl}`);
          // Magic link redirect is handled in the function
        }
      } else {
        addLog(`🚨 FORCE ACCESS FAILED: ${result.error?.message || 'Unknown error'}`);
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
      <h3 className="text-red-400 font-bold mb-4">🔧 ENHANCED DEBUG AUTH CONSOLE</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-4">
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
          onClick={testEnhancedLogin} 
          variant="outline" 
          size="sm" 
          disabled={isLoading}
          className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
        >
          {isLoading ? '⏳' : '🔐'} ENHANCED LOGIN
        </Button>

        <Button 
          onClick={testEnhancedForceAccess} 
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
          {isLoading ? 'Running enhanced session persistence checks...' : 'Ready - Enhanced session handling active!'}
        </span>
      </div>
      
      <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded">
        <h4 className="text-cyan-400 font-bold mb-2">🔧 ENHANCED SESSION FIX APPLICATO</h4>
        <p className="text-cyan-300 text-sm">
          ✅ PERSISTENCE: Enhanced session validation & recovery<br/>
          ✅ TIMING: Extended verification delays (1500ms)<br/>
          ✅ FALLBACK: Intelligent magic link backup<br/>
          ✅ LOGGING: Comprehensive diagnostic data<br/>
          ✅ VERIFICATION: Multi-point session checks<br/>
          ➡️ Clicca "ENHANCED LOGIN" o "FORCE ACCESS" per test!
        </p>
      </div>
    </div>
  );
};

export default DebugAuth;
