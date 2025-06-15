
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

export const useDeveloperSetup = () => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const ensureDeveloperUser = async () => {
    try {
      console.log('🔧 Checking developer user setup...');
      
      // Try to get current session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email === 'wikus77@hotmail.it') {
        console.log('✅ Developer user already authenticated');
        await ensureDeveloperRole(session.user.id);
        setIsSetupComplete(true);
        return;
      }

      // If not authenticated as developer, try to ensure registration exists
      await ensureDeveloperRegistration();
      setIsSetupComplete(true);
    } catch (error: any) {
      console.error('💥 Developer setup error:', error);
      // Fallback: try to register anyway
      await ensureDeveloperRegistration();
      setIsSetupComplete(true);
    } finally {
      setIsLoading(false);
    }
  };

  const ensureDeveloperRegistration = async () => {
    try {
      console.log('📝 Attempting developer user registration...');
      
      // Use a stronger password that meets Supabase requirements
      const strongPassword = 'Wikus190877!@#';
      
      const { data, error } = await supabase.auth.signUp({
        email: 'wikus77@hotmail.it',
        password: strongPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          console.log('✅ Developer user already exists');
          // Try to ensure role is assigned
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await ensureDeveloperRole(user.id);
          }
        } else {
          console.error('❌ Registration failed:', error);
        }
      } else if (data.user) {
        console.log('✅ Developer user created:', data.user.email);
        await ensureDeveloperRole(data.user.id);
      }
    } catch (error: any) {
      console.error('💥 Registration error:', error);
    }
  };

  const ensureDeveloperRole = async (userId: string) => {
    try {
      console.log('🔑 Ensuring developer role for user:', userId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'developer' })
        .select();

      if (error && !error.message.includes('duplicate')) {
        console.error('❌ Role assignment failed:', error);
      } else {
        console.log('✅ Developer role ensured');
      }
    } catch (error: any) {
      console.error('💥 Role assignment error:', error);
    }
  };

  useEffect(() => {
    ensureDeveloperUser();
  }, []);

  return { isSetupComplete, isLoading };
};
