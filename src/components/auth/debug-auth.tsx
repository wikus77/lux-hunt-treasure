
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const DebugAuth = () => {
  const testDirectSignUp = async () => {
    console.log('🔍 STARTING DIRECT SUPABASE TEST');
    
    try {
      const result = await supabase.auth.signUp({
        email: 'wikus77@hotmail.it',
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: window.location.origin + '/auth',
        }
      });
      
      console.log('📤 DIRECT SUPABASE RESULT:');
      console.log('✅ Data:', result.data);
      console.log('❌ Error:', result.error);
      console.log('👤 User:', result.data.user);
      console.log('🔑 Session:', result.data.session);
      
      if (result.error) {
        console.log('🚨 ERROR CODE:', result.error.message);
        console.log('🚨 ERROR STATUS:', result.error.status);
      }
      
    } catch (error) {
      console.log('💥 EXCEPTION:', error);
    }
  };

  const checkSupabaseConfig = () => {
    console.log('🔧 SUPABASE CONFIG:');
    console.log('URL:', supabase.supabaseUrl);
    console.log('Key:', supabase.supabaseKey.substring(0, 20) + '...');
  };

  return (
    <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
      <h3 className="text-red-400 font-bold mb-4">DEBUG AUTH BLOCKER</h3>
      <div className="space-y-2">
        <Button onClick={checkSupabaseConfig} variant="outline" size="sm">
          Check Supabase Config
        </Button>
        <Button onClick={testDirectSignUp} variant="outline" size="sm">
          Test Direct SignUp
        </Button>
      </div>
    </div>
  );
};

export default DebugAuth;
